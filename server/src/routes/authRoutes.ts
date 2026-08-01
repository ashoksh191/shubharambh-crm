import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { loginRateLimiter, authStrictRateLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validateRequest.js';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
} from '../validators/authValidators.js';

const router = Router();

// Public Auth Endpoints (v1 & Root Aliases)
router.post('/login', loginRateLimiter, validate(loginSchema), AuthController.login);
router.post('/register', authStrictRateLimiter, validate(registerSchema), AuthController.register);
router.post('/send-otp', authStrictRateLimiter, AuthController.sendOtp);
router.post('/refresh', AuthController.refresh);

// Protected Auth Endpoints
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

// 2FA Endpoints
router.post('/2fa/setup', authenticate, AuthController.setup2FA);
router.post('/2fa/enable', authenticate, validate(twoFactorVerifySchema), AuthController.enable2FA);

export default router;
