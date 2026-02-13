const OpenAI = require("openai");
const crypto = require("crypto");
const redisClient = require("../config/redis");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-4o-mini";
const CACHE_TTL = 3600; // 1 hour

/**
 * Generates a short, consistent cache key using SHA-256.
 */
function getCacheKey(documentText, prompt) {
    const hash = crypto
        .createHash("sha256")
        .update(documentText + prompt)
        .digest("hex");
    return `ai:analysis:${hash}`;
}

/**
 * Sends document text to OpenAI for analysis and caches the result in Redis.
 * @param {string} documentText - The extracted text content
 * @param {string} prompt       - The prompt template (with [DOCUMENT] placeholder)
 * @returns {Promise<object>}   - Parsed JSON result from the LLM
 */
async function analyzeDocument(documentText, prompt) {
    const fullPrompt = prompt.replace("[DOCUMENT]", documentText);
    const cacheKey = getCacheKey(documentText, prompt);

    // Check Redis cache
    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log("Cache hit for analysis");
            return cached;
        }
    } catch (err) {
        // Redis may be down — continue without cache
        console.warn("Redis cache read failed:", err.message);
    }

    // Call OpenAI
    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content:
                    "You are a document analysis assistant. Always respond with valid JSON only, no markdown formatting or code blocks.",
            },
            { role: "user", content: fullPrompt },
        ],
        temperature: 0.2,
    });

    const aiResult = response.choices[0].message.content;

    // Parse the response — handle both clean JSON and markdown-wrapped JSON
    let parsed;
    try {
        // Strip markdown code fences if present
        const cleaned = aiResult.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
        parsed = JSON.parse(cleaned);
    } catch {
        parsed = { raw: aiResult };
    }

    // Cache the result in Redis
    try {
        await redisClient.set(cacheKey, JSON.stringify(parsed), { ex: CACHE_TTL });
    } catch (err) {
        console.warn("Redis cache write failed:", err.message);
    }

    return { result: parsed, model: MODEL };
}

module.exports = { analyzeDocument };