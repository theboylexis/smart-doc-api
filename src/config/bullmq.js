const IORedis = require("ioredis");
const logger = require("./logger");

// BullMQ requires a standard TCP Redis connection (not REST).
// Upstash provides both — we use the rediss:// (TLS) endpoint here.
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
});

connection.on("connect", () => logger.info("BullMQ Redis connected"));
connection.on("error", (err) => logger.error("BullMQ Redis error", { error: err.message }));

module.exports = { connection };
