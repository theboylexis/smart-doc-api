const express = require("express");
const { analyze, getAnalyses } = require("../controllers/aiController");
const { analyzeRules, getAnalysesRules } = require("../middleware/validator");
const router = express.Router();

/**
 * @swagger
 * /api/ai/analyze/{documentId}:
 *   post:
 *     summary: Run AI analysis on a document
 *     tags: [AI Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document UUID to analyze
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [summary, key_points, sentiment, custom]
 *                 default: summary
 *                 description: Type of analysis to perform
 *               customPrompt:
 *                 type: string
 *                 description: Custom prompt (required when type is "custom")
 *     responses:
 *       201:
 *         description: Analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 analysis:
 *                   $ref: '#/components/schemas/Analysis'
 *       400:
 *         description: Invalid UUID or analysis type
 *       401:
 *         description: No token provided
 *       404:
 *         description: Document not found
 *       429:
 *         description: Rate limit exceeded
 */
router.post("/analyze/:documentId", analyzeRules, analyze);

/**
 * @swagger
 * /api/ai/analyses/{documentId}:
 *   get:
 *     summary: Get all analyses for a document
 *     tags: [AI Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document UUID
 *     responses:
 *       200:
 *         description: List of analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Analysis'
 *       400:
 *         description: Invalid UUID
 *       401:
 *         description: No token provided
 *       404:
 *         description: Document not found
 */
router.get("/analyses/:documentId", getAnalysesRules, getAnalyses);

module.exports = router;