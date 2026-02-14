const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Smart Doc API",
            version: "1.0.0",
            description:
                "A production-ready document intelligence API that ingests uploaded documents (PDF, DOCX, TXT), extracts text, and performs AI-powered analysis using OpenAI. Features JWT authentication, Redis caching, Cloudinary file storage, input validation, and rate limiting.",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            { url: "http://localhost:3000", description: "Development" },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Document: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        fileName: { type: "string" },
                        fileUrl: { type: "string" },
                        fileType: { type: "string" },
                        fileSize: { type: "integer" },
                        status: { type: "string", enum: ["uploaded", "analyzed"] },
                        userId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Analysis: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        documentId: { type: "string", format: "uuid" },
                        type: { type: "string", enum: ["summary", "key_points", "sentiment", "custom"] },
                        prompt: { type: "string" },
                        result: { type: "object" },
                        model: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Validation failed" },
                        details: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
