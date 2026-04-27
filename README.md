# Smart Doc API

![CI/CD](https://github.com/theboylexis/smart-doc-api/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <b>Production-Ready Document Intelligence API</b><br/>
  Secure document ingestion, AI-powered analysis, caching, rate limiting, and cloud storage —
  deployed on <b>AWS EC2</b> behind Nginx with SSL.
</p>

<p align="center">
  <a href="https://smartdocapi.duckdns.org/api-docs">Swagger Docs</a> •
  <a href="./smart-doc-api.postman.json">Postman Collection</a>
</p>

---

## 🌐 Live URL

| Resource | URL |
|----------|-----|
| **Interactive API Docs (Swagger)** | https://smartdocapi.duckdns.org/api-docs |
| **API Base URL** | https://smartdocapi.duckdns.org |
| **Health Check** | https://smartdocapi.duckdns.org/health |

The API runs on an **AWS EC2** instance (Ubuntu) with **Nginx** terminating TLS via Let's Encrypt and reverse-proxying to a Docker Compose stack.

---

## 🚀 Overview

Smart Doc API is a scalable backend system that ingests documents (PDF, DOCX, TXT), extracts text, and performs AI-powered analysis using OpenAI.

Built using real-world backend engineering practices:

- Layered architecture (controllers → services → data layer)
- JWT-based authentication
- Redis response caching
- Cloud file storage (**AWS S3**)
- Background job processing (BullMQ + Redis)
- Real-time updates (Socket.io)
- Webhooks with HMAC-signed delivery
- Structured logging (Winston)
- Rate limiting (global, auth-specific, AI-specific)
- Integration & unit testing (Jest)
- Swagger interactive documentation
- Docker, Nginx + SSL, CI/CD with auto-deploy to **AWS EC2**

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-FF6B6B?logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-569A31?logo=amazons3&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-Hosting-FF9900?logo=amazonec2&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Winston](https://img.shields.io/badge/Winston-Logging-525252?logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI--CD-2088FF?logo=github-actions&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API--Docs-85EA2D?logo=swagger&logoColor=black)

---

## 🏗 Architecture

```
                              ┌─────────────┐
                              │   Browser   │
                              │  / Client   │
                              └──────┬──────┘
                                     │  HTTPS (443)
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                        AWS EC2 (Ubuntu)                            │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │                    Nginx (host)                           │    │
│   │   - Terminates SSL (Let's Encrypt / Certbot)              │    │
│   │   - Reverse proxy → 127.0.0.1:3000                        │    │
│   └──────────────────────────┬───────────────────────────────┘    │
│                              │                                     │
│                              ▼                                     │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │             Docker Compose (app-network)                  │    │
│   │   ┌────────────────────┐      ┌────────────────────┐     │    │
│   │   │   Node.js API      │ ───► │      Redis         │     │    │
│   │   │   (Express)        │      │  (cache + BullMQ)  │     │    │
│   │   │   Port 3000        │      └────────────────────┘     │    │
│   │   └─────────┬──────────┘                                 │    │
│   └─────────────┼──────────────────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────────────────┘
                  │
        ┌─────────┼──────────────────────┐
        │         │                      │
        ▼         ▼                      ▼
  ┌──────────┐ ┌──────────────┐  ┌──────────────┐
  │  AWS S3  │ │     Neon     │  │  OpenAI API  │
  │  (Files) │ │ (PostgreSQL) │  │  (Analysis)  │
  └──────────┘ └──────────────┘  └──────────────┘
```

**How a request flows:**

1. **Browser → Nginx** (HTTPS on port 443, SSL terminated by Let's Encrypt cert)
2. **Nginx → Node.js API** (HTTP reverse proxy to `127.0.0.1:3000` — Docker publishes only to localhost)
3. **API → Redis** (cache lookups, BullMQ job queue) — runs in the same Docker network
4. **API → AWS S3** for document uploads and presigned downloads
5. **API → Neon** (managed PostgreSQL) for users, documents, analyses, webhooks
6. **API → OpenAI** for AI analysis (queued via BullMQ, processed by a worker)

---

## 🔐 Core Features

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure register/login with hashed passwords |
| **File Upload** | PDF, DOCX, TXT — stored in AWS S3 |
| **AI Analysis** | Summary, key points, sentiment, custom prompts via OpenAI |
| **Background Processing** | BullMQ workers process jobs asynchronously |
| **Real-time Updates** | Socket.io notifies clients on job completion |
| **Webhooks** | HMAC-signed HTTP callbacks on events |
| **Caching** | Upstash Redis caching to reduce AI costs & latency |
| **Rate Limiting** | Global, auth-specific, and AI-specific limits |
| **Structured Logging** | Winston with JSON (production) and color (development) |
| **API Docs** | Interactive Swagger UI at `/api-docs` |

---

## 📦 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api
cp .env.example .env       # Edit with your API keys
docker compose up --build
```

The API will be running at `http://localhost:3000`.

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL, Redis

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api
npm install
cp .env.example .env       # Edit with your credentials

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# Start the server
npm run dev
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `development`, `test`, or `production` | ✅ |
| `PORT` | Server port (default: 3000) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string (Neon in production) | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | ✅ |
| `REDIS_URL` | Redis TCP URL (for BullMQ) | ✅ |
| `AWS_ACCESS_KEY_ID` | IAM access key for S3 | ✅ |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for S3 | ✅ |
| `AWS_REGION` | S3 bucket region (e.g. `eu-west-1`) | ✅ |
| `S3_BUCKET_NAME` | Name of the S3 bucket for document storage | ✅ |
| `CORS_ORIGIN` | Allowed CORS origin (defaults to `*`) | ❌ |

---

## 📡 API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |
| `POST` | `/api/documents/upload` | Upload a document | ✅ |
| `GET` | `/api/documents` | List all user documents | ✅ |
| `GET` | `/api/documents/:id` | Get a single document | ✅ |
| `POST` | `/api/ai/analyze/:documentId` | Queue AI analysis | ✅ |
| `GET` | `/api/ai/analyses/:documentId` | Get analyses for a document | ✅ |
| `POST` | `/api/webhooks` | Register a webhook URL | ✅ |
| `GET` | `/api/webhooks` | List user webhooks | ✅ |
| `DELETE` | `/api/webhooks/:id` | Delete a webhook | ✅ |
| `GET` | `/api-docs` | Swagger UI documentation | ❌ |
| `GET` | `/health` | Health check | ❌ |

---

## 🚢 Deployment (AWS EC2)

The production stack runs on a single EC2 instance: **Nginx** on the host terminates SSL, and **Docker Compose** runs the Node.js API plus Redis on a private bridge network. Postgres is hosted on **Neon** and files live in **AWS S3** — neither runs on the box.

### One-time server setup

```bash
# SSH into the EC2 instance
ssh -i your-key.pem ubuntu@<EC2_HOST>

# Install Docker, Compose plugin, Nginx, Certbot
sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker ubuntu

# Clone the repo into /home/ubuntu/smart-doc-api
cd /home/ubuntu
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api

# Create production .env (fill in real values)
cp .env.example .env
nano .env

# Issue the SSL certificate (Nginx config must already point smartdocapi.duckdns.org → 127.0.0.1:3000)
sudo certbot --nginx -d smartdocapi.duckdns.org

# First boot
docker compose -f docker-compose.prod.yml up -d --build
```

### Deploying a new release

Pushing to `main` triggers GitHub Actions, which runs the test suite and then SSHes into EC2 to run:

```bash
cd /home/ubuntu/smart-doc-api
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

To deploy manually, run those same four commands on the server.

### Required GitHub Actions secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | Public IP or DNS of the EC2 instance |
| `EC2_USER` | SSH user (typically `ubuntu`) |
| `EC2_SSH_KEY` | Private key matching the instance's authorized key |

---

## 🧰 Postman Collection

A pre-configured Postman collection is included at [`smart-doc-api.postman.json`](./smart-doc-api.postman.json).

**How to use:**
1. Import the file into Postman
2. Set `base_url` to `https://smartdocapi.duckdns.org` for the live API, or `http://localhost:3000` for local testing
3. Run **Register** → **Login**. The Login request has a test script that auto-saves the JWT to the `auth_token` collection variable
4. All subsequent requests use the saved token automatically

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with verbose output
npx jest --forceExit --verbose
```

Tests use mocked dependencies (Prisma, Redis, OpenAI, S3, BullMQ) — no real services needed.

**Test coverage:** 32 tests across 4 suites (auth, documents, AI, webhooks).

---

## 🔄 CI/CD

Every push to `main` and every pull request automatically runs the test suite via **GitHub Actions**. On a successful push to `main`, a `deploy` job SSHes into EC2 and rebuilds the production Docker stack. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

---

## 📁 Project Structure

```
smart-doc-api/
├── .github/workflows/      # CI + deploy pipeline
├── prisma/                  # Database schema & migrations
├── src/
│   ├── config/              # App config, logger, Redis, BullMQ, Swagger
│   ├── controllers/         # Request handlers
│   ├── jobs/                # BullMQ queue & worker
│   ├── middleware/          # Auth, error handler, rate limiter, logger
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic layer
│   ├── app.js               # Express app setup
│   └── server.js            # HTTP server entry point
├── tests/
│   ├── __mocks__/           # Redis & S3 mocks
│   ├── integration/         # Integration test suites
│   ├── mocks.js             # Shared test mocks
│   └── setup.js             # Test environment setup
├── Dockerfile               # Container build
├── docker-compose.yml       # Local dev stack
├── docker-compose.prod.yml  # Production stack (EC2)
└── package.json
```

---

## 📄 License

[MIT](./LICENSE) © Alex Marfo Appiah
