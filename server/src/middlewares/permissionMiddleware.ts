import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

export type Permission =
  | 'plots:read'
  | 'plots:create'
  | 'plots:edit'
  | 'plots:delete'
  | 'bookings:create'
  | 'bookings:cancel'
  | 'payments:approve'
  | 'receipts:generate'
  | 'users:manage_roles'
  | 'users:create_admin'
  | 'master_data:edit'
  | 'audit_logs:read'
  | 'sessions:manage';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'plots:read',
    'plots:create',
    'plots:edit',
    'plots:delete',
    'bookings:create',
    'bookings:cancel',
    'payments:approve',
    'receipts:generate',
    'users:manage_roles',
    'users:create_admin',
    'master_data:edit',
    'audit_logs:read',
    'sessions:manage',
  ],
  ADMIN: [
    'plots:read',
    'plots:create',
    'plots:edit',
    'plots:delete',
    'bookings:create',
    'bookings:cancel',
    'receipts:generate',
    'master_data:edit',
    'audit_logs:read',
    'sessions:manage',
  ],
  SALES_MANAGER: [
    'plots:read',
    'plots:edit',
    'bookings:create',
    'bookings:cancel',
    'receipts:generate',
    'sessions:manage',
  ],
  SALES_EXECUTIVE: [
    'plots:read',
    'bookings:create',
    'sessions:manage',
  ],
  FINANCE: [
    'plots:read',
    'payments:approve',
    'receipts:generate',
    'sessions:manage',
  ],
  ASSOCIATE: [
    'plots:read',
    'bookings:create',
    'sessions:manage',
  ],
  CUSTOMER_SUPPORT: [
    'plots:read',
    'sessions:manage',
  ],
  VIEWER: [
    'plots:read',
    'sessions:manage',
  ],
};

export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: `Role '${userRole}' lacks required permissions: [${requiredPermissions.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
