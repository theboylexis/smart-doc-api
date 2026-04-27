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
        it("should login with valid credentials and return access + refresh tokens", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: "user-123",
                email: "test@example.com",
                name: "Test User",
                password: "hashed_password123",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockPrisma.refreshToken.create.mockResolvedValue({ id: "rt-1" });

            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "test@example.com", password: "password123" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User logged in successfully");
            expect(res.body.result.accessToken).toBeDefined();
            expect(res.body.result.refreshToken).toBeDefined();
            expect(res.body.result.user.password).toBeUndefined();
            expect(mockPrisma.refreshToken.create).toHaveBeenCalledTimes(1);
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

    // ─── POST /api/auth/refresh ─────────────────────────────

    describe("POST /api/auth/refresh", () => {
        it("should rotate tokens on a valid refresh token", async () => {
            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                id: "rt-old",
                userId: "user-123",
                tokenHash: "hash",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                revokedAt: null,
            });
            mockPrisma.user.findUnique.mockResolvedValue({
                id: "user-123",
                email: "test@example.com",
            });
            mockPrisma.refreshToken.create.mockResolvedValue({ id: "rt-new" });

            const res = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "some-refresh-token" });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            // old token is revoked + linked to the new one
            expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "rt-old" },
                    data: expect.objectContaining({
                        revokedAt: expect.any(Date),
                        replacedById: "rt-new",
                    }),
                })
            );
        });

        it("should return 400 if refreshToken is missing", async () => {
            const res = await request(app).post("/api/auth/refresh").send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });

        it("should return 401 for an unknown refresh token", async () => {
            mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "bogus" });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Invalid refresh token");
        });

        it("should return 401 for an expired refresh token", async () => {
            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                id: "rt-old",
                userId: "user-123",
                tokenHash: "hash",
                expiresAt: new Date(Date.now() - 1000), // expired
                revokedAt: null,
            });

            const res = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "some-refresh-token" });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Refresh token expired");
        });

        it("should detect reuse and revoke the entire family", async () => {
            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                id: "rt-old",
                userId: "user-123",
                tokenHash: "hash",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                revokedAt: new Date(Date.now() - 1000), // already revoked
            });

            const res = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "stolen-token" });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Refresh token reuse detected");
            expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "user-123", revokedAt: null },
                    data: expect.objectContaining({ revokedAt: expect.any(Date) }),
                })
            );
        });
    });

    // ─── POST /api/auth/logout ──────────────────────────────

    describe("POST /api/auth/logout", () => {
        it("should revoke the presented refresh token", async () => {
            mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

            const res = await request(app)
                .post("/api/auth/logout")
                .send({ refreshToken: "some-refresh-token" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Logged out");
            expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ revokedAt: null }),
                    data: expect.objectContaining({ revokedAt: expect.any(Date) }),
                })
            );
        });

        it("should return 400 if refreshToken is missing", async () => {
            const res = await request(app).post("/api/auth/logout").send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Validation failed");
        });
    });

    // ─── POST /api/auth/logout-all ──────────────────────────

    describe("POST /api/auth/logout-all", () => {
        it("should revoke every refresh token for the authenticated user", async () => {
            mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

            const res = await request(app)
                .post("/api/auth/logout-all")
                .set("Authorization", "Bearer valid-token");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Logged out from all devices");
            expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "user-123", revokedAt: null },
                    data: expect.objectContaining({ revokedAt: expect.any(Date) }),
                })
            );
        });

        it("should return 401 without an access token", async () => {
            const res = await request(app).post("/api/auth/logout-all");
            expect(res.status).toBe(401);
        });
    });
});
