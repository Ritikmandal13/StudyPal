const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');
const { validatePDF } = require('../middleware/fileValidator');
const { rateLimiter } = require('../middleware/rateLimiter');
const storage = require('../utils/storage');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../data/uploads'));
    },
    filename: (req, file, cb) => {
      const jobId = uuidv4();
      req.jobId = jobId;
      cb(null, `${jobId}.pdf`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

/**
 * POST /api/upload
 * Upload a PDF file for processing
 */
router.post('/upload', rateLimiter, upload.single('pdf'), validatePDF, async (req, res, next) => {
  try {
    const jobId = req.jobId;
    const filePath = req.file.path;

    // Create job entry
    const job = {
      id: jobId,
      status: 'uploading',
      progress: 10,
      step: 'File uploaded',
      filename: req.file.originalname,
      fileSize: req.file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save job to storage
    await storage.saveJob(job);

    // TODO: Upload to Raindrop SmartBuckets
    // const bucketResponse = await raindrop.smartBuckets.upload({
    //   bucket: process.env.RAINDROP_BUCKET_NAME,
    //   file: filePath,
    //   key: `uploads/${jobId}.pdf`
    // });

    // Send to worker for processing
    const workerUrl = process.env.WORKER_URL || 'http://localhost:5000';
    
    // Helper function to send to worker with retry
    const sendToWorker = async (retryCount = 0) => {
      const maxRetries = 2;
      const localPath = path.join(__dirname, '../../data/uploads', `${jobId}.pdf`);
      
      try {
        const fileStream = fs.createReadStream(localPath);
        const form = new FormData();
        form.append('jobId', jobId);
        form.append('pdf', fileStream);
        form.append('callbackUrl', `${process.env.CALLBACK_URL || 'http://localhost:3001/api/callback'}`);
        form.append('callbackSecret', process.env.CALLBACK_SECRET);

        console.log(`[Upload] Sending to worker (attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        await axios.post(`${workerUrl}/parse`, form, {
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000 // 2 minute timeout for cold starts
        });
        
        console.log(`[Upload] Worker accepted job ${jobId}`);
      } catch (err) {
        console.error(`[Upload] Worker request failed (attempt ${retryCount + 1}):`, err.message);
        
        if (retryCount < maxRetries) {
          // Wait before retry (longer wait for cold start)
          const waitTime = (retryCount + 1) * 5000; // 5s, 10s
          console.log(`[Upload] Retrying in ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return sendToWorker(retryCount + 1);
        }
        
        // All retries failed
        storage.updateJob(jobId, { 
          status: 'error', 
          error: 'WORKER_UNAVAILABLE',
          step: 'Worker communication failed after retries'
        });
      }
    };

    try {
      // Update job status
      await storage.updateJob(jobId, { status: 'parsing', progress: 20, step: 'Sending to worker' });

      // Send async (don't await - let it run in background)
      sendToWorker();

    } catch (workerError) {
      console.error('Failed to send to worker:', workerError);
    }

    res.status(202).json({
      success: true,
      jobId,
      status: 'processing',
      message: 'PDF uploaded successfully. Processing started.'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/callback
 * Receive parsed chunks from worker
 */
router.post('/callback', async (req, res, next) => {
  try {
    const { jobId, chunks, metadata, status, error, secret } = req.body;

    // Validate callback secret
    if (secret !== process.env.CALLBACK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_SECRET' });
    }

    if (status === 'error') {
      await storage.updateJob(jobId, {
        status: 'error',
        error: error || 'PARSING_FAILED',
        step: 'PDF parsing failed',
        updatedAt: new Date().toISOString()
      });
      return res.json({ success: false, error });
    }

    // Save chunks to storage
    await storage.saveChunks(jobId, { chunks, metadata });

    // Update job status
    await storage.updateJob(jobId, {
      status: 'chunking_complete',
      progress: 50,
      step: 'Text extracted successfully',
      metadata,
      chunkCount: chunks.length,
      updatedAt: new Date().toISOString()
    });

    // TODO: Save chunks to Raindrop SmartBuckets or SmartSQL
    // await raindrop.smartSQL.insert('chunks', { jobId, chunks, metadata });

    res.json({ success: true, message: 'Chunks received' });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
