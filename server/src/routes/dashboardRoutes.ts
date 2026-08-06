import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);

export default router;
