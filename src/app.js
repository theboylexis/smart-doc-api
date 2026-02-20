const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const app = express();

// Middleware
app.use(helmet());        // Security headers
app.use(cors());          // Enable CORS
app.use(express.json());  // Parse JSON request bodies
app.use(globalLimiter);   // Global rate limit

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Smart Doc API Docs',
}));

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
app.use("/api/auth", authLimiter, authRoutes);

//Auth middleware
const authMiddleware = require("./middleware/authMiddleware");

// Protected routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", authMiddleware, aiLimiter, aiRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/documents", authMiddleware, uploadRoutes);

const webhookRoutes = require("./routes/webhookRoutes");
app.use("/api/webhooks", authMiddleware, webhookRoutes);

// Start BullMQ worker (processes analysis jobs in the background)
require("./jobs/analysisWorker");


//Protected routes
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "You are authenticated!", user: req.user });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;