require("../setup");
const { mockPrisma } = require("../mocks");
const request = require("supertest");
const app = require("../../src/app");

const AUTH_HEADER = "Bearer valid-token";

describe("Document Endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/documents/upload ─────────────────────────

    describe("POST /api/documents/upload", () => {
        it("should upload a document successfully", async () => {
            mockPrisma.document.create.mockResolvedValue({
                id: "doc-123",
                fileName: "test.pdf",
                fileUrl: "https://res.cloudinary.com/test/raw/upload/test-file.pdf",
                fileType: "application/pdf",
                fileSize: 1024,
                userId: "user-123",
                status: "uploaded",
            });

            const res = await request(app)
                .post("/api/documents/upload")
                .set("Authorization", AUTH_HEADER)
                .attach("file", Buffer.from("fake pdf content"), "test.pdf");

            expect(res.status).toBe(201);
            expect(res.body.document).toBeDefined();
            expect(res.body.document.fileName).toBe("test.pdf");
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app)
                .post("/api/documents/upload")
                .attach("file", Buffer.from("fake pdf"), "test.pdf");
            expect(res.status).toBe(401);
        });

        it("should return 400 without a file", async () => {
            const res = await request(app)
                .post("/api/documents/upload")
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(400);
        });
    });

    // ─── GET /api/documents ─────────────────────────────────

    describe("GET /api/documents", () => {
        it("should return all documents for the user", async () => {
            mockPrisma.document.findMany.mockResolvedValue([
                { id: "doc-1", fileName: "file1.pdf", userId: "user-123" },
                { id: "doc-2", fileName: "file2.pdf", userId: "user-123" },
            ]);

            const res = await request(app)
                .get("/api/documents")
                .set("Authorization", AUTH_HEADER);

            expect(res.status).toBe(200);
            expect(res.body.documents).toHaveLength(2);
        });

        it("should return 401 without auth token", async () => {
            const res = await request(app).get("/api/documents");
            expect(res.status).toBe(401);
        });
    });

    // ─── GET /api/documents/:id ─────────────────────────────

    describe("GET /api/documents/:id", () => {
        const validUUID = "f6d0f776-9319-4992-b186-f2ad812cdaf9";

        it("should return a single document", async () => {
            mockPrisma.document.findUnique.mockResolvedValue({
                id: validUUID,
                fileName: "test.pdf",
                userId: "user-123",
            });

            const res = await request(app)
                .get(`/api/documents/${validUUID}`)
                .set("Authorization", AUTH_HEADER);

            expect(res.status).toBe(200);
            expect(res.body.document).toBeDefined();
        });

        it("should return 404 if document not found", async () => {
            mockPrisma.document.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/documents/${validUUID}`)
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(404);
        });

        it("should return 400 for invalid UUID", async () => {
            const res = await request(app)
                .get("/api/documents/not-a-uuid")
                .set("Authorization", AUTH_HEADER);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });
    });
});
