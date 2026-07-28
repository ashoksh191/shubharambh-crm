import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  sessionId?: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload, rememberMe: boolean = false): string => {
  const expiresIn = rememberMe
    ? config.jwt.rememberMeExpiration
    : config.jwt.refreshExpiration;

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: expiresIn as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateSecureRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
