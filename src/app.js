const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// Middleware
app.use(helmet());        // Security headers
app.use(cors());          // Enable CORS
app.use(express.json());  // Parse JSON request bodies

//Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
})

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Smart Doc API' });
});

//Mounting routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

//Auth middleware
const authMiddleware = require("./middleware/authMiddleware");

// Protected routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", authMiddleware, aiRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/documents", authMiddleware, uploadRoutes);


//Protected routes
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "You are authenticated!", user: req.user });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;