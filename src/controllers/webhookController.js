const { registerWebhook, getUserWebhooks, deleteWebhook } = require("../services/webhookService");

async function register(req, res, next) {
    try {
        const { url, events } = req.body;

        if (!url) {
            return res.status(400).json({ error: "Webhook URL is required" });
        }

        const webhook = await registerWebhook(req.user.id, url, events);

        res.status(201).json({
            message: "Webhook registered successfully",
            webhook: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
                secret: webhook.secret, // Show once on creation
                active: webhook.active,
                createdAt: webhook.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function list(req, res, next) {
    try {
        const webhooks = await getUserWebhooks(req.user.id);

        // Don't expose secrets in list view
        const sanitized = webhooks.map(({ secret, ...rest }) => rest);

        res.json({ webhooks: sanitized });
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        const result = await deleteWebhook(req.params.id, req.user.id);

        if (!result) {
            return res.status(404).json({ error: "Webhook not found" });
        }

        res.json({ message: "Webhook deleted successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, list, remove };
