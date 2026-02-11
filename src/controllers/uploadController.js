const uploadService = require("../services/uploadService");

const upload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const document = await uploadService.uploadDocument(req.file, req.user.id);
        return res.status(201).json({ document });
    } catch (error) {
        next(error);
    }
};

const getDocuments = async (req, res, next) => {
    try {
        const documents = await uploadService.getUserDocuments(req.user.id);
        return res.status(200).json({ documents });
    } catch (error) {
        next(error);
    }
};

const getDocument = async (req, res, next) => {
    try {
        const document = await uploadService.getDocumentById(req.params.id, req.user.id);
        return res.status(200).json({ document });
    } catch (error) {
        if (error.message === "Document not found") {
            return res.status(404).json({ message: error.message })
        }
        next(error);
    };
};

module.exports = { upload, getDocuments, getDocument };