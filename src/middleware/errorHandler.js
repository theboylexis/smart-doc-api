const errorHandler = (err, req, res, next) => {
    // Log the error (full stack in development only)
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    } else {
        console.error(err.message);
    }

    // ─── Prisma Errors ──────────────────────────────────────
    if (err.code === "P2002") {
        return res.status(409).json({
            error: `A record with that ${err.meta?.target?.join(", ") || "value"} already exists`,
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            error: "Record not found",
        });
    }

    // ─── Multer Errors ──────────────────────────────────────
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            error: "File too large. Maximum size is 10MB",
        });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            error: "Unexpected file field",
        });
    }

    // ─── JWT Errors ─────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired" });
    }

    // ─── Default ────────────────────────────────────────────
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        error: statusCode === 500 && process.env.NODE_ENV !== "development"
            ? "Internal Server Error"
            : err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;