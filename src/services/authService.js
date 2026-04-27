const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/ApiError");
const prisma = new PrismaClient();

const registerUser = async (email, password, name) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

const loginUser = async (email, password) => {
    const userByEmail = await prisma.user.findUnique({ where: { email } });
    if (!userByEmail) {
        throw new ApiError("Invalid credentials", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, userByEmail.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401);
    }

    const token = jwt.sign(
        { id: userByEmail.id, email: userByEmail.email },
        process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = userByEmail;
    return { user: userWithoutPassword, token };
}

module.exports = { registerUser, loginUser };
