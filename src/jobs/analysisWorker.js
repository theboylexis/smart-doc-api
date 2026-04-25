const { Worker } = require("bullmq");
const { connection } = require("../config/bullmq");
const { PrismaClient } = require("@prisma/client");
const { analyzeDocument } = require("../services/aiService");
const { extractText } = require("../services/textExtractorService");
const { getPrompt } = require("../config/aiPrompts");
const { fireWebhook } = require("../services/webhookService");
const { getIo } = require("../config/socket");
const logger = require("../config/logger");

const prisma = new PrismaClient();

let analysisWorker = null;
let redisErrorLogged = false;

if (!connection) {
    logger.warn("Analysis worker disabled: no Redis connection available");
} else {
    try {
        analysisWorker = new Worker(
        "analysis",
        async (job) => {
        const { analysisId, documentId, userId, type, customPrompt } = job.data;

        logger.info(`Processing job ${job.id}`, { analysisId });

        // 1. Mark as processing
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: "processing", jobId: job.id },
        });

        // 2. Fetch the document
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            throw new Error(`Document ${documentId} not found`);
        }

        // 3. Get prompt and extract text
        const prompt = getPrompt(type, customPrompt);
        const documentText = await extractText(document.fileUrl, document.fileType);

        // 4. Send to OpenAI
        const { result, model } = await analyzeDocument(documentText, prompt);

        // 5. Save result to DB
        await prisma.analysis.update({
            where: { id: analysisId },
            data: {
                result,
                model,
                status: "completed",
            },
        });

        // 6. Update document status
        await prisma.document.update({
            where: { id: documentId },
            data: { status: "analyzed" },
        });

        logger.info(`Completed analysis`, { analysisId });

        // 7. Fire webhooks
        await fireWebhook(userId, "analysis.completed", {
            analysisId,
            documentId,
            type,
            status: "completed",
        });

        // 8. Emit real-time event via Socket.io
        try {
            const io = getIo();
            io.to(`user:${userId}`).emit("analysis.completed", {
                analysisId,
                documentId,
                type,
                status: "completed",
            });
            logger.info(`Emitted analysis.completed`, { userId });
        } catch (err) {
            logger.warn("Could not emit socket event", { error: err.message });
        }

        return { analysisId, status: "completed" };
        },
        {
            connection,
            concurrency: 2, // Process 2 jobs at a time
        }
    );

    // Handle failed jobs
    analysisWorker.on("failed", async (job, err) => {
        logger.error(`Job ${job?.id} failed`, { error: err.message });

        if (job?.data?.analysisId) {
            try {
                await prisma.analysis.update({
                    where: { id: job.data.analysisId },
                    data: { status: "failed" },
                });

                // Fire failure webhook
                await fireWebhook(job.data.userId, "analysis.failed", {
                    analysisId: job.data.analysisId,
                    documentId: job.data.documentId,
                    error: err.message,
                });
            } catch (updateErr) {
                logger.error("Failed to update analysis status", { error: updateErr.message });
            }

            try {
                const io = getIo();
                io.to(`user:${job.data.userId}`).emit("analysis.failed", {
                    analysisId: job.data.analysisId,
                    documentId: job.data.documentId,
                    error: err.message,
                });
            } catch (socketErr) {
                // Socket not available — that's okay
            }
        }
    });

    analysisWorker.on("completed", (job) => {
        logger.info(`Job ${job.id} completed successfully`);
    });

    // Log Redis connection failures once, then stop the worker so it doesn't keep retrying
    analysisWorker.on("error", async (err) => {
        if (redisErrorLogged) return;
        redisErrorLogged = true;
        logger.warn("Analysis worker Redis connection failed; stopping worker", { error: err.message });
        try {
            await analysisWorker.close();
        } catch (_) {
            // ignore close errors
        }
    });
    } catch (err) {
        logger.warn("Failed to initialize analysis worker", { error: err.message });
    }
}

module.exports = { analysisWorker };
