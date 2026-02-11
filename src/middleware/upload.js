const multer = require("multer");
const path = require("path");

const extensions = [".pdf", ".txt", ".doc", ".docx"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLocaleLowerCase()
    if (extensions.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error("Only PDF, TXT, DOC and DOCX files are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits:  {fileSize: 10 * 1024 * 1024},
    fileFilter: fileFilter
});

module.exports = upload;