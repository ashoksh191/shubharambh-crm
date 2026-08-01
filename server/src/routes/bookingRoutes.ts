import { Router } from 'express';
import { createBookingController, getBookingController, listBookingsController } from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBookingController);
router.get('/', listBookingsController);
router.get('/:id', getBookingController);

export default router;
