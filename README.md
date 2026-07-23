# Joseph Ressler Hub App

Portfolio application for Joseph A. Ressler. The site combines a personal landing page with interactive demos: a Digimon evolution explorer, a FAQ retrieval chat over game support corpora, authenticated game ratings, and optional speech input and output.

Live surfaces:

- Primary site: https://www.josepharessler.com
- AWS deployment: https://aws.josepharessler.com
- Google Cloud Run (legacy single-container path): https://gcr.josepharessler.com

## What it demonstrates

The project is meant to read as a working product, not a slide deck of tools. Visitors can browse Digimon data in a 3D scene, ask support-style questions against indexed FAQ material for World of Warships, World of Warcraft, and League of Legends, and rate games after signing in. Voice transcription and text-to-speech are available when the voice service is running.

## Architecture

```
Browser (React + TypeScript)
    |
    |  /api/*  (session cookie)
    v
Flask API (Gunicorn) ---- MySQL
    |                \
    |                 +-- LlamaIndex vector stores (per game corpus)
    |
    +-- FastAPI voice service (STT / TTS)
```

Containers are orchestrated with Docker Compose. The frontend talks to Flask under `/api` and to the voice service under `/voice` (or `REACT_APP_VOICE_URL` in local development). Flask owns authentication, game data, RAG chat, and health checks. The voice container handles speech conversion so the API process stays focused on request routing and retrieval.

Backend routes are split into Flask blueprints (`auth`, `games`, `chat`, `health`, `voice`, spa fallback). Chat answers are assembled in a small service layer that queries the vector index and, when requested, asks the voice service for TTS audio.

## Stack

Frontend: React, TypeScript, React Router, Redux for session user state, Three.js / React Three Fiber for Digimon Dex, Framer Motion for a few page transitions.

Backend: Python, Flask, Gunicorn, MySQL, LlamaIndex, OpenAI embeddings and chat completion for RAG.

Voice: FastAPI, Vosk for speech-to-text, TTS endpoint consumed by the chat service.

Ops: Docker and Docker Compose, Nginx reverse proxy in deployed environments, Jenkins and GitHub-oriented CI/CD history, AWS (EC2 / Lightsail / DNS / TLS) and an earlier Google Cloud Run packaging.

## Design decisions

Cookie sessions instead of bearer JWTs. The SPA and API share a site origin behind the reverse proxy, so HttpOnly session cookies keep auth simple and avoid storing tokens in JavaScript. The frontend restores the session on boot with `GET /api/auth/check` so protected routes do not bounce a still-valid user to login after refresh.

Separate voice service instead of embedding STT/TTS in Flask. Speech pipelines pull in heavier native dependencies and different scaling characteristics. Isolating them keeps API workers lighter and lets voice fail or restart without taking down game and auth routes.

Persisted LlamaIndex stores per corpus (`storage_wows`, `storage_warcraft`, `storage_lol`) rather than rebuilding embeddings on every request. Rebuilds are an offline job when FAQ source material changes.

Frontend owns the primary SPA shell in production Compose; Flask still provides a static fallback for environments that historically served the build from the API container.

Debug-only storage and static listing endpoints are disabled unless `ENABLE_DEBUG_ROUTES` is enabled. API error responses return generic client messages while details go to server logs.

## Repository layout

```
frontend/     React app, Digimon scene modules, shared Digimon-inspired styling
backend/      Flask factory, blueprints, domain modules, vector store data
voice/        FastAPI speech service
docker-compose.yml
docker-compose.dev.yml
ddl.sql       Database schema reference
```

## Running locally

Prerequisites: Docker, Docker Compose, and a MySQL instance reachable from the backend container. Copy `.env.example` to `.env` and fill in database credentials, `FLASK_SECRET_KEY`, and `OPENAI_API_KEY` if you intend to exercise chat.

Development compose:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Typical ports: frontend `3000`, Flask `8080`, voice `8081`.

Production-style compose:

```bash
docker compose up --build
```

Vector indexes under `backend/utils/vector_db/storage/` must be present for chat contexts to answer. If stores are missing, rebuild them with the project’s LlamaIndex build script before testing `/chat`.

## Auth and protected features

Registration and login create a server session. Chat and game rating require that session. After a full page reload, the client calls `/api/auth/check` once; protected views wait for that check so a valid cookie is not treated as logged out.

## Related game project

Zenatria is a separate Steam title. A store widget appears on the home page for anyone who wants to follow that work: https://store.steampowered.com/app/2928010/

## Author

Joseph A. Ressler

- Resume (served by the site): `/Ressler_Joseph_Resume.pdf`
- LinkedIn: https://www.linkedin.com/in/joseph-ressler/
- GitHub: https://github.com/joeressler
