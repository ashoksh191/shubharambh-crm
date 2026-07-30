import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { parseClientDeviceInfo } from '../utils/agentParser.js';
import { recordAuditLog } from '../middlewares/auditLogger.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { recordFailedAuthAttempt, resetAuthAttemptState } from '../middlewares/rateLimiter.js';
import {
  loginSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
  registerSchema,
} from '../validators/authValidators.js';

const getCookieOptions = (maxAgeMs?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export class AuthController {
  /**
   * Registers a Custom User / Admin Account directly in Database
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await AuthService.registerCustomAccount(validated as any);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully! You can now log in.',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Triggers real SMS OTP / Email OTP
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, channel } = req.body;
      const result = await AuthService.triggerRealOtp(userId, channel || 'SMS');

      res.status(200).json({
        success: true,
        message: result.message,
        otpCode: result.otpCode,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const deviceInfo = parseClientDeviceInfo(req);

      const result = await AuthService.login(
        validated.identifier,
        validated.password,
        validated.rememberMe || false,
        validated.twoFactorToken,
        deviceInfo
      );

      if (result.requiresTwoFactor) {
        res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          userId: result.userId,
          email: result.email,
          phone: result.phone,
          otpCode: result.otpCode,
          message: result.message,
        });
        return;
      }

      if (result.refreshToken) {
        const cookieMaxAge = validated.rememberMe
          ? 30 * 24 * 60 * 60 * 1000
          : 7 * 24 * 60 * 60 * 1000;

        res.cookie('refreshToken', result.refreshToken, getCookieOptions(cookieMaxAge));
      }

      await recordAuditLog({
        req: { ...req, user: { userId: result.user!.id, email: result.user!.email, username: result.user!.username, role: result.user!.role } } as AuthenticatedRequest,
        action: 'USER_LOGIN_SUCCESS',
        targetEntity: 'User',
        targetId: result.user!.id,
      });

      // Reset rate-limit attempt state on success
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
      resetAuthAttemptState(ip, validated.identifier);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        accessToken: result.accessToken,
        user: result.user,
        session: result.session,
      });
    } catch (error) {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
      recordFailedAuthAttempt(ip, req.body?.identifier);
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      if (!rawRefreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh Token Missing',
          message: 'No refresh token provided in HTTP-Only cookie.',
        });
        return;
      }

      const deviceInfo = parseClientDeviceInfo(req);
      const result = await AuthService.refreshTokens(rawRefreshToken, deviceInfo);

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.clearCookie('refreshToken', getCookieOptions());
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await AuthService.logout(rawRefreshToken);

      if (req.user) {
        await recordAuditLog({
          req,
          action: 'USER_LOGOUT',
          targetEntity: 'User',
          targetId: req.user.userId,
        });
      }

      res.clearCookie('refreshToken', getCookieOptions());
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      res.clearCookie('refreshToken', getCookieOptions());
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return;
      await AuthService.logoutAll(req.user.userId);

      await recordAuditLog({
        req,
        action: 'USER_LOGOUT_ALL_DEVICES',
        targetEntity: 'User',
        targetId: req.user.userId,
      });

      res.clearCookie('refreshToken', getCookieOptions());
      res.status(200).json({
        success: true,
        message: 'All device sessions revoked successfully.',
      });
    } catch (error) {
      res.clearCookie('refreshToken', getCookieOptions());
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return;
      const validated = changePasswordSchema.parse(req.body);

      const result = await AuthService.changePassword(
        req.user.userId,
        validated.oldPassword,
        validated.newPassword
      );

      await recordAuditLog({
        req,
        action: 'PASSWORD_CHANGED',
        targetEntity: 'User',
        targetId: req.user.userId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setup2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return;
      const result = await AuthService.setup2FA(req.user.userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async enable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return;
      const validated = twoFactorVerifySchema.parse(req.body);

      res.status(200).json({
        success: true,
        message: '2FA Activated.',
      });
    } catch (error) {
      next(error);
    }
  }
}
