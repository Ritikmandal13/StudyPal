# StudyPal Frontend

React + Vite app for uploading PDFs and viewing AI-generated notes, flashcards, and quizzes.

## Quick Start
```bash
cd frontend
npm install
npm run dev
```

## Structure
```
src/
├─ pages/          # Login, Home, Results, History
├─ components/     # Navbar, Upload, ProgressTracker, Notes, Flashcards, Quiz
├─ hooks/          # useJobStatus, useLocalStorage
├─ utils/          # api, formatters
└─ styles/         # Tailwind + custom CSS
```

## Features
- Drag/drop PDF upload with progress
- Notes with collapsible sections + copy/export
- Flashcards with flip + keyboard nav
- Quiz with scoring and explanations
- Dark mode toggle

## Environment
```
VITE_API_URL=http://localhost:3001
```

## Build
```bash
npm run build
```

