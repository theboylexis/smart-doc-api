const { body, param, validationResult } = require("express-validator");
const { VALID_TYPES } = require("../config/aiPrompts");

// Helper: runs validation and returns 400 with errors if any
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

// ─── Auth validators ────────────────────────────────────────

const registerRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Must be a valid email"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    validate,
];

const loginRules = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Must be a valid email"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    validate,
];

// ─── Document validators ────────────────────────────────────

const documentIdRules = [
    param("id")
        .isUUID().withMessage("Document ID must be a valid UUID"),
    validate,
];

// ─── AI validators ──────────────────────────────────────────

const analyzeRules = [
    param("documentId")
        .isUUID().withMessage("Document ID must be a valid UUID"),
    body("type")
        .optional()
        .isIn(VALID_TYPES).withMessage(`Analysis type must be one of: ${VALID_TYPES.join(", ")}`),
    validate,
];

const getAnalysesRules = [
    param("documentId")
        .isUUID().withMessage("Document ID must be a valid UUID"),
    validate,
];

module.exports = {
    registerRules,
    loginRules,
    documentIdRules,
    analyzeRules,
    getAnalysesRules,
};
