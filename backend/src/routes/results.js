/**
 * Results Route
 * Get generated study content
 * 
 * GET /api/results/:jobId - Get generated content
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const { getJob } = require('../utils/storage');
const { AppError } = require('../utils/errorHandler');

/**
 * GET /api/results/:jobId
 * Get generated notes, flashcards, and quiz
 */
router.get('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      throw new AppError('Missing jobId', 'INVALID_REQUEST', 400);
    }

    // Check job exists and is completed
    const job = await getJob(jobId);
    if (!job) {
      throw new AppError('Job not found', 'JOB_NOT_FOUND', 404);
    }

    if (job.status !== 'completed') {
      throw new AppError(
        `Results not ready. Current status: ${job.status}`,
        'RESULTS_NOT_READY',
        400
      );
    }

    // Load results
    const resultsPath = path.join(__dirname, '../../data/results', `${jobId}.json`);
    
    try {
      const resultsFile = await fs.readFile(resultsPath, 'utf-8');
      const results = JSON.parse(resultsFile);

      res.json({
        success: true,
        ...results
      });
    } catch (err) {
      throw new AppError('Results file not found', 'RESULTS_NOT_FOUND', 404);
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;

