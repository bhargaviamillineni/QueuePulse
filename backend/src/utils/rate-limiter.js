import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config/constants.js';

export const generalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.general.windowMs,
  max: CONFIG.RATE_LIMITS.general.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

export const authLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.auth.windowMs,
  max: CONFIG.RATE_LIMITS.auth.max,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

export const patientRegistrationLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.registration.windowMs,
  max: CONFIG.RATE_LIMITS.registration.max,
  message: 'Too many patient registrations, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

export const strictLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMITS.strict.windowMs,
  max: CONFIG.RATE_LIMITS.strict.max,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
