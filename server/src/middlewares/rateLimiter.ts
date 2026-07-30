import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

// In-Memory tracker for IP + Account exponential backoff state
interface FailureState {
  attempts: number;
  lastAttemptAt: number;
}

const ipAccountFailureMap = new Map<string, FailureState>();

// Periodic cleanup for stale failure tracking (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of ipAccountFailureMap.entries()) {
    if (now - state.lastAttemptAt > config.rateLimit.authWindowMs) {
      ipAccountFailureMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Register a failed attempt for IP + Account to apply exponential backoff
 */
export const recordFailedAuthAttempt = (ip: string, identifier?: string): void => {
  const cleanIp = ip.split(',')[0].trim();
  const cleanId = (identifier || 'unknown').toLowerCase().trim();
  const key = `${cleanIp}:${cleanId}`;

  const current = ipAccountFailureMap.get(key) || { attempts: 0, lastAttemptAt: Date.now() };
  current.attempts += 1;
  current.lastAttemptAt = Date.now();
  ipAccountFailureMap.set(key, current);
};

/**
 * Reset attempt count on successful authentication
 */
export const resetAuthAttemptState = (ip: string, identifier?: string): void => {
  const cleanIp = ip.split(',')[0].trim();
  const cleanId = (identifier || 'unknown').toLowerCase().trim();
  const key = `${cleanIp}:${cleanId}`;
  ipAccountFailureMap.delete(key);
};

/**
 * Dual IP + Account Exponential Backoff Rate Limiting Middleware for Auth Routes
 */
export const exponentialBackoffAuthLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const identifier = req.body?.identifier || req.body?.email || req.body?.username || 'unknown';
  const key = `${ip}:${identifier.toLowerCase().trim()}`;

  const failureState = ipAccountFailureMap.get(key);

  if (failureState && failureState.attempts > 0) {
    const elapsedMs = Date.now() - failureState.lastAttemptAt;

    // Reset if window has elapsed
    if (elapsedMs > config.rateLimit.authWindowMs) {
      ipAccountFailureMap.delete(key);
      next();
      return;
    }

    // Calculate exponential backoff delay: base * (2 ^ (attempts - 1))
    const backoffDelayMs = config.rateLimit.authBackoffBaseMs * Math.pow(2, Math.min(failureState.attempts - 1, 6));

    if (elapsedMs < backoffDelayMs) {
      const waitSeconds = Math.ceil((backoffDelayMs - elapsedMs) / 1000);
      res.status(429).json({
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: `Too many failed authentication attempts for this account/IP. Please wait ${waitSeconds} seconds before trying again.`,
        retryAfterSeconds: waitSeconds,
      });
      return;
    }
  }

  next();
};

// 1. Strict Auth Express Rate Limiter (Per IP)
export const authStrictRateLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication requests from this IP address. Please try again later.',
  },
});

export const loginRateLimiter = [exponentialBackoffAuthLimiter, authStrictRateLimiter];

// 2. Moderate Public Endpoints Rate Limiter
export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimit.publicWindowMs,
  max: config.rateLimit.publicMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests on public endpoints. Please slow down.',
  },
});

// 3. Looser Authenticated User Actions Rate Limiter
export const authenticatedUserRateLimiter = rateLimit({
  windowMs: config.rateLimit.globalWindowMs,
  max: config.rateLimit.globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'API rate limit exceeded. Please wait a moment before trying again.',
  },
});

export const apiGlobalRateLimiter = authenticatedUserRateLimiter;
