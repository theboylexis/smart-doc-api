const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    const tokenValue = token.split(" ")[1];
    jwt.verify(tokenValue, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    })
}

module.exports = authMiddleware;