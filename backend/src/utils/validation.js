const fs = require('fs').promises;

/**
 * PDF validation utilities
 */

// PDF magic bytes (header)
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

/**
 * Check if file has valid PDF magic bytes
 */
const checkPDFMagicBytes = async (filePath) => {
  const fd = await fs.open(filePath, 'r');
  const buffer = Buffer.alloc(4);
  await fd.read(buffer, 0, 4, 0);
  await fd.close();
  return buffer.equals(PDF_MAGIC);
};

/**
 * Sanitize filename to prevent path traversal
 */
const sanitizeFilename = (filename) => {
  // Remove any path components
  const basename = filename.replace(/^.*[\\/]/, '');
  // Remove special characters except alphanumeric, dash, underscore, dot
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Validate file size
 */
const validateFileSize = (size, maxSize = 10 * 1024 * 1024) => {
  return size <= maxSize;
};

/**
 * Validate MIME type
 */
const validateMimeType = (mimeType) => {
  return mimeType === 'application/pdf';
};

module.exports = {
  checkPDFMagicBytes,
  sanitizeFilename,
  validateFileSize,
  validateMimeType
};

