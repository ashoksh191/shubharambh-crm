import { prisma } from '../config/database.js';
import { redisCache } from '../config/redis.js';

export class SessionService {
  static async getUserSessions(userId: string) {
    const cacheKey = `sessions:${userId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_e) {
        // Ignore
      }
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        device: true,
        browser: true,
        os: true,
        ipAddress: true,
        country: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    await redisCache.set(cacheKey, JSON.stringify(sessions), 120);
    return sessions;
  }

  static async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw { statusCode: 404, message: 'Session not found or already revoked.' };
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    // Invalidate Redis session caches
    await redisCache.del(`sessions:${userId}`);
    await redisCache.set(`revoked_session:${sessionId}`, 'true', 86400);

    return { message: 'Session revoked successfully.' };
  }

  static async getLoginHistory(userId: string) {
    return await prisma.loginHistory.findMany({
      where: { userId },
      select: {
        id: true,
        ipAddress: true,
        browser: true,
        os: true,
        device: true,
        country: true,
        status: true,
        failureReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
