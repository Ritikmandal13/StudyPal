You are generating a complete MVP repository for **StudyPal** — an AI study assistant that takes an uploaded PDF and produces (1) clean notes, (2) flashcards, and (3) a quiz. The goal is a deployable demo-quality project that fulfills AI Champion Ship requirements (Raindrop + Vultr). Build clean, modular code.

===========================
PROJECT REQUIREMENTS
===========================

TECH STACK:
- Backend: Node.js (Express) running as a Raindrop MCP server
- Worker: Python PDF parsing worker deployed on Vultr
- Frontend: React (Vite)
- Persistence: mock local JSON files but include TODO comments showing where Raindrop SmartBuckets / SmartSQL / SmartMemory calls go
- SmartInference: include prompt templates + example inference call

CONSTRAINTS:
- Max PDF file size: 10MB
- Max pages per PDF: 100
- Supported formats: .pdf only
- Chunk size: ~500-700 words (prefer natural breaks at headings/paragraphs)
- Rate limit: 5 uploads per user per hour (mocked)
- Concurrent processing: 3 jobs max (mocked queue)

MVP FEATURES:
1. Upload PDF → stored in SmartBuckets (mocked locally)
2. Backend sends PDF to Vultr worker → worker extracts text → returns JSON chunks
3. Backend calls Raindrop SmartInference to generate:
   - Summary notes (5–8 bullet points per chunk)
   - Flashcards (Q/A pairs, 10-15 per document)
   - Quiz (5 multiple-choice questions with answers)
4. Frontend displays:
   - Notes (collapsible sections)
   - Flashcards (flip animation, keyboard nav)
   - Quiz (interactive with scoring)
   - History page (mocked, replaceable by SmartSQL)
5. Simple email login stub (no real auth, session-based)
6. User preferences (summary length, quiz difficulty) stored in SmartMemory (mocked locally)
7. Export functionality (download notes as PDF/Markdown)

===========================
REPO STRUCTURE
===========================

/backend
  /src
    server.js
    /routes
      upload.js
      summarize.js
      history.js
      status.js
    /utils
      parseCallback.js
      storage.js
      validation.js
      errorHandler.js
    /prompts
      notesPrompt.txt
      flashcardPrompt.txt
      quizPrompt.txt
    /middleware
      rateLimiter.js
      fileValidator.js
  /data
    jobs.json
    history.json
    preferences.json
  package.json
  backend.README.md

/tests
  /backend
    upload.test.js
    summarize.test.js
    validation.test.js

/worker
  worker.py
  pdf_parser.py
  text_chunker.py
  worker_test.py
  requirements.txt
  Dockerfile
  worker.README.md

/frontend
  /src
    /components
      Upload.jsx
      Notes.jsx
      Flashcards.jsx
      Quiz.jsx
      ProgressTracker.jsx
      Navbar.jsx
      ExportButton.jsx
    /pages
      HomePage.jsx
      ResultsPage.jsx
      HistoryPage.jsx
      LoginPage.jsx
    /hooks
      useJobStatus.js
      useLocalStorage.js
    /utils
      api.js
      formatters.js
    /styles
      (CSS modules or Tailwind)
    App.jsx
    main.jsx
  package.json
  vite.config.js
  frontend.README.md

/sample-pdfs
  sample-biology.pdf
  sample-history.pdf
  README.md

/docs
  architecture.md
  prompts.md
  api-reference.md
  demo_video_script.md
  deployment.md

docker-compose.yml
.env.example
.gitignore
LICENSE (MIT)
README.md

===========================
API ENDPOINTS
===========================

UPLOAD & PROCESSING:
- POST   /api/upload          - Upload PDF, returns jobId
- GET    /api/status/:jobId   - Poll job progress (0-100%)
- POST   /api/callback        - Worker returns extracted chunks (internal)

CONTENT GENERATION:
- POST   /api/summarize       - Generate notes, flashcards, quiz
- POST   /api/regenerate/:type - Regenerate specific content (notes|flashcards|quiz)
- GET    /api/results/:jobId  - Get generated content

HISTORY & PREFERENCES:
- GET    /api/history         - List past sessions
- DELETE /api/history/:id     - Delete a session
- GET    /api/preferences     - Get user preferences
- PUT    /api/preferences     - Update preferences

===========================
IMPLEMENTATION DETAILS
===========================

BACKEND REQUIREMENTS:

POST /api/upload
  - Validate file (must be PDF, ≤10MB, ≤100 pages)
  - Generate unique jobId (UUID)
  - Store file locally in /data/uploads/ (TODO: SmartBuckets upload)
  - Create job entry with status: "uploading"
  - Send async job to Vultr worker (HTTP POST with callback URL)
  - Return { jobId, status: "processing" }

GET /api/status/:jobId
  - Return { jobId, status, progress, step, error? }
  - Steps: uploading → parsing → chunking → summarizing → completed
  - Progress: 0-100 percentage

POST /api/callback (internal, called by worker)
  - Receive JSON chunks of extracted text
  - Validate callback token
  - Save to /data/chunks/{jobId}.json (TODO: SmartBuckets / SmartSQL)
  - Update job status to "chunking_complete"

POST /api/summarize
  - Calls mock SmartInference function
  - Uses prompts from /prompts/*.txt
  - Returns { notes, flashcards, quiz }
  - Save results to /data/results/{jobId}.json

Error Handling:
  - All endpoints return consistent error format: { error: string, code: string, details?: object }
  - Use centralized errorHandler middleware
  - Log errors with timestamp and jobId

---

WORKER REQUIREMENTS:

Input: PDF file URL or base64
Output: JSON with extracted chunks

Processing Steps:
1. Download/decode PDF
2. Extract text using pdfplumber (fallback: PyPDF2)
3. Extract metadata (title, author, page count, creation date)
4. Detect if scanned PDF (low text density) → return error with OCR suggestion
5. Split into chunks:
   - Prefer natural breaks (headings, double newlines)
   - Fallback to ~500-700 words
   - Maintain paragraph integrity
6. Return JSON to callback endpoint:
   {
     "jobId": "uuid",
     "metadata": { "title": "", "pages": 0, "wordCount": 0 },
     "chunks": [
       { "index": 0, "text": "...", "pageRange": [1, 3] }
     ],
     "status": "success"
   }

Error Handling:
  - Timeout after 60 seconds
  - Retry callback 3 times on failure
  - Return structured error: { "jobId": "", "status": "error", "error": "message" }

---

FRONTEND REQUIREMENTS:

Pages:
1. LoginPage - Email input stub, stores in localStorage
2. HomePage - Upload zone with drag-drop, recent uploads
3. ResultsPage - Tabbed view (Notes | Flashcards | Quiz)
4. HistoryPage - List of past sessions with delete option

Components:
- ProgressTracker: Visual stepper showing current processing stage
- Notes: Collapsible sections, copy button, export to Markdown
- Flashcards: Card flip animation, keyboard nav (←→), shuffle button
- Quiz: MCQ with immediate feedback, final score, retry option

State Management:
- Use React Context for user session
- useJobStatus hook: polls /api/status every 2 seconds until complete
- Store results in localStorage for offline access

UX Requirements:
- Loading skeletons during fetch
- Toast notifications for errors/success
- Mobile responsive (test at 375px width)
- Keyboard accessible (tab navigation, enter to submit)
- Dark/Light mode toggle

===========================
PROMPTS
===========================

Place in /backend/src/prompts/

notesPrompt.txt:
"""
You are a study assistant. Given the following text chunk from a document, create clear and concise study notes.

Rules:
- Create 5-8 bullet points
- Focus on key concepts, definitions, and important facts
- Use simple language suitable for students
- Highlight any formulas, dates, or named entities
- Do not add information not present in the text

Text:
{chunk}

Output format:
- Bullet point 1
- Bullet point 2
...
"""

flashcardPrompt.txt:
"""
You are a study assistant. Create flashcards from the following text for effective memorization.

Rules:
- Create 3-5 Q&A pairs per chunk
- Questions should test understanding, not just recall
- Answers should be concise (1-2 sentences)
- Include definition cards for key terms
- Vary question types (what, why, how, compare)

Text:
{chunk}

Output format (JSON):
[
  { "question": "...", "answer": "..." }
]
"""

quizPrompt.txt:
"""
You are a study assistant. Create a multiple-choice quiz from the following text.

Rules:
- Create 5 questions total
- Each question has 4 options (A, B, C, D)
- Only one correct answer per question
- Include mix of difficulty levels
- Distractors should be plausible but clearly wrong
- Cover main concepts from the text

Text:
{chunk}

Output format (JSON):
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A",
    "explanation": "Brief explanation why A is correct"
  }
]
"""

Also include `/docs/prompts.md` showing example inputs and outputs.

===========================
SECURITY CONSIDERATIONS
===========================

File Validation:
- Check MIME type (application/pdf)
- Verify magic bytes (PDF header: %PDF-)
- Scan filename for path traversal attempts
- Sanitize all user inputs

API Security:
- CORS: whitelist frontend origin only
- Callback endpoint: validate shared secret token
- Rate limiting: 5 uploads/hour per IP/user
- Request size limit: 15MB

Data Handling:
- Sanitize extracted text before AI processing
- Don't log full document contents
- Auto-delete uploaded files after 24 hours (TODO: implement cleanup job)

===========================
ERROR HANDLING
===========================

Error Codes:
- INVALID_FILE_TYPE: "Only PDF files are supported"
- FILE_TOO_LARGE: "File exceeds 10MB limit"
- TOO_MANY_PAGES: "PDF exceeds 100 page limit"
- PARSING_FAILED: "Could not extract text from PDF"
- SCANNED_PDF: "This appears to be a scanned document. OCR not supported."
- PROCESSING_TIMEOUT: "Processing took too long. Please try a smaller file."
- RATE_LIMITED: "Too many requests. Please wait before uploading again."
- JOB_NOT_FOUND: "Session not found or expired"
- GENERATION_FAILED: "AI generation failed. Please try again."

Frontend Error Display:
- Show user-friendly message
- Offer retry button where applicable
- Log technical details to console (dev mode)

===========================
TESTING
===========================

Backend (Jest):
- upload.test.js: file validation, job creation
- summarize.test.js: prompt formatting, response parsing
- validation.test.js: PDF validation, size limits
- Mock SmartInference responses

Worker (pytest):
- test_pdf_parser.py: text extraction accuracy
- test_chunker.py: chunk size, boundary detection
- test_error_handling.py: corrupt PDFs, empty files
- Include sample PDFs in /worker/test_files/

Frontend (Vitest + React Testing Library):
- Component rendering tests
- User interaction flows
- API mocking with MSW

===========================
DEPLOYMENT
===========================

Local Development:
```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Worker: http://localhost:5000
```

Environment Variables (.env.example):
```
# Backend
PORT=3001
WORKER_URL=http://worker:5000
CALLBACK_SECRET=your-secret-token
RAINDROP_API_KEY=your-key (TODO)
VULTR_API_KEY=your-key (TODO)

# Worker
CALLBACK_URL=http://backend:3001/api/callback
CALLBACK_SECRET=your-secret-token

# Frontend
VITE_API_URL=http://localhost:3001
```

Production (Vultr):
- Deploy worker as container on Vultr Container Platform
- Backend as Raindrop MCP server
- Frontend as static site (Vultr Object Storage or CDN)
- See /docs/deployment.md for step-by-step guide

===========================
DEMO PREPARATION
===========================

Sample Data:
- Include 2-3 sample PDFs in /sample-pdfs/
- Pre-generate results for instant demo
- Seed history with 5 mock sessions

Demo Script (/docs/demo_video_script.md):
1. Show login (5 sec)
2. Upload sample PDF (10 sec)
3. Watch progress animation (15 sec)
4. Browse notes, highlight export feature (20 sec)
5. Flip through flashcards with keyboard (15 sec)
6. Take quiz, show score (20 sec)
7. Show history page (10 sec)
8. Mention Raindrop/Vultr integration points (15 sec)

===========================
OUTPUT FORMAT
===========================

IMPORTANT:
- Output the repo tree first.
- Then output files one by one: "FILE: path/to/file" → contents.
- Keep files small and modular (< 200 lines each).
- No giant files.
- Include comments for where Raindrop SmartComponents and Vultr APIs will integrate.
- Use modern ES6+ syntax and React hooks.
- Follow consistent code style (Prettier defaults).

Begin by printing the full repo tree.
