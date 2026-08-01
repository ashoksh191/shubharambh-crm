import { Response, NextFunction } from 'express';
import { ObservableRequest } from './requestIdMiddleware.js';
import { logger } from '../utils/logger.js';
import { metricsService } from '../services/metricsService.js';

const SLOW_REQUEST_THRESHOLD_MS = 500;

/**
 * Structured HTTP Request / Response & Slow Request Observability Middleware
 */
export const requestLoggerMiddleware = (
  req: ObservableRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = req.startTime || Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const isSlow = durationMs >= SLOW_REQUEST_THRESHOLD_MS;

    const logPayload = {
      reqId: req.id,
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // 1. Record Metrics
    metricsService.recordHttpRequest({
      method: req.method,
      route: req.baseUrl || req.path,
      statusCode: res.statusCode,
      durationMs,
      isSlow,
    });

    // 2. Slow Request Warning Alert Logging
    if (isSlow) {
      logger.warn(`SLOW_REQUEST_ALERT: ${req.method} ${req.originalUrl} took ${durationMs}ms`, {
        ...logPayload,
        alertType: 'SLOW_REQUEST',
        thresholdMs: SLOW_REQUEST_THRESHOLD_MS,
      });
    } else if (res.statusCode >= 400) {
      logger.error(`HTTP_ERROR: ${req.method} ${req.originalUrl} returned status ${res.statusCode}`, {
        ...logPayload,
      });
    } else {
      logger.info(`HTTP_ACCESS: ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`, {
        ...logPayload,
      });
    }
  });

  next();
};
