import { Request, Response, NextFunction } from 'express';
import { verifyRequestSignature } from '../utils/requestSigner.js';

export const requireSignedRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const nonce = req.headers['x-nonce'] as string;

  const result = verifyRequestSignature(signature, timestamp, nonce, req.body);

  if (!result.isValid) {
    res.status(403).json({
      success: false,
      error: 'Security Request Signing Failed',
      message: result.error || 'Request signature validation failed.',
    });
    return;
  }

  next();
};
