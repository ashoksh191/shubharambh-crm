import { Router } from 'express';
import { SessionController } from '../controllers/sessionController.js';
import { authenticateJwt } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateJwt);

router.get('/active', SessionController.getActiveSessions);
router.delete('/:sessionId', SessionController.revokeSession);
router.get('/history', SessionController.getLoginHistory);

export default router;
