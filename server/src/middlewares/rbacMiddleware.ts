import { Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware.js';
import { recordAuditLog } from './auditLogger.js';

const prisma = new PrismaClient();

export interface AuthorizeOptions {
  roles?: (Role | string)[];
  permission?: string;
}

/**
 * Role-Based Access Control (RBAC) & Database-Driven Permission Middleware
 */
export const authorize = (options: AuthorizeOptions) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        });
        return;
      }

      const userRole = req.user.role;

      // 1. SUPER_ADMIN bypasses all role & permission restrictions
      if (userRole === 'SUPER_ADMIN') {
        next();
        return;
      }

      // 2. Check Allowed Roles
      if (options.roles && options.roles.length > 0) {
        const isRoleAllowed = options.roles.some((r) => r.toUpperCase() === userRole.toUpperCase());
        if (!isRoleAllowed) {
          await recordAuditLog({
            req,
            action: 'PERMISSION_DENIED',
            targetEntity: 'RBAC',
            metadata: { requiredRoles: options.roles, userRole },
          });

          res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: `Permission Denied: Your role '${userRole}' is not authorized to access this resource.`,
          });
          return;
        }
      }

      // 3. Database-Driven Permission Check
      if (options.permission) {
        const hasPermission = await prisma.rolePermission.findFirst({
          where: {
            role: userRole as Role,
            permission: {
              code: options.permission,
            },
          },
        });

        if (!hasPermission) {
          await recordAuditLog({
            req,
            action: 'PERMISSION_DENIED',
            targetEntity: 'Permission',
            metadata: { requiredPermission: options.permission, userRole },
          });

          res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: `Permission Denied: Required permission '${options.permission}' is missing for role '${userRole}'.`,
          });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
