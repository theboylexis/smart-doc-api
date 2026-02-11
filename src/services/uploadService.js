const cloudinary = require("../config/cloudinary");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadDocument = async (file, userId) => {
    const b64 = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: "smart-doc-api", resource_type: "auto" });

    const document = await prisma.document.create({
        data: {
            fileName: file.originalname,
            fileUrl:  result.secure_url,
            fileType: file.mimetype,
            fileSize: file.size,
            userId:   userId
        },
    });
    return document;
};

const getUserDocuments = async (userId) => {
    const documents = await prisma.document.findMany({ where: {userId: userId}});
    return documents;
};

const getDocumentById = async (documentId, userId) => {
    const document = await prisma.document.findUnique({where: {id: documentId}});
    if (!document || document.userId !== userId) {
        throw new Error("Document not found");
    }
    return document;
};

module.exports = { uploadDocument, getUserDocuments, getDocumentById };