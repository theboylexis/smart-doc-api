const { Redis } = require("@upstash/redis");
const logger = require("./logger");

const url = process.env.UPSTASH_REDIS_REST_URL;

let redisClient = null;

if (url && url.startsWith("https://")) {
    redisClient = new Redis({
        url,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else {
    logger.warn("Upstash Redis disabled: UPSTASH_REDIS_REST_URL missing or not an https:// URL");
}

module.exports = redisClient;
