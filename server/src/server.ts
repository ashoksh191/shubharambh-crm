import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config/index.js';
import { corsOptions } from './config/cors.js';
import { helmetSecurityHeaders } from './config/helmet.js';
import { logger } from './utils/logger.js';
import { apiGlobalRateLimiter, publicRateLimiter } from './middlewares/rateLimiter.js';
import { csrfTokenGenerator, verifyCsrfToken } from './middlewares/csrfMiddleware.js';
import { sanitizeInputs } from './middlewares/sanitizer.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import { serveSecureUploadedFile } from './middlewares/uploadGuard.js';

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

// Health Check Endpoint (Public Rate Limited)
app.get('/health', publicRateLimiter, (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Shubharambh Green City CRM Enterprise Server',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Secure Static Upload Storage Endpoint (Isolated & Non-Executable)
app.get('/api/uploads/:filename', publicRateLimiter, serveSecureUploadedFile);

// Enterprise REST API v1 Routes
app.use('/api/auth', authRoutes);
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
app.listen(PORT, () => {
  logger.info(`🚀 Enterprise Backend Security Engine running on http://localhost:${PORT}`);
  logger.info(`🛡️ Environment: ${config.nodeEnv} | CORS Client: ${config.clientUrl}`);
});

export default app;
