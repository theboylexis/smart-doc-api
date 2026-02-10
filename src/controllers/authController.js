const { registerUser, loginUser } = require("../services/authService");

const registerController = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const user = await registerUser(email, password, name);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        next(error);
    }
}

const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json({ message: "User logged in successfully", result });
    } catch (error) {
        next(error);
    }
}

module.exports = { registerController, loginController };