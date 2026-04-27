const analysisService = require("../services/analysisService");
const { DEFAULT_TYPE } = require("../config/aiPrompts");

/**
 * POST /api/ai/analyze/:documentId
 * Queues a document for async AI analysis.
 * Returns 202 Accepted immediately.
 */
async function analyze(req, res, next) {
    try {
        const { documentId } = req.params;
        const { type = DEFAULT_TYPE, customPrompt } = req.body || {};

        const analysis = await analysisService.queueAnalysis(
            documentId,
            req.user.id,
            type,
            customPrompt
        );

        res.status(202).json({
            message: "Analysis queued for processing",
            analysis,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/ai/analyses/:documentId
 * Returns all analyses for a document (with status tracking).
 */
async function getAnalyses(req, res, next) {
    try {
        const { documentId } = req.params;
        const analyses = await analysisService.getAnalysesForDocument(
            documentId,
            req.user.id
        );
        res.json({ analyses });
    } catch (error) {
        next(error);
    }
}

module.exports = { analyze, getAnalyses };
