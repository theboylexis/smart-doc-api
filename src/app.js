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

// Error handler middleware
app.use(errorHandler);

module.exports = app;