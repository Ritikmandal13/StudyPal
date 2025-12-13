const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const storage = require('../utils/storage');
const { callSmartInference } = require('../utils/inference');

const router = express.Router();

/**
 * Try to extract a JSON array from an LLM string response.
 * Handles cases where the model wraps JSON in explanations or code fences.
 */
const safeParseJsonArray = (raw = '') => {
  if (!raw || typeof raw !== 'string') return [];

  // First try direct parse
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // continue to fallback strategies
  }

  // Strip code fences if present
  let text = raw.trim();
  text = text.replace(/```json/gi, '```').replace(/```/g, '');

  // Try to locate the first [...] block which should contain the array
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const slice = text.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // fall through
    }
  }

  console.warn('[Summarize] Failed to parse JSON array from LLM response snippet:', text.slice(0, 200));
  return [];
};

/**
 * Heuristic helpers for generating flashcards when AI is unavailable
 */
const buildQuestionFromSentence = (sentence = '', title = '') => {
  const s = sentence.replace(/•/g, '').trim();
  if (!s) return null;

  // Pattern: "X is ..." -> "What is X?"
  let match = s.match(/^([\w\s,()\-]+?)\s+is\b/i);
  if (match && match[1].length <= 80) {
    const subject = cleanLabel(match[1]).trim();
    if (subject && !/^(it|this|that|they|such a system)/i.test(subject)) {
      return `What is ${subject}?`;
    }
  }

  // Pattern: "X are ..." -> "What are X?"
  match = s.match(/^([\w\s,()\-]+?)\s+are\b/i);
  if (match && match[1].length <= 80) {
    const subject = cleanLabel(match[1]).trim();
    if (subject && !/^(it|this|that|they)/i.test(subject)) {
      return `What are ${subject}?`;
    }
  }

  // Pattern: "Such a system is designed for ..." etc.
  if (/such a system is designed for/i.test(s)) {
    return 'What is this type of system designed for?';
  }

  // Fallback: concept-focused question using section title
  if (title) {
    const shortTitle = cleanLabel(title);
    if (shortTitle) {
      return `What does "${shortTitle}" describe?`;
    }
  }

  return null;
};

// Load prompt templates
const loadPrompt = async (name) => {
  const promptPath = path.join(__dirname, '../prompts', `${name}Prompt.txt`);
  return await fs.readFile(promptPath, 'utf-8');
};

/**
 * Basic sentence splitter for heuristic summaries
 */
const splitSentences = (text = '') => {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
};

const cleanLabel = (text = '') => {
  return text
    .replace(/\[[^\]]+]/g, '') // remove all bracketed metadata
    .replace(/\([^\)]*hours?\)/gi, '') // remove (X hours) style
    .replace(/\b(Unit|Chapter|Section)\s*\d+:?\s*/gi, '') // Unit 3:, Chapter 2, Section 1
    .replace(/\d+\s*Hours?:?\s*/gi, '') // 7 Hours:
    .replace(/Pages?\s*\d+-?\d*/gi, '') // Page 1-3
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const isLowQuality = (text = '') => {
  if (!text || text.length < 15) return true;
  const lower = text.toLowerCase();
  // Detect syllabus/reference content
  const badMarkers = ['reference book', 'text book', 'edition', 'syllabus', 'table of contents', 'wiley publication'];
  if (badMarkers.some(m => lower.includes(m))) return true;
  // Detect heavy list content (TOC)
  const lines = text.split(/\n+/);
  const listLines = lines.filter(l => /^\s*[\d\-\•\*\)]/.test(l)).length;
  if (lines.length > 4 && listLines / lines.length > 0.65) return true;
  return false;
};

const chunkTitle = (chunk, i) => {
  if (chunk?.title) return cleanLabel(chunk.title);
  if (chunk?.heading) return cleanLabel(chunk.heading);
  const words = (chunk?.text || '').split(/\s+/).slice(0, 8).join(' ');
  return cleanLabel(words) || `Section ${i + 1}`;
};

const tooLong = (text = '', maxWords = 30) => {
  return text.split(/\s+/).filter(Boolean).length > maxWords;
};

const cleanText = (text = '', maxWords = 40) => {
  if (!text) return '';
  const stripped = text
    .replace(/\[[^\]]+]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const words = stripped.split(/\s+/);
  return words.slice(0, maxWords).join(' ').trim();
};

const cleanFlashcards = (items = [], chunk, i) => {
  const title = chunkTitle(chunk, i);
  const pageHint = chunk.pageRange ? `p. ${chunk.pageRange[0]}-${chunk.pageRange[1]}` : undefined;
  return items
    .filter((c) => c.question && c.answer)
    .map((c) => ({
      id: c.id,
      question: cleanLabel(cleanText(c.question, 24)),
      answer: cleanLabel(cleanText(c.answer, 30)),
      page: c.page || pageHint
    }))
    .filter((c) => !tooLong(c.answer, 35))
    .filter((c) => !isLowQuality(c.question))
    .filter((c) => !/section|unit|chapter|hours|introduction and|text:|document/i.test(c.question))
    .filter((c) => !/section|unit|chapter|hours|covers|explains|discusses/i.test(c.answer))
    .filter((c) => c.question.length >= 10 && c.answer.length >= 12) // slightly relaxed min length
    .map((c, idx) => ({ ...c, id: c.id || `ai-fc-${i}-${idx}` }));
};

const cleanQuiz = (items = [], chunk, i) => {
  const pageHint = chunk.pageRange ? `p. ${chunk.pageRange[0]}-${chunk.pageRange[1]}` : undefined;
  return items
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length === 4 && q.correct)
    .map((q, idx) => ({
      id: q.id || `ai-q-${i}-${idx}`,
      question: cleanLabel(cleanText(q.question, 24)),
      options: q.options.map((o) => cleanLabel(cleanText(o, 15))),
      correct: q.correct,
      explanation: cleanLabel(cleanText(q.explanation || '', 20)),
      page: q.page || pageHint
    }))
    .filter((q) => !tooLong(q.question, 30))
    .filter((q) => !tooLong(q.explanation, 22))
    .filter((q) => !isLowQuality(q.question))
    .filter((q) => !/section|unit|chapter|hours|document|text:|introduction and/i.test(q.question))
    .filter((q) => q.question.length >= 15) // min length
    .filter((q) => q.options.every(o => o.length >= 3)); // all options must be real
};

/**
 * Heuristic (non-AI) generator from actual PDF chunks
 */
const generateContentFromChunks = (chunks) => {
  const notes = chunks.map((chunk, i) => {
    const sentences = splitSentences(chunk.text || '');
    const bullets = sentences.slice(0, 6);
    return {
      section: chunkTitle(chunk, i),
      pageRange: chunk.pageRange || [i + 1, i + 1],
      bullets: bullets.length ? bullets : [chunk.text?.slice(0, 200) || 'No content'],
    };
  });

  const flashcards = [];
  chunks.forEach((chunk, i) => {
    const sentences = splitSentences(chunk.text || '');
    const title = chunkTitle(chunk, i);
    const rawCards = [];
    const page = chunk.pageRange ? `p. ${chunk.pageRange[0]}-${chunk.pageRange[1]}` : undefined;

    for (let s of sentences) {
      const trimmed = s.replace(/•/g, '').trim();
      if (!trimmed) continue;
      // keep sentences that are not too short or excessively long
      const wordCount = trimmed.split(/\s+/).length;
      if (wordCount < 6 || wordCount > 40) continue;

      const q = buildQuestionFromSentence(trimmed, title);
      if (!q) continue;

      rawCards.push({
        question: q,
        answer: trimmed,
        page
      });

      if (rawCards.length >= 4) break; // 3–4 good cards per chunk
    }

    cleanFlashcards(rawCards, chunk, i).forEach((c) => flashcards.push(c));
  });

  const quiz = chunks.slice(0, 5).map((chunk, i) => {
    const sentences = splitSentences(chunk.text || '');
    const fact = sentences[0] || 'No content available';
    return {
      id: `q${i + 1}`,
      question: `In "${chunkTitle(chunk, i)}", which statement is correct?`,
      options: [
        `A) ${fact.slice(0, 100)}`,
        'B) An unrelated historical event is discussed.',
        'C) Only references are listed without detail.',
        'D) The section states there is no information.',
      ],
      correct: 'A',
      explanation: 'Option A paraphrases the first sentence extracted from the section.',
      page: chunk.pageRange ? `p. ${chunk.pageRange[0]}-${chunk.pageRange[1]}` : undefined
    };
  });

  return { notes, flashcards, quiz };
};

/**
 * SmartInference generation with fallback to heuristics
 */
const generateWithSmartInference = async (chunks) => {
  // If AI is disabled or key is missing, use heuristics
  const apiKey = process.env.GEMINI_API_KEY || process.env.RAINDROP_API_KEY;
  if (!apiKey || process.env.USE_AI === 'false') {
    console.log('[Summarize] AI disabled or no key, using heuristics');
    return generateContentFromChunks(chunks);
  }

  try {
    const notes = [];
    const flashcards = [];

    // Load prompts
    const notesPrompt = await loadPrompt('notes');
    const flashcardPrompt = await loadPrompt('flashcard');
    const quizPrompt = await loadPrompt('quiz');

    // Notes & flashcards per chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const filledNotes = notesPrompt.replace('{chunk}', chunk.text || '');
      const filledFlashcards = flashcardPrompt.replace('{chunk}', chunk.text || '');

      // Notes
      const notesResp = await callSmartInference(filledNotes);
      const noteBullets = (notesResp || '')
        .split('\n')
        .map((b) => b.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
      notes.push({
        section: chunkTitle(chunk, i),
        pageRange: chunk.pageRange || [i + 1, i + 1],
        bullets: noteBullets.length ? noteBullets : [chunk.text?.slice(0, 200) || 'No content'],
      });

      // Flashcards
      const fcResp = await callSmartInference(filledFlashcards);
      const parsed = safeParseJsonArray(fcResp);
      const cleaned = cleanFlashcards(parsed, chunk, i);
      if (!cleaned.length) {
        console.warn('[Summarize] No valid AI flashcards for chunk', i, 'title:', chunkTitle(chunk, i));
      }
      cleaned.forEach((c) => flashcards.push(c));
    }

    // Quiz from first chunk(s)
    const quiz = [];
    const quizSource = chunks.slice(0, 5);
    for (let i = 0; i < quizSource.length; i++) {
      const chunk = quizSource[i];
      const filledQuiz = quizPrompt.replace('{chunk}', chunk.text || '');
      const quizResp = await callSmartInference(filledQuiz);
      const parsedQuiz = safeParseJsonArray(quizResp);
      const cleanedQuiz = cleanQuiz(parsedQuiz, chunk, i);
      if (!cleanedQuiz.length) {
        console.warn('[Summarize] No valid AI quiz questions for chunk', i, 'title:', chunkTitle(chunk, i));
      }
      cleanedQuiz.forEach((q) => quiz.push(q));
    }

    // If AI failed to produce anything in a category, fall back heuristics
    const heuristics = generateContentFromChunks(chunks);
    const mergedNotes = notes.length ? notes : heuristics.notes;
    const mergedFlashcards = flashcards.length ? flashcards : heuristics.flashcards;
    const mergedQuiz = quiz.length ? quiz : heuristics.quiz;

    return { notes: mergedNotes, flashcards: mergedFlashcards, quiz: mergedQuiz };
  } catch (err) {
    console.error('AI generation failed, falling back:', err.message);
    return generateContentFromChunks(chunks);
  }
};

/**
 * POST /api/summarize
 * Generate notes, flashcards, and quiz from chunks
 */
router.post('/summarize', async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID required', code: 'MISSING_JOB_ID' });
    }

    // Get job and chunks
    const job = await storage.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found', code: 'JOB_NOT_FOUND' });
    }

    const chunksData = await storage.getChunks(jobId);
    if (!chunksData) {
      return res.status(400).json({ error: 'No chunks available. PDF may still be processing.', code: 'CHUNKS_NOT_READY' });
    }

    // Update job status
    await storage.updateJob(jobId, { status: 'summarizing', progress: 60, step: 'Generating study materials' });

    // Generate content via SmartInference with fallback to heuristics
    const results = await generateWithSmartInference(chunksData.chunks);

    // Save results
    await storage.saveResults(jobId, {
      ...results,
      metadata: chunksData.metadata,
      generatedAt: new Date().toISOString()
    });

    // Update job as completed
    await storage.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      step: 'Study materials ready!',
      completedAt: new Date().toISOString()
    });

    // Add to history
    await storage.addToHistory({
      jobId,
      filename: job.filename,
      createdAt: job.createdAt,
      completedAt: new Date().toISOString(),
      metadata: chunksData.metadata
    });

    res.json({
      success: true,
      jobId,
      ...results
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/regenerate/:type
 * Regenerate specific content type
 */
router.post('/regenerate/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { jobId } = req.body;

    const validTypes = ['notes', 'flashcards', 'quiz'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid type', code: 'INVALID_TYPE' });
    }

    const chunksData = await storage.getChunks(jobId);
    if (!chunksData) {
      return res.status(404).json({ error: 'Chunks not found', code: 'CHUNKS_NOT_FOUND' });
    }

    // Regenerate using SmartInference (with fallback)
    const results = await generateWithSmartInference(chunksData.chunks);
  
    // Get existing results and update specific type
    const existingResults = await storage.getResults(jobId);
    const updatedResults = {
      ...existingResults,
      [type]: results[type],
      regeneratedAt: new Date().toISOString()
    };

    await storage.saveResults(jobId, updatedResults);

    res.json({
      success: true,
      [type]: results[type]
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/results/:jobId
 * Get generated study materials
 */
router.get('/results/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const results = await storage.getResults(jobId);
    if (!results) {
      return res.status(404).json({ error: 'Results not found', code: 'RESULTS_NOT_FOUND' });
    }

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;