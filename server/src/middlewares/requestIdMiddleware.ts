import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface ObservableRequest extends Request {
  id?: string;
  correlationId?: string;
  startTime?: number;
}

/**
 * Request ID & Correlation ID Propagator Middleware
 */
export const requestIdMiddleware = (
  req: ObservableRequest,
  res: Response,
  next: NextFunction
): void => {
  // Extract or generate unique Request ID and Correlation ID
  const incomingReqId = (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string);
  const requestId = incomingReqId || `req-${randomUUID()}`;
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  req.id = requestId;
  req.correlationId = correlationId;
  req.startTime = Date.now();

  // Set response headers for client tracking
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);

  next();
};
