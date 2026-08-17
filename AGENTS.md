## Learned User Preferences
- Prefer TypeScript over JavaScript for frontend changes.
- Match existing README and docs style; do not use emojis in documentation.
- Prefer the existing axios-based frontend API proxying; avoid adding duplicate proxy layers.
- Respect Digimon API rate limits and usage expectations when fetching digimon data.
- When debugging local paths or tooling, ignore OneDrive-related sync or path noise unless it is the actual failure.
- Implement attached plans as specified without editing the plan file itself.

## Learned Workspace Facts
- Portfolio hub app with Docker Compose services: React/TypeScript frontend on port 3000, Flask/Gunicorn backend on 8080, FastAPI voice service on 8081.
- Production deploys on EC2 behind nginx reverse-proxying to the frontend container on port 3000; live hosts include www.josepharessler.com and aws.josepharessler.com.
- Auth uses HttpOnly cookie sessions restored via GET /api/auth/check rather than bearer JWTs stored in JavaScript.
- Digimon Dex consumes digi-api.com and renders selections in Three.js / React Three Fiber with blue forward and red backward evolution egg matrices.
- Chat uses LlamaIndex over persisted per-game stores under backend/utils/vector_db/storage (storage_wows, storage_warcraft, storage_lol), with a GraphRAG PropertyGraphIndex upgrade from simple RAG.
- Frontend must reach both the Flask API and the voice service (8081) for chat with optional TTS/STT.
- Local development typically needs a reachable MySQL instance (often a separate local Docker MySQL); remote EC2 MySQL is commonly unreachable from local machines.
- Featured GitHub repositories are a frontend-only `/repos` page; add or remove entries in `frontend/src/data/featuredRepos.ts` rather than calling the GitHub API.
