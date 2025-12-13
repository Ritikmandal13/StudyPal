# Deployment Guide (MVP)

## Local (Docker)
```bash
cp .env.example .env
docker-compose up --build
# frontend:5173 backend:3001 worker:5000
```

## Backend (Raindrop MCP)
- Containerize backend; expose 3001.
- Configure MCP server with RAINDROP_API_KEY, CALLBACK_SECRET.
- TODO: replace local storage with SmartBuckets/SmartSQL.

## Worker (Vultr Container Platform)
```bash
docker build -t studypal-worker ./worker
docker push vcr.vultr.com/<registry>/studypal-worker
```
- Set env: CALLBACK_URL, CALLBACK_SECRET.

## Frontend
- `npm run build` -> deploy `dist/` to static hosting (Vultr Object Storage/CDN).

## Environment
- Backend: PORT, WORKER_URL, CALLBACK_SECRET, FRONTEND_URL, RAINDROP_API_KEY.
- Worker: CALLBACK_URL, CALLBACK_SECRET.
- Frontend: VITE_API_URL.

## Notes
- HTTPS for production.
- Configure CORS to allowed origin.
- Add health checks for backend/worker.

