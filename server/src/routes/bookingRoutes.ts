import { Router } from 'express';
import { createBookingController, getBookingController, listBookingsController } from '../controllers/bookingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Protected Booking Endpoints with RBAC & DB-Driven Permissions
router.post(
  '/',
  authenticate,
  authorize({ roles: ['SUPER_ADMIN', 'SALES_MANAGER', 'ASSOCIATE'], permission: 'BOOKING_CREATE' }),
  createBookingController
);

router.get(
  '/',
  authenticate,
  authorize({ roles: ['SUPER_ADMIN', 'SALES_MANAGER', 'ASSOCIATE', 'FINANCE', 'VIEWER'] }),
  listBookingsController
);

router.get('/:id', authenticate, getBookingController);

export default router;
