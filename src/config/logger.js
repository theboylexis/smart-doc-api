// ===================================================================
// WINSTON LOGGER — Structured logging for Smart Doc API
// ===================================================================
// Why structured logging instead of console.log?
//
// 1. LOG LEVELS: Control verbosity per environment
//    - error: Something broke (always shown)
//    - warn:  Something suspicious (always shown)
//    - info:  Normal operations (shown in production)
//    - debug: Detailed debugging (only in development)
//
// 2. JSON FORMAT in production: Makes logs searchable/parseable
//    by tools like Datadog, CloudWatch, or Grafana
//
// 3. TIMESTAMPS: Every log gets an automatic timestamp
//
// 4. CONTEXT: You can attach metadata (userId, jobId, etc.)
// ===================================================================

const { createLogger, format, transports } = require("winston");

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const logger = createLogger({
    // In production, only show info and above (skip debug)
    // In development, show everything including debug
    level: isTest ? "error" : isProduction ? "info" : "debug",

    // Define how log messages are formatted
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }), // Include stack traces for errors

        // In production: JSON (for log aggregation tools)
        // In development: Colorized, human-readable
        isProduction
            ? format.json()
            : format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, stack, ...meta }) => {
                    const metaStr = Object.keys(meta).length
                        ? ` ${JSON.stringify(meta)}`
                        : "";
                    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
                })
            )
    ),

    // Where to send logs
    transports: [new transports.Console()],

    // Don't crash the app if logging fails
    exitOnError: false,
});

module.exports = logger;
