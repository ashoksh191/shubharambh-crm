import { Router } from 'express';
import { listCustomersController, createCustomerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', listCustomersController);
router.post('/', createCustomerController);

export default router;
