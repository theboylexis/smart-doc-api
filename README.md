# Smart Doc API

![CI](https://github.com/theboylexis/smart-doc-api/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <b>Document Intelligence Backend API</b><br/>
  Secure document ingestion, AI-powered analysis, asynchronous processing,
  caching, webhooks, cloud storage, and production-oriented backend architecture.
</p>

---

## Overview

Smart Doc API is a backend system for ingesting PDF, DOCX, and TXT documents, extracting their contents, and performing AI-powered analysis using OpenAI.

The project was built to explore production-oriented backend engineering concepts including:

- layered architecture
- authentication and authorization
- asynchronous job processing
- caching
- cloud file storage
- real-time updates
- webhooks
- rate limiting
- structured logging
- automated testing
- containerization
- CI/CD
- cloud deployment

The application was previously deployed on **AWS EC2** behind **Nginx with SSL**.

The live deployment has since been taken offline to avoid unnecessary cloud hosting costs for a portfolio project. The repository preserves the backend implementation, Docker configuration, deployment architecture, and CI/CD setup used during the deployment phase.

---

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-FF6B6B?logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-569A31?logo=amazons3&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-Previous_Deployment-FF9900?logo=amazonec2&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=github-actions&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?logo=swagger&logoColor=black)

---

## Architecture

```text
                              ┌─────────────┐
                              │   Client    │
                              └──────┬──────┘
                                     │
                                     ▼
                    ┌─────────────────────────────┐
                    │       Node.js / Express     │
                    │            API              │
                    └──────────────┬──────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      ┌────────────┐       ┌──────────────┐       ┌──────────────┐
      │   Redis    │       │ PostgreSQL   │       │    AWS S3    │
      │ Cache /    │       │    Neon      │       │    Files     │
      │ BullMQ     │       │              │       │              │
      └─────┬──────┘       └──────────────┘       └──────────────┘
            │
            ▼
      ┌────────────┐
      │ BullMQ     │
      │ Worker     │
      └─────┬──────┘
            │
            ▼
      ┌──────────────┐
      │  OpenAI API  │
      │   Analysis   │
      └──────────────┘
```

### Request Flow

1. A client sends a request to the Express API.
2. JWT middleware authenticates protected requests.
3. PostgreSQL stores users, documents, analyses, and webhook metadata.
4. AWS S3 stores uploaded documents.
5. Redis provides caching and queue infrastructure.
6. BullMQ queues long-running AI analysis jobs.
7. Background workers process queued analysis jobs.
8. OpenAI performs document analysis.
9. Socket.io and webhooks can notify clients when processing completes.

---

## Core Features

| Feature | Description |
| --- | --- |
| **JWT Authentication** | Register/login flow with hashed passwords and protected routes |
| **Document Uploads** | PDF, DOCX, and TXT document ingestion |
| **Cloud Storage** | Document storage using AWS S3 |
| **AI Analysis** | Summaries, key points, sentiment, and custom prompts |
| **Background Processing** | BullMQ workers process analysis jobs asynchronously |
| **Caching** | Redis caching to reduce repeated work and latency |
| **Real-Time Updates** | Socket.io notifications for completed jobs |
| **Webhooks** | HMAC-signed callbacks for application events |
| **Rate Limiting** | Global, authentication-specific, and AI-specific limits |
| **Structured Logging** | Winston-based application logging |
| **API Documentation** | Swagger documentation |
| **Testing** | Jest unit and integration tests |
| **Containerization** | Docker and Docker Compose |
| **CI/CD** | GitHub Actions-based automated testing and previous deployment workflow |

---

## API Routes

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and obtain JWT | ❌ |
| `POST` | `/api/documents/upload` | Upload a document | ✅ |
| `GET` | `/api/documents` | List user documents | ✅ |
| `GET` | `/api/documents/:id` | Retrieve one document | ✅ |
| `POST` | `/api/ai/analyze/:documentId` | Queue AI analysis | ✅ |
| `GET` | `/api/ai/analyses/:documentId` | Retrieve document analyses | ✅ |
| `POST` | `/api/webhooks` | Register a webhook | ✅ |
| `GET` | `/api/webhooks` | List user webhooks | ✅ |
| `DELETE` | `/api/webhooks/:id` | Delete a webhook | ✅ |
| `GET` | `/api-docs` | Swagger UI | ❌ |
| `GET` | `/health` | Health check | ❌ |

---

## Quick Start

### Docker

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api

cp .env.example .env
# Add the required credentials to .env

docker compose up --build
```

The API will be available locally at:

```text
http://localhost:3000
```

### Manual Setup

Prerequisites:

- Node.js 18+
- PostgreSQL
- Redis

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api

npm install

cp .env.example .env
# Add the required credentials

npx prisma generate
npx prisma migrate dev

npm run dev
```

---

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `NODE_ENV` | Application environment | ✅ |
| `PORT` | Application port | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API credential | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | ✅ |
| `REDIS_URL` | Redis TCP connection for BullMQ | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS credential for S3 | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS credential for S3 | ✅ |
| `AWS_REGION` | AWS S3 region | ✅ |
| `S3_BUCKET_NAME` | S3 document bucket | ✅ |
| `CORS_ORIGIN` | Allowed application origin | ❌ |

Never commit production secrets or credentials to the repository.

---

## Testing

```bash
npm test
```

Verbose:

```bash
npx jest --forceExit --verbose
```

Tests use mocked dependencies for services including Prisma, Redis, OpenAI, S3, and BullMQ.

**Current test suite:** 32 tests across 4 suites covering authentication, documents, AI analysis, and webhooks.

---

## Previous AWS Deployment

Smart Doc API was previously deployed using the following production architecture:

```text
Internet
   │
   │ HTTPS
   ▼
Nginx
   │
   │ reverse proxy
   ▼
Docker Compose
   │
   ├── Node.js / Express API
   └── Redis
         │
         ├── Neon PostgreSQL
         ├── AWS S3
         └── OpenAI API
```

The production environment used:

- Ubuntu on AWS EC2
- Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL certificates
- Neon PostgreSQL
- AWS S3
- Redis
- GitHub Actions

The EC2 deployment is currently offline to avoid ongoing cloud costs.

The deployment configuration remains in the repository as a record of the production setup and can be reused if the application is deployed again.

---

## CI/CD

GitHub Actions is used to run the automated test suite for repository changes.

The project previously included an automated deployment workflow that deployed successful `main` branch builds to AWS EC2.

The EC2 environment is currently offline, so the repository is maintained as a portfolio project with CI focused on automated testing rather than live production deployment.

---

## Postman Collection

A Postman collection is included at:

```text
smart-doc-api.postman.json
```

To use it locally:

1. Import the collection into Postman.
2. Set:

```text
base_url = http://localhost:3000
```

3. Run **Register**.
4. Run **Login**.
5. The login script stores the JWT for subsequent authenticated requests.

---

## Project Structure

```text
smart-doc-api/
├── .github/
│   └── workflows/              # CI/CD workflow
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/                 # App config, Redis, BullMQ, Swagger, logging
│   ├── controllers/            # HTTP request handlers
│   ├── jobs/                   # Queue and worker logic
│   ├── middleware/             # Auth, errors, rate limiting, logging
│   ├── routes/                 # Express routes
│   ├── services/               # Business logic
│   ├── app.js
│   └── server.js
├── tests/
│   ├── __mocks__/
│   ├── integration/
│   ├── mocks.js
│   └── setup.js
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── smart-doc-api.postman.json
└── package.json
```

---

## Project Status

| Area | Status |
| --- | --- |
| Backend implementation | ✅ Complete |
| Authentication | ✅ Complete |
| Document processing | ✅ Complete |
| AI analysis | ✅ Complete |
| Background jobs | ✅ Complete |
| Redis caching | ✅ Complete |
| Webhooks | ✅ Complete |
| Automated tests | ✅ Passing |
| Docker setup | ✅ Complete |
| AWS deployment | ✅ Previously completed |
| Live EC2 instance | ⏸ Offline |
| Portfolio repository | ✅ Maintained |

---

## What I Learned

This project provided hands-on experience with:

- structuring a larger backend application
- separating controllers, services, and infrastructure concerns
- designing asynchronous processing workflows
- integrating external APIs and cloud services
- working with Redis and job queues
- designing authenticated REST APIs
- containerizing backend services
- configuring a reverse proxy and TLS
- deploying and maintaining an application on AWS
- building automated test and CI/CD workflows
- balancing production architecture with practical infrastructure cost

---

## License

[MIT](./LICENSE) © Alex Marfo Appiah
