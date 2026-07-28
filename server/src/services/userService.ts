import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw { statusCode: 404, message: 'User profile not found.' };
    return user;
  }

  static async listAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUserRole(targetUserId: string, newRole: Role) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return updated;
  }

  static async createUser(userData: {
    email: string;
    username: string;
    fullName: string;
    phone?: string;
    password: string;
    role: Role;
  }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existing) {
      throw { statusCode: 400, message: 'User with this email or username already exists.' };
    }

    const passwordHash = await hashPassword(userData.password);

    return await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName,
        phone: userData.phone || null,
        passwordHash,
        role: userData.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
