import { PrismaClient } from '@prisma/client';
import { parseClientDeviceInfo } from '../utils/agentParser.js';
import { AuthenticatedRequest } from './authMiddleware.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface AuditParams {
  req: AuthenticatedRequest;
  action: string;
  targetEntity: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export const recordAuditLog = async ({
  req,
  action,
  targetEntity,
  targetId,
  metadata,
}: AuditParams): Promise<void> => {
  try {
    const { ipAddress, userAgent } = parseClientDeviceInfo(req);
    const userId = req.user?.userId || null;
    const username = req.user?.username || 'SYSTEM_GUEST';
    const role = req.user?.role || 'UNAUTHENTICATED';

    await prisma.auditLog.create({
      data: {
        userId,
        username,
        role,
        action,
        targetEntity,
        targetId: targetId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      },
    });

    logger.info(`[AUDIT] Action: ${action} | User: ${username} (${role}) | Entity: ${targetEntity}`);
  } catch (error) {
    logger.error('Failed to record audit log:', error);
  }
};
