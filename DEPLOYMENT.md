# Deployment Guide — Smart Doc API

This guide covers deploying Smart Doc API to production using **Render** (recommended for free tier).

---

## Prerequisites

Before deploying, you'll need accounts and credentials for:

| Service | Purpose | Free Tier? |
|---------|---------|------------|
| [Render](https://render.com) | App hosting | ✅ Free web service |
| [Neon](https://neon.tech) | PostgreSQL database | ✅ Free tier |
| [Upstash](https://upstash.com) | Redis (caching + BullMQ) | ✅ Free tier |
| [Cloudinary](https://cloudinary.com) | File storage | ✅ Free tier |
| [OpenAI](https://platform.openai.com) | AI analysis | 💰 Pay-as-you-go |

---

## Step 1: Prepare Your Database (Neon)

1. Create a **Neon** project at [neon.tech](https://neon.tech)
2. Copy the **connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`)
3. Save this as your `DATABASE_URL`

---

## Step 2: Deploy to Render

### 2a. Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repository: `theboylexis/smart-doc-api`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `smart-doc-api` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npx prisma generate` |
| **Start Command** | `node src/server.js` |
| **Plan** | Free |

### 2b. Set Environment Variables

In the Render dashboard, add these env vars:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your Neon connection string>
JWT_SECRET=<generate a random 64-char hex string>
OPENAI_API_KEY=<your OpenAI key>
UPSTASH_REDIS_REST_URL=<your Upstash REST URL>
UPSTASH_REDIS_REST_TOKEN=<your Upstash REST token>
REDIS_URL=<your Upstash Redis TCP URL>
CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
CLOUDINARY_API_KEY=<your Cloudinary API key>
CLOUDINARY_API_SECRET=<your Cloudinary API secret>
```

> **Tip:** Generate a JWT secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 2c. Run Database Migration

After the first deploy, open Render's **Shell** tab and run:

```bash
npx prisma migrate deploy
```

This creates your database tables in production.

---

## Step 3: Verify Deployment

1. Visit `https://smart-doc-api.onrender.com/health` — should return `{"status":"OK"}`
2. Visit `https://smart-doc-api.onrender.com/api-docs` — Swagger UI should load
3. Test auth flow via Postman using the production URL

---

## Important Notes

### Free Tier Limitations (Render)
- **Cold starts:** Free web services spin down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.
- **Build minutes:** Limited monthly build minutes on free plan.

### Production Best Practices
- Use a strong, unique `JWT_SECRET` (not the development one)
- Never commit `.env` files to Git
- Run `npx prisma migrate deploy` (not `migrate dev`) in production

### Scaling Later
When you're ready to scale beyond free tier:
- **Render Pro** ($7/mo): No cold starts, more RAM, custom domains
- **Railway** alternative: Similar pricing, different DX
- **Docker deployment**: Use the included `Dockerfile` on any VPS (DigitalOcean, AWS EC2, etc.)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `prisma: command not found` | Make sure build command includes `npm ci` |
| Database connection error | Verify `DATABASE_URL` has `?sslmode=require` |
| BullMQ connection error | Ensure `REDIS_URL` uses `rediss://` (TLS) for Upstash |
| OpenAI 401 error | Check `OPENAI_API_KEY` is valid and has credits |
