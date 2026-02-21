// ===================================================================
// REQUEST LOGGER MIDDLEWARE
// ===================================================================
// Logs every incoming HTTP request with:
//   - HTTP method (GET, POST, etc.)
//   - URL path
//   - Response status code
//   - How long the request took (in ms)
//
// This is invaluable for:
//   - Debugging slow endpoints
//   - Spotting 4xx/5xx error patterns
//   - Understanding API usage
// ===================================================================

const logger = require("../config/logger");

function requestLogger(req, res, next) {
    const start = Date.now();

    // `res.on("finish")` fires after the response is sent
    res.on("finish", () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? "warn" : "info";

        logger[level](`${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
}

module.exports = requestLogger;
