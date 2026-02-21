const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const logger = require("../config/logger");

const prisma = new PrismaClient();

/**
 * Register a webhook URL for a user.
 */
async function registerWebhook(userId, url, events = ["analysis.completed"]) {
    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = await prisma.webhook.create({
        data: { userId, url, events, secret },
    });

    return webhook;
}

/**
 * List all webhooks for a user.
 */
async function getUserWebhooks(userId) {
    return prisma.webhook.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Delete a webhook by ID (only if owned by user).
 */
async function deleteWebhook(webhookId, userId) {
    const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
    });

    if (!webhook || webhook.userId !== userId) {
        return null;
    }

    await prisma.webhook.delete({ where: { id: webhookId } });
    return webhook;
}

/**
 * Fire webhooks for a given user and event.
 * Sends a signed POST request to each matching webhook URL.
 */
async function fireWebhook(userId, event, payload) {
    const webhooks = await prisma.webhook.findMany({
        where: {
            userId,
            active: true,
            events: { has: event },
        },
    });

    if (webhooks.length === 0) return;

    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });

    for (const webhook of webhooks) {
        // Create HMAC signature for verification
        const signature = crypto
            .createHmac("sha256", webhook.secret)
            .update(body)
            .digest("hex");

        try {
            const response = await fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": event,
                },
                body,
                signal: AbortSignal.timeout(10000), // 10s timeout
            });

            logger.info(`Webhook delivered`, { event, url: webhook.url, status: response.status });
        } catch (err) {
            logger.error(`Webhook delivery failed`, { event, url: webhook.url, error: err.message });
        }
    }
}

module.exports = { registerWebhook, getUserWebhooks, deleteWebhook, fireWebhook };
