import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateJwt } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { updateRoleSchema, registerSchema } from '../validators/authValidators.js';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', UserController.getProfile);
router.get('/', requirePermission('users:manage_roles'), UserController.listUsers);
router.post('/', requirePermission('users:create_admin'), validateRequest(registerSchema), UserController.createUser);
router.patch('/role', requirePermission('users:manage_roles'), validateRequest(updateRoleSchema), UserController.updateRole);

export default router;
