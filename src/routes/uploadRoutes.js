const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const upload = require("../middleware/upload");

router.post("/upload", upload.single("file"), uploadController.upload);
router.get("/", uploadController.getDocuments);
router.get("/:id", uploadController.getDocument);

module.exports = router;