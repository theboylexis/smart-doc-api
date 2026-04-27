const rateLimit = require("express-rate-limit");

// Rate limiters add real network latency to the test runner and don't actually
// exercise application logic, so we skip them when NODE_ENV=test.
const skipInTest = () => process.env.NODE_ENV === "test";

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many requests, please try again later" },
});

// Auth rate limiter — 10 requests per 15 minutes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many auth attempts, please try again later" },
});

// AI rate limiter — 20 requests per 15 minutes (protect OpenAI costs)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many AI requests, please try again later" },
});

module.exports = { globalLimiter, authLimiter, aiLimiter };
