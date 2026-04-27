const express = require("express");
const router = express.Router();
const {
    registerController,
    loginController,
    refreshController,
    logoutController,
    logoutAllController,
} = require("../controllers/authController");
const {
    registerRules,
    loginRules,
    refreshTokenBodyRules,
} = require("../middleware/validator");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Alex Marfo
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePass123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already registered
 */
router.post("/register", registerRules, registerController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive an access + refresh token pair
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: Short-lived JWT (15 min). Send as Authorization Bearer.
 *                     refreshToken:
 *                       type: string
 *                       description: Long-lived (7 days). Send to /refresh to get a new pair.
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginRules, loginController);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access + refresh pair
 *     description: |
 *       The presented refresh token is revoked and a new pair is issued (rotation).
 *       Reusing a previously-revoked token revokes the entire family for that user
 *       (theft mitigation).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: refreshToken missing
 *       401:
 *         description: Invalid, expired, or reused refresh token
 */
router.post("/refresh", refreshTokenBodyRules, refreshController);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     description: Idempotent — succeeds even if the token is unknown or already revoked.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out
 *       400:
 *         description: refreshToken missing
 */
router.post("/logout", refreshTokenBodyRules, logoutController);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Revoke every refresh token for the authenticated user
 *     description: Forces re-login on every device. Requires a valid access token.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All refresh tokens revoked
 *       401:
 *         description: Missing or invalid access token
 */
router.post("/logout-all", authMiddleware, logoutAllController);

module.exports = router;
