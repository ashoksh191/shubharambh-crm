import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import * as customerController from '../controllers/customerController.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', authorize({ roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] }), customerController.updateCustomer);
router.delete('/:id', authorize({ roles: ['SUPER_ADMIN', 'ADMIN'] }), customerController.deleteCustomer);

export default router;
