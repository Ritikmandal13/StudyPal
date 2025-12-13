const express = require('express');
const storage = require('../utils/storage');

const router = express.Router();

/**
 * GET /api/status/:jobId
 * Get processing status of a job
 */
router.get('/status/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await storage.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found or expired',
        code: 'JOB_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      step: job.step,
      filename: job.filename,
      error: job.error || null,
      metadata: job.metadata || null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt || null
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs
 * List all active jobs (for debugging)
 */
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await storage.getAllJobs();

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
