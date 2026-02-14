// Set test environment variables before anything loads
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";
process.env.JWT_SECRET = "test-secret-key-for-jest";
process.env.OPENAI_API_KEY = "sk-test-fake-key";
process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "123456";
process.env.CLOUDINARY_API_SECRET = "test-secret";
