import { Router, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approvalService.js';
import { authenticateJwt, AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import { recordAuditLog } from '../middlewares/auditLogger.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { approvalReviewSchema } from '../validators/authValidators.js';

const router = Router();

router.use(authenticateJwt);
router.use(requirePermission('users:manage_roles'));

router.get('/pending', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pending = await ApprovalService.getPendingRegistrations();
    res.status(200).json({ success: true, pending });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/review',
  validateRequest(approvalReviewSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, action } = req.body;
      const updated = await ApprovalService.reviewUserRegistration(userId, action);

      await recordAuditLog({
        req,
        action: `USER_REGISTRATION_${action}`,
        targetEntity: 'User',
        targetId: userId,
        metadata: { newStatus: updated.status },
      });

      res.status(200).json({ success: true, message: `User registration ${action}D successfully.`, user: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
