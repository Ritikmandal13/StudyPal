# StudyPal Backend

Express.js API server for StudyPal.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## API Endpoints

### Upload & Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF file |
| GET | `/api/status/:jobId` | Get job progress |
| POST | `/api/callback` | Worker callback (internal) |

### Content Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summarize` | Generate study materials |
| POST | `/api/regenerate/:type` | Regenerate content |
| GET | `/api/results/:jobId` | Get results |

### History & Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | List sessions |
| DELETE | `/api/history/:id` | Delete session |
| GET | `/api/preferences` | Get preferences |
| PUT | `/api/preferences` | Update preferences |

## Environment Variables

```env
PORT=3001
WORKER_URL=http://localhost:5000
CALLBACK_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
src/
├── server.js           # Express app setup
├── routes/
│   ├── upload.js       # File upload handling
│   ├── summarize.js    # AI generation
│   ├── history.js      # Session history
│   └── status.js       # Job status
├── utils/
│   ├── storage.js      # Local JSON storage
│   ├── errorHandler.js # Error handling
│   └── validation.js   # Input validation
├── middleware/
│   ├── fileValidator.js # PDF validation
│   └── rateLimiter.js   # Rate limiting
└── prompts/
    ├── notesPrompt.txt
    ├── flashcardPrompt.txt
    └── quizPrompt.txt
```

## Raindrop Integration Points

The codebase includes TODO comments where Raindrop APIs should be integrated:

- **SmartBuckets**: File storage in `routes/upload.js`
- **SmartSQL**: Data persistence in `utils/storage.js`
- **SmartMemory**: User preferences in `routes/history.js`
- **SmartInference**: AI generation in `routes/summarize.js`
