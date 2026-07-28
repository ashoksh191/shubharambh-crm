import { Response, NextFunction } from 'express';
import { SessionService } from '../services/sessionService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { recordAuditLog } from '../middlewares/auditLogger.js';

export class SessionController {
  static async getActiveSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) return;
      const sessions = await SessionService.getUserSessions(req.user.userId);
      res.status(200).json({
        success: true,
        sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) return;
      const sessionId = req.params.sessionId as string;

      const result = await SessionService.revokeSession(req.user.userId, sessionId);

      await recordAuditLog({
        req,
        action: 'SESSION_REVOKED',
        targetEntity: 'Session',
        targetId: sessionId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLoginHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) return;
      const history = await SessionService.getLoginHistory(req.user.userId);
      res.status(200).json({
        success: true,
        history,
      });
    } catch (error) {
      next(error);
    }
  }
}
