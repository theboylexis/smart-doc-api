const IORedis = require("ioredis");

// BullMQ requires a standard TCP Redis connection (not REST).
// Upstash provides both — we use the rediss:// (TLS) endpoint here.
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
});

connection.on("connect", () => console.log("BullMQ Redis connected"));
connection.on("error", (err) => console.error("BullMQ Redis error:", err.message));

module.exports = { connection };
