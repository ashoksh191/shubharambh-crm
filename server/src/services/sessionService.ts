import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SessionService {
  static async getUserSessions(userId: string) {
    return await prisma.session.findMany({
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
