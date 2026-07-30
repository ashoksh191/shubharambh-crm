import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log complete error details server-side for internal debugging
  logger.error('Unhandled Server Exception:', {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    path: req.path,
    method: req.method,
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress,
  });

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Input validation failed. Please check supplied parameters.',
      details: formattedErrors,
    });
    return;
  }

  // Handle JWT Auth Errors
  if (err?.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Authentication session expired. Please refresh or log in again.',
    });
    return;
  }

  if (err?.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication token is invalid or corrupted.',
    });
    return;
  }

  // Handle Prisma / Database Errors (Mask database internal schema and paths)
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    res.status(400).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'A database constraint error occurred while processing your request.',
    });
    return;
  }

  const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  // In production or 500 errors, never leak stack traces, raw system errors, or file paths
  const clientMessage =
    statusCode >= 500 || isProd
      ? 'An unexpected server error occurred. Please try again later.'
      : err?.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: err?.name && statusCode < 500 ? err.name : 'SERVER_ERROR',
    message: clientMessage,
  });
};
