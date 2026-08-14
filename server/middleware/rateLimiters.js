import rateLimit from 'express-rate-limit';

// Both limiters key off IP. Counts are per process, so a restart clears them
const shared = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};

// Login is the one worth guarding, it is where password guessing happens
const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Only failed attempts count, so a busy legitimate user is never locked out
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

// Registration is slower on purpose, nobody needs five accounts an hour
const registerLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: {
    message: 'Too many accounts created from here. Please try again later.',
  },
});

export { loginLimiter, registerLimiter };
