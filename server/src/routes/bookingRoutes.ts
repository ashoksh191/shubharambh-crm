import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }), bookingController.createBooking);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/cancel', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] }), bookingController.cancelBooking);
router.post('/:id/register', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] }), bookingController.registerBooking);

export default router;
