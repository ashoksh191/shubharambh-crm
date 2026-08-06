import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }), paymentController.addPayment);
router.post('/:id/verify', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] }), paymentController.verifyPayment);
router.get('/booking/:bookingId', paymentController.getPaymentsByBooking);
router.delete('/:id', authorize({ roles: ['SUPER_ADMIN', 'ADMIN'] }), paymentController.deletePayment);

export default router;
