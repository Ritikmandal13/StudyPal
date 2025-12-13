const { checkPDFMagicBytes } = require('../utils/validation');

/**
 * Middleware to validate uploaded PDF files
 */
const validatePDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    // Check magic bytes
    const isValidPDF = await checkPDFMagicBytes(req.file.path);
    if (!isValidPDF) {
      // Delete the invalid file
      const fs = require('fs').promises;
      await fs.unlink(req.file.path);
      
      return res.status(400).json({
        error: 'Invalid PDF file',
        code: 'INVALID_FILE_TYPE'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validatePDF };

