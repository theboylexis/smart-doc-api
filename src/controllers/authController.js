const {
    registerUser,
    loginUser,
    refreshTokens,
    logout,
    logoutAll,
} = require("../services/authService");

const registerController = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const user = await registerUser(email, password, name);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        next(error);
    }
};

const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json({ message: "User logged in successfully", result });
    } catch (error) {
        next(error);
    }
};

const refreshController = async (req, res, next) => {
    try {
        const { refreshToken } = req.body || {};
        const tokens = await refreshTokens(refreshToken);
        res.status(200).json({ message: "Tokens refreshed", ...tokens });
    } catch (error) {
        next(error);
    }
};

const logoutController = async (req, res, next) => {
    try {
        const { refreshToken } = req.body || {};
        await logout(refreshToken);
        res.status(200).json({ message: "Logged out" });
    } catch (error) {
        next(error);
    }
};

const logoutAllController = async (req, res, next) => {
    try {
        await logoutAll(req.user.id);
        res.status(200).json({ message: "Logged out from all devices" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerController,
    loginController,
    refreshController,
    logoutController,
    logoutAllController,
};
