# Smart Doc API

A production-ready document intelligence API that ingests uploaded documents (PDF, DOCX, TXT), extracts text, and performs AI-powered analysis using OpenAI. Features JWT authentication, Redis caching, Cloudinary file storage, input validation, and rate limiting.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express** | HTTP framework |
| **PostgreSQL + Prisma** | Database & ORM |
| **OpenAI (GPT-4o-mini)** | AI document analysis |
| **Cloudinary** | File storage |
| **Redis (Upstash)** | Response caching |
| **Jest + Supertest** | Testing |
| **Swagger** | API documentation |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Cloudinary account
- Redis instance (Upstash recommended)

### Installation

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/smartdocapi
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run

```bash
# Development
npm run dev

# Production
npm start

# Tests
npm test
```

## API Documentation

Interactive docs available at **`/api-docs`** when the server is running.

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |

#### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload a document (PDF, DOCX, TXT) |
| GET | `/api/documents` | Get all user documents |
| GET | `/api/documents/:id` | Get a single document |

#### AI Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze/:documentId` | Analyze a document |
| GET | `/api/ai/analyses/:documentId` | Get analyses for a document |

### Analysis Types

- `summary` — Summary, key points, and sentiment
- `key_points` — Key points and topic categories
- `sentiment` — Sentiment, tone, and confidence score
- `custom` — Custom prompt analysis

### Authentication

All document and AI endpoints require a JWT token:

```
Authorization: Bearer <token>
```

## Rate Limits

| Scope | Limit |
|-------|-------|
| Global | 100 requests / 15 min |
| Auth | 10 requests / 15 min |
| AI | 20 requests / 15 min |

## Project Structure

```
src/
├── config/         # DB, Redis, Cloudinary, Swagger, AI prompts
├── controllers/    # Request handlers
├── middleware/      # Auth, validation, rate limiting, error handling
├── routes/         # Route definitions with Swagger annotations
├── services/       # Business logic (auth, upload, AI, text extraction)
├── app.js          # Express app setup
└── server.js       # Server entry point
tests/
├── __mocks__/      # Redis & Cloudinary mocks
├── integration/    # API endpoint tests
├── mocks.js        # Shared test mocks
└── setup.js        # Test environment setup
```

## License

ISC
