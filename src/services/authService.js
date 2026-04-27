const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/ApiError");

const prisma = new PrismaClient();

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function signAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

function hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(userId) {
    const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const tokenHash = hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    const row = await prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
    });

    return { token, id: row.id };
}

const registerUser = async (email, password, name) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError("Invalid credentials", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401);
    }

    const accessToken = signAccessToken(user);
    const { token: refreshToken } = await issueRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
};

/**
 * Rotate refresh token: revoke the presented one, issue a new pair.
 * If a previously-revoked token is presented, treat as theft and revoke the
 * entire family for that user (RFC 6749 / OAuth BCP refresh-token reuse).
 */
const refreshTokens = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError("Refresh token required", 400);
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored) {
        throw new ApiError("Invalid refresh token", 401);
    }

    if (stored.revokedAt) {
        // Reuse of a revoked token — assume theft, revoke all of this user's tokens
        await prisma.refreshToken.updateMany({
            where: { userId: stored.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        throw new ApiError("Refresh token reuse detected", 401);
    }

    if (stored.expiresAt < new Date()) {
        throw new ApiError("Refresh token expired", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
        throw new ApiError("Invalid refresh token", 401);
    }

    const { token: newRefreshToken, id: newId } = await issueRefreshToken(user.id);

    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date(), replacedById: newId },
    });

    const accessToken = signAccessToken(user);
    return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken) => {
    if (!refreshToken) return;
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};

const logoutAll = async (userId) => {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logout,
    logoutAll,
};
