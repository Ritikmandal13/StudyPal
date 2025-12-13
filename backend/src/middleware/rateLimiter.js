const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware
 * Limits uploads to 5 per hour per IP
 */
const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per window
  message: {
    error: 'Too many uploads. Please wait before trying again.',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind proxy, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * More lenient rate limiter for general API endpoints
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMITED'
  }
});

module.exports = { rateLimiter, apiRateLimiter };

