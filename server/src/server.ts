import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config/index.js';
import { prisma } from './config/database.js';
import { corsOptions } from './config/cors.js';
import { helmetSecurityHeaders } from './config/helmet.js';
import { logger } from './utils/logger.js';
import { apiGlobalRateLimiter, publicRateLimiter } from './middlewares/rateLimiter.js';
import { csrfTokenGenerator, verifyCsrfToken } from './middlewares/csrfMiddleware.js';
import { sanitizeInputs } from './middlewares/sanitizer.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import { serveSecureUploadedFile } from './middlewares/uploadGuard.js';
import { requestIdMiddleware } from './middlewares/requestIdMiddleware.js';
import { requestLoggerMiddleware } from './middlewares/requestLoggerMiddleware.js';
import { metricsService } from './services/metricsService.js';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import plotRoutes from './routes/plotRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

const app = express();

// Trust reverse proxy headers (e.g. Nginx, Cloudflare) for secure IP extraction
app.set('trust proxy', 1);

// SRE Observability: Correlation ID & Request Timing Logging
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Security Middlewares
app.use(helmetSecurityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(config.jwt.cookieSecret));

// Input Sanitization & Rate Limiting
app.use(sanitizeInputs);
app.use('/api', apiGlobalRateLimiter);

// CSRF Protection Middleware
app.use(csrfTokenGenerator);

// Health Liveness Check Endpoint (Public Rate Limited)
app.get('/health', publicRateLimiter, (_req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Shubharambh Green City CRM Enterprise Server',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Production Readiness Endpoint (Verifies Database Connection)
app.get('/ready', publicRateLimiter, async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'READY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error('Readiness Healthcheck Failed:', { message: err?.message });
    res.status(503).json({
      status: 'UNREADY',
      database: 'DISCONNECTED',
      error: 'Database connection failed during readiness check.',
    });
  }
});

// Prometheus & SRE Metrics Telemetry Endpoint
app.get('/metrics', publicRateLimiter, (_req, res) => {
  res.status(200).json(metricsService.getMetricsReport());
});

// Secure Static Upload Storage Endpoint (Isolated & Non-Executable)
app.get('/api/uploads/:filename', publicRateLimiter, serveSecureUploadedFile);

// Enterprise REST API v1 Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/sessions', verifyCsrfToken, sessionRoutes);
app.use('/api/users', verifyCsrfToken, userRoutes);
app.use('/api/audit', verifyCsrfToken, auditRoutes);
app.use('/api/approvals', verifyCsrfToken, approvalRoutes);

// Server-Authoritative Plot, Booking & Customer Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/plot', plotRoutes);
app.use('/api/v1/plots', plotRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/v1/customers', customerRoutes);

// Global 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Express Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Enterprise Backend Engine running on http://localhost:${PORT}`);
  logger.info(`🛡️ Environment: ${config.nodeEnv} | CORS Client: ${config.clientUrl}`);
});

// Graceful Shutdown Handlers
const handleGracefulShutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database connection disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error disconnecting database:', err);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default app;
