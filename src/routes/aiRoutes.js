const express = require("express");
const { analyze, getAnalyses } = require("../controllers/aiController");
const router = express.Router();

// POST /api/ai/analyze/:documentId - Run AI analysis on a document
router.post("/analyze/:documentId", analyze);

// GET /api/ai/analyses/:documentId - Get all analyses for a document
router.get("/analyses/:documentId", getAnalyses);

module.exports = router;