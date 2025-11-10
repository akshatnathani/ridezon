import rateLimit from 'express-rate-limit';
import config from '../config/environment';
import { errorResponse } from '../utils/response';

/**
 * General rate limiter
 * Applies to all routes unless overridden
 */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'Too many requests',
        'Rate limit exceeded. Please try again later.'
      )
    );
  },
});

/**
 * Strict rate limiter for authentication routes
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'Too many authentication attempts',
        'Account temporarily locked. Please try again after 15 minutes.'
      )
    );
  },
});

/**
 * Password reset rate limiter
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'Too many password reset attempts',
        'Please wait an hour before requesting another password reset.'
      )
    );
  },
});

/**
 * Registration rate limiter
 * Prevents mass account creation
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'Registration limit exceeded',
        'Too many accounts created. Please try again later.'
      )
    );
  },
});
