import { CorsOptions } from 'cors';
import { config } from './index.js';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Development fallback origins
    const devFallbackOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];

    const allowedOrigins = config.nodeEnv === 'production'
      ? config.allowedCorsOrigins
      : Array.from(new Set([...config.allowedCorsOrigins, ...devFallbackOrigins]));

    // Allow requests with no origin (like same-origin server-to-server, mobile apps, or curl) in dev/prod
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Policy Violation: Origin '${origin}' is not allowed by Shubharambh Security Gateway.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
  ],
  exposedHeaders: ['Set-Cookie', 'X-CSRF-Token'],
  maxAge: 86400, // Preflight caching (24 hours)
};
