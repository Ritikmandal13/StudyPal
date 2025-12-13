# StudyPal Architecture

## Overview
- Frontend: React + Vite (Tailwind) — upload, status polling, results.
- Backend: Express MCP server — upload, status, summarize, history, preferences.
- Worker: Python (Flask) — PDF parsing + chunking.
- Storage: Local JSON/files (mock) with TODOs for Raindrop SmartBuckets/SmartSQL/SmartMemory.
- AI: Mocked SmartInference call with prompts (replace with Raindrop SmartInference).

## Flow
1) User uploads PDF -> `/api/upload`
2) Backend stores file locally (TODO SmartBuckets) and creates job
3) Backend POSTs job to Worker `/parse` with callback URL
4) Worker extracts text + metadata, chunks, POSTs to `/api/callback`
5) Backend marks job `chunking_complete`
6) Frontend polls `/api/status/:jobId` -> when chunks ready calls `/api/summarize`
7) Backend generates (mock) notes/flashcards/quiz -> saves results -> job `completed`
8) Frontend fetches `/api/results/:jobId` and renders

## Components
- Backend routes: upload, summarize, history, status, callback.
- Middleware: rate limiting, file validation, error handler.
- Utils: storage (JSON), validation, prompts.
- Worker modules: pdf_parser (pdfplumber/PyPDF2), text_chunker (headings + paragraphs).
- Frontend: Upload, ProgressTracker, Notes, Flashcards, Quiz, History, Login.

## Status States
uploading -> parsing -> chunking_complete -> summarizing -> completed | error

## Integration Points (TODO)
- SmartBuckets: file + chunk storage
- SmartSQL: jobs/history persistence
- SmartMemory: user preferences
- SmartInference: real generation calls

## Deployment
- docker-compose for local dev (frontend 5173, backend 3001, worker 5000)
- Vultr: containerize worker; backend as MCP; frontend static hosting

