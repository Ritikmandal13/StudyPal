/**
 * Centralized error handling middleware
 */

const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Only PDF files are supported',
  FILE_TOO_LARGE: 'File exceeds 10MB limit',
  TOO_MANY_PAGES: 'PDF exceeds 100 page limit',
  PARSING_FAILED: 'Could not extract text from PDF',
  SCANNED_PDF: 'This appears to be a scanned document. OCR is not supported.',
  PROCESSING_TIMEOUT: 'Processing took too long. Please try a smaller file.',
  RATE_LIMITED: 'Too many requests. Please wait before uploading again.',
  JOB_NOT_FOUND: 'Session not found or expired',
  GENERATION_FAILED: 'AI generation failed. Please try again.',
  CHUNKS_NOT_READY: 'Content is still being processed. Please wait.',
  MISSING_JOB_ID: 'Job ID is required',
  INVALID_TYPE: 'Invalid content type specified',
  INVALID_SECRET: 'Unauthorized callback request'
};

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${new Date().toISOString()}:`, err.message);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
      code: 'FILE_TOO_LARGE'
    });
  }

  // Handle known error codes
  if (ERROR_MESSAGES[err.message]) {
    const statusCode = getStatusCode(err.message);
    return res.status(statusCode).json({
      error: ERROR_MESSAGES[err.message],
      code: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

const getStatusCode = (code) => {
  const codes = {
    INVALID_FILE_TYPE: 400,
    FILE_TOO_LARGE: 413,
    TOO_MANY_PAGES: 400,
    PARSING_FAILED: 422,
    SCANNED_PDF: 422,
    PROCESSING_TIMEOUT: 408,
    RATE_LIMITED: 429,
    JOB_NOT_FOUND: 404,
    GENERATION_FAILED: 500,
    CHUNKS_NOT_READY: 400,
    MISSING_JOB_ID: 400,
    INVALID_TYPE: 400,
    INVALID_SECRET: 401
  };
  return codes[code] || 500;
};

module.exports = { errorHandler, ERROR_MESSAGES };

