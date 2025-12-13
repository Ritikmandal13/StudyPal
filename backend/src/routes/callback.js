/**
 * Callback Route
 * Internal endpoint called by worker when PDF parsing is complete
 * 
 * POST /api/callback - Receive parsed PDF chunks from worker
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const { updateJob, getJob } = require('../utils/storage');
const { AppError } = require('../utils/errorHandler');

/**
 * POST /api/callback
 * Receive parsed chunks from worker
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate callback secret
    const headerSecret = req.headers['x-callback-secret'];
    const bodySecret = req.body?.secret;
    const expectedSecret = process.env.CALLBACK_SECRET || 'dev-secret-token';

    if (headerSecret !== expectedSecret && bodySecret !== expectedSecret) {
      throw new AppError('Invalid callback secret', 'UNAUTHORIZED', 401);
    }

    const { jobId, status, chunks, metadata, error } = req.body;

    if (!jobId) {
      throw new AppError('Missing jobId', 'INVALID_REQUEST', 400);
    }

    // Check if job exists
    const job = await getJob(jobId);
    if (!job) {
      throw new AppError('Job not found', 'JOB_NOT_FOUND', 404);
    }

    // Handle error from worker
    if (status === 'error') {
      await updateJob(jobId, {
        status: 'error',
        error: error || 'PDF parsing failed',
        errorCode: 'PARSING_FAILED',
        progress: 0
      });

      return res.json({ success: false, message: 'Error recorded' });
    }

    // Save chunks to file
    // TODO: Raindrop - Save to SmartBuckets / SmartSQL
    const chunksDir = path.join(__dirname, '../../data/chunks');
    await fs.mkdir(chunksDir, { recursive: true });
    
    const chunksPath = path.join(chunksDir, `${jobId}.json`);
    await fs.writeFile(chunksPath, JSON.stringify({
      jobId,
      metadata,
      chunks,
      processedAt: new Date().toISOString()
    }, null, 2));

    // Update job status
    await updateJob(jobId, {
      status: 'chunking_complete',
      progress: 50,
      step: 'Text extraction complete',
      metadata,
      chunkCount: chunks?.length || 0
    });

    console.log(`✓ Callback received for job ${jobId}: ${chunks?.length || 0} chunks`);

    res.json({
      success: true,
      message: 'Chunks received',
      jobId,
      chunkCount: chunks?.length || 0
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

