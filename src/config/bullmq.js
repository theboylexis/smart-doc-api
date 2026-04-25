const IORedis = require("ioredis");
const logger = require("./logger");

// BullMQ requires a standard TCP Redis connection (not REST).
// Upstash provides both — we use the rediss:// (TLS) endpoint here.
let connection = null;

if (!process.env.REDIS_URL) {
    logger.warn("BullMQ disabled: REDIS_URL not set");
} else {
    connection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
        enableOfflineQueue: false,
    });

    let connectionErrorLogged = false;

    connection.on("connect", () => {
        connectionErrorLogged = false;
        logger.info("BullMQ Redis connected");
    });

    connection.on("error", (err) => {
        if (connectionErrorLogged) return;
        connectionErrorLogged = true;
        logger.error("BullMQ Redis error", { error: err.message });
    });
}

module.exports = { connection };
