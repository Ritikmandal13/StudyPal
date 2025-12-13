# API Reference (MVP)

Base URL: `http://localhost:3001`

## POST /api/upload
- Form-data: `pdf` (file, required)
- Returns: `{ jobId, status }`

## GET /api/status/:jobId
- Returns: `{ jobId, status, progress, step, error? }`

## POST /api/callback (worker -> backend)
- Body: `{ jobId, chunks, metadata, status, secret }`
- Auth: shared secret `CALLBACK_SECRET`

## POST /api/summarize
- Body: `{ jobId }`
- Returns: `{ notes, flashcards, quiz }`

## POST /api/regenerate/:type
- Params: `type` in `notes|flashcards|quiz`
- Body: `{ jobId }`

## GET /api/results/:jobId
- Returns generated content and metadata.

## GET /api/history
- Returns history list (mock).

## DELETE /api/history/:id
- Deletes history item.

## GET /api/preferences
- Returns stored preferences (mock).

## PUT /api/preferences
- Body: `{ summaryLength, quizDifficulty, flashcardCount, theme }`

## Errors
- Standard: `{ error, code, details? }`
- Common codes: INVALID_FILE_TYPE, FILE_TOO_LARGE, TOO_MANY_PAGES, JOB_NOT_FOUND, CHUNKS_NOT_READY, GENERATION_FAILED, RATE_LIMITED.

