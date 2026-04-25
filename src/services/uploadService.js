const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, bucketName } = require("../config/s3");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadDocument = async (file, userId) => {
    const fileKey = `documents/${userId}/${Date.now()}-${file.originalname}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));

    const fileUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: bucketName, Key: fileKey }),
        { expiresIn: 3600 }
    );

    const document = await prisma.document.create({
        data: {
            fileName: file.originalname,
            fileUrl: fileUrl,
            fileKey: fileKey,
            fileType: file.mimetype,
            fileSize: file.size,
            userId: userId,
        },
    });
    return document;
};

const getUserDocuments = async (userId) => {
    const documents = await prisma.document.findMany({ where: { userId: userId } });
    return documents;
};

const getDocumentById = async (documentId, userId) => {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.userId !== userId) {
        throw new Error("Document not found");
    }

    const fileUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: bucketName, Key: document.fileKey }),
        { expiresIn: 3600 }
    );

    return { ...document, fileUrl };
};

module.exports = { uploadDocument, getUserDocuments, getDocumentById };
