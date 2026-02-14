require("../setup");
const { mockPrisma } = require("../mocks");
const request = require("supertest");
const app = require("../../src/app");

const AUTH_HEADER = "Bearer valid-token";
const validUUID = "f6d0f776-9319-4992-b186-f2ad812cdaf9";

describe("AI Endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/ai/analyze/:documentId ───────────────────

    describe("POST /api/ai/analyze/:documentId", () => {
        it("should analyze a document successfully", async () => {
            mockPrisma.document.findUnique.mockResolvedValue({
                id: validUUID,
                fileName: "test.pdf",
                fileUrl: "https://cloudinary.com/test.pdf",
                fileType: "application/pdf",
                userId: "user-123",
            });
            mockPrisma.analysis.create.mockResolvedValue({
                id: "analysis-1",
                documentId: validUUID,
                type: "summary",
                result: { summary: "Test summary" },
                model: "gpt-4o-mini",
            });
            mockPrisma.document.update.mockResolvedValue({});

            const res = await request(app)
                .post(`/api/ai/analyze/${validUUID}`)
                .set("Authorization", AUTH_HEADER)
                .send({ type: "summary" });

            expect(res.status).toBe(201);
            expect(res.body.analysis).toBeDefined();
        });

        it("should return 404 for non-existent document", async () => {
            mockPrisma.document.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post(`/api/ai/analyze/${validUUID}`)
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(404);
        });

        it("should return 400 for invalid UUID", async () => {
            const res = await request(app)
                .post("/api/ai/analyze/not-a-uuid")
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });

        it("should return 400 for invalid analysis type", async () => {
            const res = await request(app)
                .post(`/api/ai/analyze/${validUUID}`)
                .set("Authorization", AUTH_HEADER)
                .send({ type: "invalid_type" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app).post(`/api/ai/analyze/${validUUID}`);
            expect(res.status).toBe(401);
        });
    });

    // ─── GET /api/ai/analyses/:documentId ───────────────────

    describe("GET /api/ai/analyses/:documentId", () => {
        it("should return analyses for a document", async () => {
            mockPrisma.document.findUnique.mockResolvedValue({
                id: validUUID,
                userId: "user-123",
            });
            mockPrisma.analysis.findMany.mockResolvedValue([
                { id: "a-1", type: "summary", result: { summary: "Test" } },
            ]);

            const res = await request(app)
                .get(`/api/ai/analyses/${validUUID}`)
                .set("Authorization", AUTH_HEADER);

            expect(res.status).toBe(200);
            expect(res.body.analyses).toHaveLength(1);
        });

        it("should return 404 if document not owned by user", async () => {
            mockPrisma.document.findUnique.mockResolvedValue({
                id: validUUID,
                userId: "different-user",
            });

            const res = await request(app)
                .get(`/api/ai/analyses/${validUUID}`)
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(404);
        });

        it("should return 400 for invalid UUID", async () => {
            const res = await request(app)
                .get("/api/ai/analyses/not-a-uuid")
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(400);
        });
    });
});
