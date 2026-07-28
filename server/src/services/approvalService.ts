import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ApprovalService {
  static async getPendingRegistrations() {
    return await prisma.user.findMany({
      where: { status: UserStatus.PENDING_APPROVAL },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async reviewUserRegistration(userId: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'DEACTIVATE') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'Target user not found.' };

    let newStatus: UserStatus = user.status;

    switch (action) {
      case 'APPROVE':
        newStatus = UserStatus.ACTIVE;
        break;
      case 'REJECT':
        newStatus = UserStatus.DEACTIVATED;
        break;
      case 'SUSPEND':
        newStatus = UserStatus.SUSPENDED;
        break;
      case 'DEACTIVATE':
        newStatus = UserStatus.DEACTIVATED;
        break;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }
}
