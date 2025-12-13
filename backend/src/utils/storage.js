const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const PREFS_FILE = path.join(DATA_DIR, 'preferences.json');
const CHUNKS_DIR = path.join(DATA_DIR, 'chunks');
const RESULTS_DIR = path.join(DATA_DIR, 'results');

/**
 * Local JSON file storage utility
 * TODO: Replace with Raindrop SmartBuckets / SmartSQL / SmartMemory
 */

// Ensure directories exist
const ensureDir = async (dir) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

// Read JSON file
const readJSON = async (filePath, defaultValue = {}) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    if (!data || !data.trim()) {
      // Empty file – treat as default structure
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File does not exist yet – return default
      return defaultValue;
    }
    if (err.name === 'SyntaxError') {
      // Corrupted JSON – reset to default instead of crashing
      console.error(`Invalid JSON in ${filePath}, resetting to default.`, err.message);
      await writeJSON(filePath, defaultValue);
      return defaultValue;
    }
    throw err;
  }
};

// Write JSON file
const writeJSON = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// ============ Jobs ============

const getJobs = async () => {
  return await readJSON(JOBS_FILE, { jobs: {} });
};

const saveJob = async (job) => {
  const data = await getJobs();
  data.jobs[job.id] = job;
  await writeJSON(JOBS_FILE, data);
};

const getJob = async (jobId) => {
  const data = await getJobs();
  return data.jobs[jobId] || null;
};

const updateJob = async (jobId, updates) => {
  const data = await getJobs();
  if (data.jobs[jobId]) {
    data.jobs[jobId] = { ...data.jobs[jobId], ...updates };
    await writeJSON(JOBS_FILE, data);
  }
};

const getAllJobs = async () => {
  const data = await getJobs();
  return Object.values(data.jobs);
};

// ============ Chunks ============

const saveChunks = async (jobId, chunksData) => {
  await ensureDir(CHUNKS_DIR);
  const filePath = path.join(CHUNKS_DIR, `${jobId}.json`);
  await writeJSON(filePath, chunksData);
};

const getChunks = async (jobId) => {
  const filePath = path.join(CHUNKS_DIR, `${jobId}.json`);
  try {
    return await readJSON(filePath, null);
  } catch {
    return null;
  }
};

// ============ Results ============

const saveResults = async (jobId, results) => {
  await ensureDir(RESULTS_DIR);
  const filePath = path.join(RESULTS_DIR, `${jobId}.json`);
  await writeJSON(filePath, results);
};

const getResults = async (jobId) => {
  const filePath = path.join(RESULTS_DIR, `${jobId}.json`);
  try {
    return await readJSON(filePath, null);
  } catch {
    return null;
  }
};

// ============ History ============

const getHistory = async () => {
  const data = await readJSON(HISTORY_FILE, { history: [] });
  return data.history;
};

const addToHistory = async (entry) => {
  const data = await readJSON(HISTORY_FILE, { history: [] });
  data.history.unshift(entry);
  // Keep only last 50 entries
  data.history = data.history.slice(0, 50);
  await writeJSON(HISTORY_FILE, data);
};

const deleteFromHistory = async (jobId) => {
  const data = await readJSON(HISTORY_FILE, { history: [] });
  data.history = data.history.filter(h => h.jobId !== jobId);
  await writeJSON(HISTORY_FILE, data);
};

// ============ Preferences ============

const getPreferences = async () => {
  const data = await readJSON(PREFS_FILE, null);
  return data;
};

const savePreferences = async (prefs) => {
  await writeJSON(PREFS_FILE, prefs);
};

module.exports = {
  saveJob,
  getJob,
  updateJob,
  getAllJobs,
  saveChunks,
  getChunks,
  saveResults,
  getResults,
  getHistory,
  addToHistory,
  deleteFromHistory,
  getPreferences,
  savePreferences
};

