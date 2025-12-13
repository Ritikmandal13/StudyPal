# 📚 StudyPal

> AI-powered study assistant that transforms PDFs into notes, flashcards, and quizzes.

![StudyPal Banner](https://via.placeholder.com/800x200/6366f1/ffffff?text=StudyPal)

## ✨ Features

- **📄 PDF Upload** — Drag & drop any PDF document
- **📝 Smart Notes** — AI-generated bullet-point summaries
- **🎴 Flashcards** — Interactive Q&A cards with flip animations
- **❓ Quizzes** — Multiple-choice tests with instant scoring
- **📜 History** — Track all your study sessions
- **🌓 Dark Mode** — Easy on the eyes

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Worker    │
│   (React)   │◀────│  (Express)  │◀────│  (Python)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Raindrop   │
                    │ SmartInfer  │
                    └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/studypal.git
cd studypal

# Copy environment config
cp .env.example .env

# Start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# Worker:   http://localhost:5000
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Worker (new terminal)
cd worker
pip install -r requirements.txt
python worker.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
studypal/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── utils/     # Helper functions
│   │   ├── middleware/# Express middleware
│   │   └── prompts/   # AI prompt templates
│   └── data/          # Local JSON storage
├── worker/            # Python PDF processor
├── frontend/          # React + Vite app
├── docs/              # Documentation
└── sample-pdfs/       # Test files
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF file |
| GET | `/api/status/:jobId` | Get job progress |
| POST | `/api/summarize` | Generate study materials |
| GET | `/api/results/:jobId` | Get generated content |
| GET | `/api/history` | List past sessions |

See [API Reference](./docs/api-reference.md) for full documentation.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Worker | Python, pdfplumber |
| AI | Raindrop SmartInference |
| Deployment | Docker, Vultr |

## 🔧 Configuration

Key environment variables:

```env
PORT=3001                    # Backend port
WORKER_URL=http://worker:5000 # Worker service URL
CALLBACK_SECRET=your-secret   # Secure callback token
RAINDROP_API_KEY=your-key     # Raindrop API key
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Worker tests
cd worker && pytest

# Frontend tests
cd frontend && npm test
```

## 🚢 Deployment

### Vultr Deployment

1. Deploy worker as container on Vultr Container Platform
2. Configure backend as Raindrop MCP server
3. Host frontend on Vultr Object Storage

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

## 🎬 Demo

Check out our [demo video script](./docs/demo_video_script.md) for a walkthrough of all features.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with ❤️ for the AI Championship (Raindrop + Vultr)
