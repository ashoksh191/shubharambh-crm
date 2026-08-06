import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import * as plotController from '../controllers/plotController.js';

const router = Router();

router.use(authenticate);

router.get('/available', plotController.getAvailablePlots);
router.get('/search', plotController.searchPlots);
router.post('/:id/reserve', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }), plotController.reservePlot);
router.post('/:id/release', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }), plotController.releasePlot);
router.post('/', authorize({ roles: ['SUPER_ADMIN', 'ADMIN'] }), plotController.createPlot);

export default router;
