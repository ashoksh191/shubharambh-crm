import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    // Check Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Access token missing or not provided.',
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Access token has expired. Please refresh your session.',
        tokenExpired: true,
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or corrupted access token.',
    });
  }
};
