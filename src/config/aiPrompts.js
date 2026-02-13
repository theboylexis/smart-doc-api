const PROMPTS = {
    summary: `Analyze the following document and return a JSON object with these fields:
- "summary": A concise 2-3 sentence summary of the document.
- "key_points": An array of the most important points (max 5).
- "sentiment": The overall tone/sentiment (e.g. "positive", "negative", "neutral", "formal", "technical").

Return ONLY valid JSON, no markdown formatting.

Document:
[DOCUMENT]`,

    key_points: `Extract the key points from the following document. Return a JSON object with:
- "key_points": An array of the most important points or takeaways (max 10).
- "categories": An array of topic categories this document covers.

Return ONLY valid JSON, no markdown formatting.

Document:
[DOCUMENT]`,

    sentiment: `Analyze the sentiment and tone of the following document. Return a JSON object with:
- "sentiment": The overall sentiment ("positive", "negative", "neutral", "mixed").
- "tone": The writing tone (e.g. "formal", "casual", "technical", "persuasive").
- "confidence": A confidence score from 0 to 1.

Return ONLY valid JSON, no markdown formatting.

Document:
[DOCUMENT]`,

    custom: `[CUSTOM_PROMPT]

Analyze the following document based on the instructions above. Return your response as valid JSON.

Document:
[DOCUMENT]`,
};

const DEFAULT_TYPE = "summary";
const VALID_TYPES = Object.keys(PROMPTS);

function getPrompt(type, customPrompt) {
    if (!VALID_TYPES.includes(type)) {
        throw new Error(`Invalid analysis type: "${type}". Valid types: ${VALID_TYPES.join(", ")}`);
    }

    let prompt = PROMPTS[type];

    if (type === "custom" && customPrompt) {
        prompt = prompt.replace("[CUSTOM_PROMPT]", customPrompt);
    }

    return prompt;
}

module.exports = { getPrompt, VALID_TYPES, DEFAULT_TYPE };
