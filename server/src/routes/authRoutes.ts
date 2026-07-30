import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJwt } from '../middlewares/authMiddleware.js';
import { loginRateLimiter, authStrictRateLimiter } from '../middlewares/rateLimiter.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
} from '../validators/authValidators.js';

const router = Router();

// Public Auth Endpoints
router.post('/register', authStrictRateLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', loginRateLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/send-otp', authStrictRateLimiter, AuthController.sendOtp);
router.post('/refresh', AuthController.refresh);

// Protected Auth Endpoints
router.post('/logout', authenticateJwt, AuthController.logout);
router.post('/logout-all', authenticateJwt, AuthController.logoutAll);
router.post('/change-password', authenticateJwt, validateRequest(changePasswordSchema), AuthController.changePassword);

// 2FA Endpoints
router.post('/2fa/setup', authenticateJwt, AuthController.setup2FA);
router.post('/2fa/enable', authenticateJwt, validateRequest(twoFactorVerifySchema), AuthController.enable2FA);

export default router;
