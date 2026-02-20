const express = require("express");
const { register, list, remove } = require("../controllers/webhookController");
const router = express.Router();

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Register a webhook URL
 *     tags: [Webhooks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/webhook
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: ["analysis.completed"]
 *     responses:
 *       201:
 *         description: Webhook registered (secret shown once)
 *       400:
 *         description: Missing URL
 *       401:
 *         description: No token provided
 */
router.post("/", register);

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: List all webhooks for the authenticated user
 *     tags: [Webhooks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 *       401:
 *         description: No token provided
 */
router.get("/", list);

/**
 * @swagger
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete a webhook
 *     tags: [Webhooks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook deleted
 *       401:
 *         description: No token provided
 *       404:
 *         description: Webhook not found
 */
router.delete("/:id", remove);

module.exports = router;
