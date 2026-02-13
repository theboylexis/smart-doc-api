const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Fetches a file from a URL and returns its Buffer.
 */
async function fetchFileBuffer(fileUrl) {
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Extracts text from a PDF buffer.
 */
async function extractFromPdf(buffer) {
    const data = await pdfParse(buffer);
    return data.text;
}

/**
 * Extracts text from a DOCX buffer.
 */
async function extractFromDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

/**
 * Extracts text from a plain text buffer.
 */
function extractFromText(buffer) {
    return buffer.toString("utf-8");
}

// Map MIME types to extractors
const EXTRACTORS = {
    "application/pdf": extractFromPdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extractFromDocx,
    "text/plain": extractFromText,
};

// Friendly names for supported types
const SUPPORTED_TYPES = Object.keys(EXTRACTORS);

/**
 * Extracts text content from a document stored at a URL.
 * @param {string} fileUrl  - URL to fetch the file from (Cloudinary)
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractText(fileUrl, fileType) {
    const extractor = EXTRACTORS[fileType];

    if (!extractor) {
        throw new Error(
            `Unsupported file type: "${fileType}". Supported types: ${SUPPORTED_TYPES.join(", ")}`
        );
    }

    const buffer = await fetchFileBuffer(fileUrl);

    if (!buffer || buffer.length === 0) {
        throw new Error("File is empty or could not be downloaded");
    }

    const text = await extractor(buffer);

    if (!text || text.trim().length === 0) {
        throw new Error("No text could be extracted from the document");
    }

    return text.trim();
}

module.exports = { extractText, SUPPORTED_TYPES };
