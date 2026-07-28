import { Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class AuditController {
  static async getAuditLogs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);

      const result = await AuditService.getAuditLogs(page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
