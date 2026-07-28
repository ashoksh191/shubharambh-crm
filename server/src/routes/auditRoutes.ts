import { Router } from 'express';
import { AuditController } from '../controllers/auditController.js';
import { authenticateJwt } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authenticateJwt);
router.get('/', requirePermission('audit_logs:read'), AuditController.getAuditLogs);

export default router;
