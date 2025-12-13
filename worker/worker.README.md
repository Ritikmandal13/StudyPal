# StudyPal PDF Worker

Python service for extracting text from PDF documents.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run worker
python worker.py

# Run tests
pytest worker_test.py -v
```

## API Endpoints

### POST /parse

Parse a PDF and extract text chunks.

**Request (JSON):**
```json
{
  "jobId": "uuid",
  "filePath": "/path/to/file.pdf",
  "callbackUrl": "http://backend/api/callback",
  "callbackSecret": "secret"
}
```

**Request (Multipart):**
- `pdf`: PDF file
- `jobId`: Job identifier
- `callbackUrl`: Backend callback URL
- `callbackSecret`: Authentication secret

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "chunkCount": 5
}
```

### GET /health

Health check endpoint.

## Architecture

```
worker/
├── worker.py          # Flask API server
├── pdf_parser.py      # PDF text extraction
├── text_chunker.py    # Text splitting logic
├── worker_test.py     # pytest tests
├── requirements.txt   # Python dependencies
└── Dockerfile         # Container config
```

## Chunking Strategy

1. **Primary**: Split by detected headings
2. **Fallback**: Split by paragraphs with word count limits
3. **Force split**: Large sections split by sentences

Default settings:
- Target: 600 words per chunk
- Minimum: 100 words
- Maximum: 800 words

## Error Handling

The worker detects and reports:
- **TOO_MANY_PAGES**: PDF exceeds 100 pages
- **SCANNED_PDF**: Document appears to be scanned (low text)
- **PARSING_FAILED**: Unable to extract text

## Vultr Deployment

```bash
# Build container
docker build -t studypal-worker .

# Push to Vultr Container Registry
docker tag studypal-worker vcr.vultr.com/your-registry/studypal-worker
docker push vcr.vultr.com/your-registry/studypal-worker
```

## Environment Variables

```env
PORT=5000
CALLBACK_URL=http://backend:3001/api/callback
CALLBACK_SECRET=your-secret-key
```

