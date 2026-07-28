import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction): void => {
  let csrfToken = req.cookies?.['XSRF-TOKEN'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Accessible by frontend JS to attach header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  res.setHeader('X-CSRF-Token', csrfToken);
  next();
};

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Safe HTTP methods do not require CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.['XSRF-TOKEN'];
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF Token Validation Failed',
      message: 'Invalid or missing CSRF security token.',
    });
    return;
  }

  next();
};
