require("../setup");
const { mockPrisma } = require("../mocks");
const request = require("supertest");
const app = require("../../src/app");
const {
    registerWebhook,
    getUserWebhooks,
    deleteWebhook,
} = require("../../src/services/webhookService");

describe("Webhook Endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/webhooks ─────────────────────────────────

    describe("POST /api/webhooks", () => {
        it("should register a webhook successfully", async () => {
            registerWebhook.mockResolvedValue({
                id: "webhook-123",
                url: "https://example.com/hook",
                events: ["analysis.completed"],
                secret: "mock-secret",
                active: true,
                createdAt: new Date(),
            });

            const res = await request(app)
                .post("/api/webhooks")
                .set("Authorization", "Bearer valid-token")
                .send({ url: "https://example.com/hook" });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Webhook registered successfully");
            expect(res.body.webhook).toBeDefined();
            expect(res.body.webhook.url).toBe("https://example.com/hook");
            expect(res.body.webhook.secret).toBe("mock-secret");
        });

        it("should return 400 if URL is missing", async () => {
            const res = await request(app)
                .post("/api/webhooks")
                .set("Authorization", "Bearer valid-token")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Webhook URL is required");
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app)
                .post("/api/webhooks")
                .send({ url: "https://example.com/hook" });

            expect(res.status).toBe(401);
        });
    });

    // ─── GET /api/webhooks ──────────────────────────────────

    describe("GET /api/webhooks", () => {
        it("should return list of webhooks (secrets excluded)", async () => {
            getUserWebhooks.mockResolvedValue([
                {
                    id: "webhook-123",
                    url: "https://example.com/hook",
                    events: ["analysis.completed"],
                    secret: "should-not-appear",
                    active: true,
                    createdAt: new Date(),
                },
            ]);

            const res = await request(app)
                .get("/api/webhooks")
                .set("Authorization", "Bearer valid-token");

            expect(res.status).toBe(200);
            expect(res.body.webhooks).toHaveLength(1);
            expect(res.body.webhooks[0].secret).toBeUndefined();
            expect(res.body.webhooks[0].url).toBe("https://example.com/hook");
        });

        it("should return empty array when no webhooks exist", async () => {
            getUserWebhooks.mockResolvedValue([]);

            const res = await request(app)
                .get("/api/webhooks")
                .set("Authorization", "Bearer valid-token");

            expect(res.status).toBe(200);
            expect(res.body.webhooks).toHaveLength(0);
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app).get("/api/webhooks");
            expect(res.status).toBe(401);
        });
    });

    // ─── DELETE /api/webhooks/:id ────────────────────────────

    describe("DELETE /api/webhooks/:id", () => {
        it("should delete a webhook successfully", async () => {
            deleteWebhook.mockResolvedValue({ id: "webhook-123" });

            const res = await request(app)
                .delete("/api/webhooks/webhook-123")
                .set("Authorization", "Bearer valid-token");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Webhook deleted successfully");
        });

        it("should return 404 if webhook not found", async () => {
            deleteWebhook.mockResolvedValue(null);

            const res = await request(app)
                .delete("/api/webhooks/nonexistent-id")
                .set("Authorization", "Bearer valid-token");

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Webhook not found");
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app).delete("/api/webhooks/webhook-123");
            expect(res.status).toBe(401);
        });
    });
});
