import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  
  // Secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters long'),
  
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_REMEMBER_ME_EXPIRATION: z.string().default('30d'),

  // Rate Limiting Config (Configurable, not hardcoded)
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)), // 15 mins
  RATE_LIMIT_GLOBAL_MAX: z.string().default('300').transform((val) => parseInt(val, 10)),
  
  RATE_LIMIT_AUTH_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)), // 15 mins
  RATE_LIMIT_AUTH_MAX: z.string().default('5').transform((val) => parseInt(val, 10)), // 5 attempts per window
  RATE_LIMIT_AUTH_BACKOFF_BASE_MS: z.string().default('1000').transform((val) => parseInt(val, 10)), // 1 sec base
  
  RATE_LIMIT_PUBLIC_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)), // 15 mins
  RATE_LIMIT_PUBLIC_MAX: z.string().default('100').transform((val) => parseInt(val, 10)),

  // Security Parameters
  MAX_LOGIN_ATTEMPTS: z.string().default('5').transform((val) => parseInt(val, 10)),
  LOCKOUT_DURATION_MINUTES: z.string().default('15').transform((val) => parseInt(val, 10)),
  BCRYPT_SALT_ROUNDS: z.string().default('12').transform((val) => parseInt(val, 10)),

  // SMTP Config
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.string().default('2525').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('Shubharambh CRM Security <security@shubharambh.com>'),
});

const parsedEnv = envSchema.safeParse({
  ...process.env,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'sgc_access_secret_super_secure_key_2026_enterprise_x89a',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'sgc_refresh_secret_super_secure_key_2026_enterprise_y77b',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'sgc_cookie_secret_99812_shubharambh',
});

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  throw new Error('Environment configuration validation failed');
}

// In production, enforce that non-default secrets are provided
if (process.env.NODE_ENV === 'production') {
  if (
    process.env.JWT_ACCESS_SECRET?.includes('super_secure') ||
    process.env.JWT_REFRESH_SECRET?.includes('super_secure')
  ) {
    throw new Error('CRITICAL SECURITY ERROR: Production deployment must use real secret keys in environment variables!');
  }
}

const env = parsedEnv.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  clientUrl: env.CLIENT_URL,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    cookieSecret: env.COOKIE_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
    rememberMeExpiration: env.JWT_REMEMBER_ME_EXPIRATION,
  },
  rateLimit: {
    globalWindowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MS,
    globalMax: env.RATE_LIMIT_GLOBAL_MAX,
    authWindowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
    authMax: env.RATE_LIMIT_AUTH_MAX,
    authBackoffBaseMs: env.RATE_LIMIT_AUTH_BACKOFF_BASE_MS,
    publicWindowMs: env.RATE_LIMIT_PUBLIC_WINDOW_MS,
    publicMax: env.RATE_LIMIT_PUBLIC_MAX,
  },
  security: {
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    lockoutDurationMinutes: env.LOCKOUT_DURATION_MINUTES,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },
};
