import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

export const registerLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many registration attempts, try again later' },
});

export const loginLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many login attempts, try again later' },
});