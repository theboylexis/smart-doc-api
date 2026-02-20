const { PrismaClient } = require("@prisma/client");
const { addAnalysisJob } = require("../jobs/analysisQueue");
const { getPrompt, DEFAULT_TYPE } = require("../config/aiPrompts");

const prisma = new PrismaClient();

/**
 * POST /api/ai/analyze/:documentId
 * Queues a document for async AI analysis.
 * Returns 202 Accepted immediately.
 */
async function analyze(req, res, next) {
    try {
        const { documentId } = req.params;
        const { type = DEFAULT_TYPE, customPrompt } = req.body || {};

        // 1. Validate document ownership
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document || document.userId !== req.user.id) {
            return res.status(404).json({ error: "Document not found" });
        }

        // 2. Validate the prompt (will throw if invalid type)
        getPrompt(type, customPrompt);

        // 3. Create analysis record with "pending" status
        const analysis = await prisma.analysis.create({
            data: {
                documentId: document.id,
                type,
                prompt: getPrompt(type, customPrompt),
                model: "gpt-4o-mini",
                status: "pending",
            },
        });

        // 4. Add job to BullMQ queue
        const job = await addAnalysisJob({
            analysisId: analysis.id,
            documentId: document.id,
            userId: req.user.id,
            type,
            customPrompt,
        });

        // 5. Update analysis with job ID
        await prisma.analysis.update({
            where: { id: analysis.id },
            data: { jobId: job.id },
        });

        // 6. Return 202 Accepted — analysis is processing in the background
        res.status(202).json({
            message: "Analysis queued for processing",
            analysis: {
                id: analysis.id,
                documentId: document.id,
                type,
                status: "pending",
                jobId: job.id,
            },
        });
    } catch (error) {
        if (error.message.includes("Invalid analysis type")) {
            return res.status(400).json({ error: error.message });
        }
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

        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document || document.userId !== req.user.id) {
            return res.status(404).json({ error: "Document not found" });
        }

        const analyses = await prisma.analysis.findMany({
            where: { documentId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ analyses });
    } catch (error) {
        next(error);
    }
}

module.exports = { analyze, getAnalyses };