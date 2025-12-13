const axios = require('axios');

/**
 * Call Gemini API with a plain prompt string.
 * Returns raw text content; caller decides how to parse.
 */
async function callSmartInference(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.RAINDROP_API_KEY;
  // Default to a broadly available Gemini model; can be overridden via GEMINI_MODEL
  const model = process.env.GEMINI_MODEL || 'gemini-1.0-pro';

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`[Gemini] Calling ${model} (prompt length: ${prompt.length} chars)`);
    const resp = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30s timeout for long content
      }
    );

    console.log(`[Gemini] Response received, status: ${resp.status}`);
    
    // Extract text from Gemini response
    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('[Gemini] Response structure:', JSON.stringify(resp.data).slice(0, 200));
      throw new Error('No text in Gemini response');
    }
    
    console.log(`[Gemini] Generated ${text.length} chars`);
    return text;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message || 'Gemini API failed';
    console.error(`[Gemini] Error (${status || 'no status'}):`, typeof msg === 'string' ? msg : JSON.stringify(msg).slice(0, 300));
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
}

module.exports = { callSmartInference };
