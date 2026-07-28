import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { recordAuditLog } from '../middlewares/auditLogger.js';
import { registerSchema, updateRoleSchema } from '../validators/authValidators.js';

export class UserController {
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) return;
      const profile = await UserService.getUserProfile(req.user.userId);
      res.status(200).json({
        success: true,
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await UserService.listAllUsers();
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const newUser = await UserService.createUser(validated as any);

      await recordAuditLog({
        req,
        action: 'USER_CREATED',
        targetEntity: 'User',
        targetId: newUser.id,
        metadata: { role: newUser.role, username: newUser.username },
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        user: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validated = updateRoleSchema.parse(req.body);
      const updated = await UserService.updateUserRole(validated.userId, validated.role as any);

      await recordAuditLog({
        req,
        action: 'USER_ROLE_CHANGED',
        targetEntity: 'User',
        targetId: updated.id,
        metadata: { newRole: updated.role, targetUser: updated.username },
      });

      res.status(200).json({
        success: true,
        message: `Role for ${updated.username} updated to ${updated.role}.`,
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
