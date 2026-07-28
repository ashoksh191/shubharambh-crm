import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJwt } from '../middlewares/authMiddleware.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public Auth Endpoints
router.post('/register', AuthController.register);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/send-otp', AuthController.sendOtp);
router.post('/refresh', AuthController.refresh);

// Protected Auth Endpoints
router.post('/logout', authenticateJwt, AuthController.logout);
router.post('/logout-all', authenticateJwt, AuthController.logoutAll);
router.post('/change-password', authenticateJwt, AuthController.changePassword);

// 2FA Endpoints
router.post('/2fa/setup', authenticateJwt, AuthController.setup2FA);
router.post('/2fa/enable', authenticateJwt, AuthController.enable2FA);

export default router;
