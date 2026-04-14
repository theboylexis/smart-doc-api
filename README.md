# Smart Doc API

![CI/CD](https://github.com/theboylexis/smart-doc-api/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <b>Production-Ready Document Intelligence API</b><br/>
  Secure document ingestion, AI-powered analysis, caching, rate limiting, and cloud storage.
</p>

<p align="center">
  <a href="https://smart-doc-api-production.up.railway.app">Live API</a> •
  <a href="https://smart-doc-api-production.up.railway.app/api-docs">Swagger Docs</a> •
  <a href="./smart-doc-api.postman.json">Postman Collection</a>
</p>

---

## 🚀 Overview

Smart Doc API is a scalable backend system that ingests documents (PDF, DOCX, TXT), extracts text, and performs AI-powered analysis using OpenAI.

Built using real-world backend engineering practices:

- Layered architecture (controllers → services → data layer)
- JWT-based authentication
- Redis response caching
- Cloud file storage (Cloudinary)
- Background job processing (BullMQ + Redis)
- Real-time updates (Socket.io)
- Webhooks with HMAC-signed delivery
- Structured logging (Winston)
- Rate limiting (global, auth-specific, AI-specific)
- Integration & unit testing (Jest)
- Swagger interactive documentation
- Docker & CI/CD ready

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-FF6B6B?logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Winston](https://img.shields.io/badge/Winston-Logging-525252?logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=github-actions&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API--Docs-85EA2D?logo=swagger&logoColor=black)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT REQUEST                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  EXPRESS SERVER                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │  Helmet   │  │   CORS   │  │  Logger  │  │   Rate Limiter     │   │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘   │
│                               │                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     JWT AUTH MIDDLEWARE                       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                               │                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│  │ Auth Routes│ │Upload Route│ │  AI Routes │ │Webhook Routes  │    │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └──────┬─────────┘    │
│        │              │              │               │               │
│  ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐   │
│  │Controllers │ │Controllers │ │Controllers │ │ Controllers    │   │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └──────┬─────────┘   │
│        │              │              │               │               │
│  ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐   │
│  │  Services  │ │  Services  │ │  Services  │ │   Services     │   │
│  └────────────┘ └─────┬──────┘ └─────┬──────┘ └──────┬─────────┘   │
└───────────────────────┼──────────────┼───────────────┼──────────────┘
                        │              │               │
        ┌───────────────┼──────────────┤               │
        ▼               ▼              ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
  │Cloudinary│   │ Postgres │   │ BullMQ   │   │  Webhook     │
  │ (Files)  │   │ (Prisma) │   │ (Redis)  │   │  Delivery    │
  └──────────┘   └──────────┘   └─────┬────┘   └──────────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │  Worker  │──► OpenAI API
                                │ (Async)  │──► Socket.io (realtime)
                                └──────────┘──► Webhook (HTTP POST)
```

---

## 🔐 Core Features

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure register/login with hashed passwords |
| **File Upload** | PDF, DOCX, TXT — stored in Cloudinary |
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
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | ✅ |
| `REDIS_URL` | Redis TCP URL (for BullMQ) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
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

## 🧰 Postman Collection

A pre-configured Postman collection is included at [`smart-doc-api.postman.json`](./smart-doc-api.postman.json).

**How to use:**
1. Import the file into Postman
2. The `base_url` variable defaults to the live Railway deployment — change it to `http://localhost:3000` for local testing
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

Tests use mocked dependencies (Prisma, Redis, OpenAI, Cloudinary, BullMQ) — no real services needed.

**Test coverage:** 32 tests across 4 suites (auth, documents, AI, webhooks).

---

## 🔄 CI/CD

Every push to `main` and every pull request automatically runs the test suite via **GitHub Actions**. See `.github/workflows/ci.yml`.

---

## 📁 Project Structure

```
smart-doc-api/
├── .github/workflows/      # CI pipeline
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
│   ├── __mocks__/           # Redis & Cloudinary mocks
│   ├── integration/         # Integration test suites
│   ├── mocks.js             # Shared test mocks
│   └── setup.js             # Test environment setup
├── Dockerfile               # Container build
├── docker-compose.yml       # Local dev stack
└── package.json
```

---

## 📄 License

[MIT](./LICENSE) © Alex Marfo Appiah
