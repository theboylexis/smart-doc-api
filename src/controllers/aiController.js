const { PrismaClient } = require("@prisma/client");
const { analyzeDocument } = require("../services/aiService");
const { extractText } = require("../services/textExtractorService");
const { getPrompt, DEFAULT_TYPE } = require("../config/aiPrompts");

const prisma = new PrismaClient();

async function analyze(req, res, next) {
    try {
        const { documentId } = req.params;
        const { type = DEFAULT_TYPE, customPrompt } = req.body;

        // 1. Fetch the document and verify ownership
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document || document.userId !== req.user.id) {
            return res.status(404).json({ error: "Document not found" });
        }

        // 2. Get the prompt template for the analysis type
        const prompt = getPrompt(type, customPrompt);

        // 3. Extract text from the document (fetches from Cloudinary)
        const documentText = await extractText(document.fileUrl, document.fileType);

        // 4. Send to OpenAI for analysis
        const { result, model } = await analyzeDocument(documentText, prompt);

        // 5. Save the analysis to the database
        const analysis = await prisma.analysis.create({
            data: {
                documentId: document.id,
                type,
                prompt,
                result,
                model,
            },
        });

        // 6. Update document status
        await prisma.document.update({
            where: { id: document.id },
            data: { status: "analyzed" },
        });

        res.status(201).json({ analysis });
    } catch (error) {
        // Handle known error types with appropriate status codes
        if (error.message.includes("Unsupported file type")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("Invalid analysis type")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("No text could be extracted")) {
            return res.status(422).json({ error: error.message });
        }
        next(error);
    }
}

async function getAnalyses(req, res, next) {
    try {
        const { documentId } = req.params;

        // Verify document ownership
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