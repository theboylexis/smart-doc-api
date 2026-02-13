require('dotenv').config();

const requiredEnvVars = [
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = {
    port: parseInt(process.env.PORT, 10),
    databaseUrl: process.env.DATABASE_URL,
    apiKey: process.env.API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
};