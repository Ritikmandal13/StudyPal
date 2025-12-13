/**
 * Preferences Route
 * Manage user preferences
 * 
 * GET /api/preferences - Get preferences
 * PUT /api/preferences - Update preferences
 */

const express = require('express');
const router = express.Router();

const { getPreferences, savePreferences } = require('../utils/storage');
const { AppError } = require('../utils/errorHandler');

// Default preferences
const DEFAULT_PREFERENCES = {
  summaryLength: 'medium', // short, medium, long
  quizDifficulty: 'medium', // easy, medium, hard
  flashcardCount: 15,
  theme: 'light', // light, dark
  autoSave: true
};

/**
 * GET /api/preferences
 * Get user preferences
 */
router.get('/', async (req, res, next) => {
  try {
    // TODO: Raindrop - Get from SmartMemory
    const preferences = await getPreferences();

    res.json({
      success: true,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...preferences
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/preferences
 * Update user preferences
 */
router.put('/', async (req, res, next) => {
  try {
    const updates = req.body;

    // Validate preference keys
    const validKeys = Object.keys(DEFAULT_PREFERENCES);
    const invalidKeys = Object.keys(updates).filter(k => !validKeys.includes(k));

    if (invalidKeys.length > 0) {
      throw new AppError(
        `Invalid preference keys: ${invalidKeys.join(', ')}`,
        'INVALID_PREFERENCES',
        400
      );
    }

    // TODO: Raindrop - Save to SmartMemory
    const current = await getPreferences();
    const updated = { ...current, ...updates };
    await savePreferences(updated);

    res.json({
      success: true,
      message: 'Preferences updated',
      preferences: updated
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

