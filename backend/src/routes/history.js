const express = require('express');
const storage = require('../utils/storage');

const router = express.Router();

/**
 * GET /api/history
 * Get list of past study sessions
 */
router.get('/history', async (req, res, next) => {
  try {
    // TODO: Replace with Raindrop SmartSQL query
    // const sessions = await raindrop.smartSQL.query(
    //   'SELECT * FROM history WHERE userId = ? ORDER BY createdAt DESC',
    //   [req.userId]
    // );

    const history = await storage.getHistory();

    res.json({
      success: true,
      history: history || []
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/history/:id
 * Delete a history entry
 */
router.delete('/history/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Replace with Raindrop SmartSQL delete
    // await raindrop.smartSQL.delete('history', { id, userId: req.userId });

    await storage.deleteFromHistory(id);

    res.json({
      success: true,
      message: 'History entry deleted'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/preferences
 * Get user preferences
 */
router.get('/preferences', async (req, res, next) => {
  try {
    // TODO: Replace with Raindrop SmartMemory
    // const prefs = await raindrop.smartMemory.get(`user:${req.userId}:preferences`);

    const preferences = await storage.getPreferences();

    res.json({
      success: true,
      preferences: preferences || {
        summaryLength: 'medium',
        quizDifficulty: 'medium',
        flashcardCount: 15,
        theme: 'system'
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
router.put('/preferences', async (req, res, next) => {
  try {
    const { summaryLength, quizDifficulty, flashcardCount, theme } = req.body;

    const preferences = {
      summaryLength: summaryLength || 'medium',
      quizDifficulty: quizDifficulty || 'medium',
      flashcardCount: flashcardCount || 15,
      theme: theme || 'system',
      updatedAt: new Date().toISOString()
    };

    // TODO: Replace with Raindrop SmartMemory
    // await raindrop.smartMemory.set(`user:${req.userId}:preferences`, preferences);

    await storage.savePreferences(preferences);

    res.json({
      success: true,
      preferences
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
