require("../setup");
const { mockPrisma } = require("../mocks");
const request = require("supertest");
const app = require("../../src/app");

describe("Auth Endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/auth/register ────────────────────────────

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: "user-123",
                email: "newuser@example.com",
                name: "New User",
                password: "hashed_password123",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "New User", email: "newuser@example.com", password: "password123" });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User registered successfully");
            expect(res.body.user).toBeDefined();
            expect(res.body.user.password).toBeUndefined();
        });

        it("should return 409 if user already exists", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: "user-123",
                email: "newuser@example.com",
            });

            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "New User", email: "newuser@example.com", password: "password123" });

            expect(res.status).toBe(409);
            expect(res.body.error).toBe("User already exists");
        });

        it("should return 400 for missing fields", async () => {
            const res = await request(app).post("/api/auth/register").send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
            expect(res.body.details.length).toBeGreaterThan(0);
        });

        it("should return 400 for invalid email", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "Test", email: "not-an-email", password: "password123" });
            expect(res.status).toBe(400);
            expect(res.body.details).toEqual(
                expect.arrayContaining([expect.objectContaining({ field: "email" })])
            );
        });

        it("should return 400 for short password", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "Test", email: "test@test.com", password: "123" });
            expect(res.status).toBe(400);
            expect(res.body.details).toEqual(
                expect.arrayContaining([expect.objectContaining({ field: "password" })])
            );
        });
    });

    // ─── POST /api/auth/login ───────────────────────────────

    describe("POST /api/auth/login", () => {
        it("should login with valid credentials", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: "user-123",
                email: "test@example.com",
                name: "Test User",
                password: "hashed_password123",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "test@example.com", password: "password123" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User logged in successfully");
            expect(res.body.result.token).toBeDefined();
            expect(res.body.result.user.password).toBeUndefined();
        });

        it("should return 400 for missing email", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ password: "password123" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });

        it("should return 401 for wrong credentials", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "wrong@example.com", password: "password123" });
            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Invalid credentials");
        });
    });
});
