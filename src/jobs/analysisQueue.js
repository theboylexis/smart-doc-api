const { Queue } = require("bullmq");
const { connection } = require("../config/bullmq");

const analysisQueue = new Queue("analysis", { connection });

/**
 * Add an analysis job to the queue.
 * @param {object} data - { analysisId, documentId, userId, type, customPrompt }
 * @returns {Promise<Job>}
 */
async function addAnalysisJob(data) {
    const job = await analysisQueue.add("analyze-document", data, {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    });
    return job;
}

module.exports = { analysisQueue, addAnalysisJob };
