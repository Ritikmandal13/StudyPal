require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const uploadRoutes = require('./routes/upload');
const summarizeRoutes = require('./routes/summarize');
const historyRoutes = require('./routes/history');
const statusRoutes = require('./routes/status');
const resultsRoutes = require('./routes/results');
const preferencesRoutes = require('./routes/preferences');
const callbackRoutes = require('./routes/callback');

// Import middleware
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure critical data directories exist (especially uploads for multer)
const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(dataDir, 'uploads');
const chunksDir = path.join(dataDir, 'chunks');
const resultsDir = path.join(dataDir, 'results');

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(chunksDir, { recursive: true });
  fs.mkdirSync(resultsDir, { recursive: true });
  
  // Initialize JSON files if they don't exist or are corrupted
  const jobsFile = path.join(dataDir, 'jobs.json');
  const historyFile = path.join(dataDir, 'history.json');
  const prefsFile = path.join(dataDir, 'preferences.json');
  
  // Initialize jobs.json
  if (!fs.existsSync(jobsFile)) {
    fs.writeFileSync(jobsFile, JSON.stringify({ jobs: {} }, null, 2));
  } else {
    // Validate JSON - if corrupted, reset it
    try {
      const content = fs.readFileSync(jobsFile, 'utf-8');
      if (content.trim()) {
        JSON.parse(content);
      } else {
        fs.writeFileSync(jobsFile, JSON.stringify({ jobs: {} }, null, 2));
      }
    } catch (e) {
      console.log('Initializing corrupted jobs.json');
      fs.writeFileSync(jobsFile, JSON.stringify({ jobs: {} }, null, 2));
    }
  }
  
  // Initialize history.json
  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, JSON.stringify({ history: [] }, null, 2));
  }
  
  // Initialize preferences.json
  if (!fs.existsSync(prefsFile)) {
    fs.writeFileSync(prefsFile, JSON.stringify(null));
  }
  
} catch (e) {
  console.error('Failed to initialize data directories:', e.message);
}

// CORS configuration
// Support multiple origins (Vercel + localhost for dev)
const allowedOrigins = [
  'https://study-pal-woad-pi.vercel.app',
  'http://localhost:5173'
];

// Add FRONTEND_URL if provided (strip any path)
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/.*$/, ''); // Remove path
  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', uploadRoutes);
app.use('/api', summarizeRoutes);
app.use('/api', historyRoutes);
app.use('/api', statusRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/callback', callbackRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     📚 StudyPal Backend Server        ║
  ╠═══════════════════════════════════════╣
  ║  Status:  Running                     ║
  ║  Port:    ${PORT}                          ║
  ║  Mode:    ${process.env.NODE_ENV || 'development'}               ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
