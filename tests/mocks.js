// Shared mock for PrismaClient used across all test files
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    document: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    analysis: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

// Mock Prisma
jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
    hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
    compare: jest.fn((plain, hashed) =>
        Promise.resolve(hashed === `hashed_${plain}`)
    ),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "mock-jwt-token"),
    verify: jest.fn((token, secret, cb) => {
        if (token === "valid-token") {
            cb(null, { id: "user-123", email: "test@example.com" });
        } else {
            cb(new Error("Invalid token"));
        }
    }),
}));

// Mock text extractor
jest.mock("../src/services/textExtractorService", () => ({
    extractText: jest.fn(() => Promise.resolve("Extracted document text for testing.")),
    SUPPORTED_TYPES: ["application/pdf", "text/plain"],
}));

// Mock OpenAI
jest.mock("openai", () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn(() =>
                    Promise.resolve({
                        choices: [
                            {
                                message: {
                                    content: JSON.stringify({
                                        summary: "Test summary",
                                        key_points: ["Point 1"],
                                        sentiment: "neutral",
                                    }),
                                },
                            },
                        ],
                    })
                ),
            },
        },
    }));
});

module.exports = { mockPrisma };

// Mock ioredis (prevents BullMQ from connecting to real Redis)
jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        quit: jest.fn(),
        status: "ready",
    }));
});

// Mock BullMQ Queue and Worker
jest.mock("bullmq", () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn(() => Promise.resolve({ id: "job-123" })),
        close: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
}));

// Mock webhookService
jest.mock("../src/services/webhookService", () => ({
    fireWebhook: jest.fn(() => Promise.resolve()),
    registerWebhook: jest.fn((userId, url, events) =>
        Promise.resolve({
            id: "webhook-123",
            userId,
            url,
            events: events || ["analysis.completed"],
            secret: "mock-secret-key",
            active: true,
            createdAt: new Date(),
        })
    ),
    getUserWebhooks: jest.fn(() => Promise.resolve([])),
    deleteWebhook: jest.fn(() => Promise.resolve({ id: "webhook-123" })),
}));

// Mock Socket.io
jest.mock("../src/config/socket", () => ({
    initSocket: jest.fn(),
    getIo: jest.fn(() => ({
        to: jest.fn(() => ({
            emit: jest.fn(),
        })),
    })),
}));
