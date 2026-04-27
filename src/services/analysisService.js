const { PrismaClient } = require("@prisma/client");
const { addAnalysisJob } = require("../jobs/analysisQueue");
const { getPrompt } = require("../config/aiPrompts");
const ApiError = require("../utils/ApiError");

const prisma = new PrismaClient();

const MODEL = "gpt-4o-mini";

async function queueAnalysis(documentId, userId, type, customPrompt) {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
    });

    if (!document || document.userId !== userId) {
        throw new ApiError("Document not found", 404);
    }

    let prompt;
    try {
        prompt = getPrompt(type, customPrompt);
    } catch (err) {
        throw new ApiError(err.message, 400);
    }

    const analysis = await prisma.analysis.create({
        data: {
            documentId: document.id,
            type,
            prompt,
            model: MODEL,
            status: "pending",
        },
    });

    const job = await addAnalysisJob({
        analysisId: analysis.id,
        documentId: document.id,
        userId,
        type,
        customPrompt,
    });

    await prisma.analysis.update({
        where: { id: analysis.id },
        data: { jobId: job.id },
    });

    return {
        id: analysis.id,
        documentId: document.id,
        type,
        status: "pending",
        jobId: job.id,
    };
}

async function getAnalysesForDocument(documentId, userId) {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
    });

    if (!document || document.userId !== userId) {
        throw new ApiError("Document not found", 404);
    }

    return prisma.analysis.findMany({
        where: { documentId },
        orderBy: { createdAt: "desc" },
    });
}

module.exports = { queueAnalysis, getAnalysesForDocument };
