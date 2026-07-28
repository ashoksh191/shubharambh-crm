import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { parseClientDeviceInfo } from '../utils/agentParser.js';
import { recordAuditLog } from '../middlewares/auditLogger.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import {
  loginSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
} from '../validators/authValidators.js';

export class AuthController {
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
          message: 'Two-factor authentication code required.',
        });
        return;
      }

      // Set Refresh Token in Secure HttpOnly Cookie
      if (result.refreshToken) {
        const cookieMaxAge = validated.rememberMe
          ? 30 * 24 * 60 * 60 * 1000 // 30 Days
          : 7 * 24 * 60 * 60 * 1000; // 7 Days

        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: cookieMaxAge,
          path: '/api/auth/refresh',
        });
      }

      await recordAuditLog({
        req: { ...req, user: { userId: result.user!.id, email: result.user!.email, username: result.user!.username, role: result.user!.role } } as AuthenticatedRequest,
        action: 'USER_LOGIN_SUCCESS',
        targetEntity: 'User',
        targetId: result.user!.id,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        accessToken: result.accessToken,
        user: result.user,
        session: result.session,
      });
    } catch (error) {
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

      // Rotate Refresh Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
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

      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
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

      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
      res.status(200).json({
        success: true,
        message: 'All device sessions revoked successfully.',
      });
    } catch (error) {
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

      const result = await AuthService.enable2FA(req.user.userId, validated.code);

      await recordAuditLog({
        req,
        action: '2FA_ENABLED',
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
}
