# Smart Doc API

<p align="center">
  <b>Production-Ready Document Intelligence API</b><br/>
  Secure document ingestion, AI-powered analysis, caching, rate limiting, and cloud storage.
</p>

---

## 🚀 Overview

Smart Doc API is a scalable backend system that ingests documents (PDF, DOCX, TXT), extracts text, and performs AI-powered analysis using OpenAI.

Built using real-world backend engineering practices:

- Layered architecture (controllers → services → data layer)
- JWT-based authentication
- Redis response caching
- Cloud file storage
- Structured validation & centralized error handling
- Rate limiting (global, auth-specific, AI-specific)
- Integration & unit testing
- Swagger interactive documentation

This project demonstrates production-level backend patterns suitable for SaaS systems.

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API--Docs-85EA2D?logo=swagger&logoColor=black)

---

## 🔐 Core Features

- Secure JWT Authentication
- File Upload (PDF, DOCX, TXT)
- AI Document Analysis (summary, key points, sentiment, custom prompts)
- Redis (Upstash) caching to reduce AI costs and latency
- Cloudinary-based document storage
- PostgreSQL + Prisma ORM
- Centralized validation & error handling
- Rate limiting (Global, Auth, AI)
- Swagger documentation
- Integration & unit tests

---

## 📦 Installation

```bash
git clone https://github.com/theboylexis/smart-doc-api.git
cd smart-doc-api
npm install

