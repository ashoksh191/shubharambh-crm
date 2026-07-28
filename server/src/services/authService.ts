import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateSecureRandomToken,
} from '../utils/jwt.js';
import {
  generateTwoFactorSecret,
  generateQRCodeDataUrl,
  verifyTwoFactorToken,
  generateBackupCodes,
} from '../utils/twoFactor.js';
import { parseClientDeviceInfo, ClientDeviceInfo } from '../utils/agentParser.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Secure Login Engine
   */
  static async login(
    identifier: string,
    plainTextPass: string,
    rememberMe: boolean,
    twoFactorToken: string | undefined,
    deviceInfo: ClientDeviceInfo
  ) {
    // 1. Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      // Record failed login history
      await prisma.loginHistory.create({
        data: {
          username: identifier,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          country: deviceInfo.country,
          status: 'FAILED',
          failureReason: 'User does not exist',
        },
      });
      throw { statusCode: 401, message: 'Invalid email/username or password.' };
    }

    // 2. Check Account Lock Status (Requirement 10)
    if (user.status === UserStatus.LOCKED || user.status === UserStatus.SUSPENDED) {
      if (user.lockoutUntil && new Date() > user.lockoutUntil) {
        // Cooldown period passed, unlock user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: UserStatus.ACTIVE,
            failedAttempts: 0,
            lockoutUntil: null,
          },
        });
      } else {
        const remainingMinutes = user.lockoutUntil
          ? Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (1000 * 60))
          : config.security.lockoutDurationMinutes;

        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            username: user.username,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            country: deviceInfo.country,
            status: 'FAILED',
            failureReason: `Account locked. Try again in ${remainingMinutes} mins.`,
          },
        });

        throw {
          statusCode: 423,
          message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`,
        };
      }
    }

    // 3. Verify Password Hash (Bcrypt)
    const isPasswordValid = await verifyPassword(plainTextPass, user.passwordHash);

    if (!isPasswordValid) {
      const updatedFailedAttempts = user.failedAttempts + 1;
      let newStatus = user.status;
      let lockoutUntil: Date | null = null;

      if (updatedFailedAttempts >= config.security.maxLoginAttempts) {
        newStatus = UserStatus.LOCKED;
        lockoutUntil = new Date(Date.now() + config.security.lockoutDurationMinutes * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: updatedFailedAttempts,
          status: newStatus,
          lockoutUntil,
        },
      });

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          username: user.username,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          country: deviceInfo.country,
          status: 'FAILED',
          failureReason: `Invalid password. Attempt ${updatedFailedAttempts}/${config.security.maxLoginAttempts}`,
        },
      });

      if (newStatus === UserStatus.LOCKED) {
        throw {
          statusCode: 423,
          message: `Too many failed attempts. Account locked for ${config.security.lockoutDurationMinutes} minutes.`,
        };
      }

      throw {
        statusCode: 401,
        message: `Invalid email/username or password. ${config.security.maxLoginAttempts - updatedFailedAttempts} attempts remaining before account lock.`,
      };
    }

    // 4. Verify 2FA if enabled (Requirement 23)
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return {
          requiresTwoFactor: true,
          userId: user.id,
          username: user.username,
        };
      }

      const twoFactorRecord = await prisma.twoFactorAuth.findUnique({
        where: { userId: user.id },
      });

      if (!twoFactorRecord) {
        throw { statusCode: 500, message: '2FA configuration corrupted.' };
      }

      const isValidOtp = verifyTwoFactorToken(twoFactorToken, twoFactorRecord.secret);
      const isBackupCode = twoFactorRecord.backupCodes
        .split(',')
        .map((c) => c.trim())
        .includes(twoFactorToken);

      if (!isValidOtp && !isBackupCode) {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            username: user.username,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            country: deviceInfo.country,
            status: 'FAILED',
            failureReason: 'Invalid 2FA OTP code',
          },
        });
        throw { statusCode: 401, message: 'Invalid 2FA Verification Code.' };
      }
    }

    // 5. Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockoutUntil: null,
        status: UserStatus.ACTIVE,
      },
    });

    // 6. Generate Tokens & Session
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload, rememberMe);
    const tokenHash = hashToken(refreshToken);

    const expiresDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: deviceInfo.country,
        expiresAt,
      },
    });

    // Log successful login history
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        username: user.username,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: deviceInfo.country,
        status: 'SUCCESS',
      },
    });

    return {
      requiresTwoFactor: false,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      session: {
        id: session.id,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
      },
    };
  }

  /**
   * Automatic Token Refresh Engine (Requirement 5)
   */
  static async refreshTokens(rawRefreshToken: string, deviceInfo: ClientDeviceInfo) {
    try {
      const payload = verifyRefreshToken(rawRefreshToken);
      const tokenHash = hashToken(rawRefreshToken);

      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!session || session.isRevoked || new Date() > session.expiresAt) {
        throw { statusCode: 401, message: 'Refresh token expired or revoked.' };
      }

      const user = session.user;
      if (user.status !== UserStatus.ACTIVE) {
        throw { statusCode: 403, message: 'Account is not active.' };
      }

      // Generate fresh token pair
      const newPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: session.id,
      };

      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload, false);
      const newTokenHash = hashToken(newRefreshToken);

      // Rotate session token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          tokenHash: newTokenHash,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error) {
      throw { statusCode: 401, message: 'Invalid refresh token.' };
    }
  }

  /**
   * Session Revocation & Logout (Requirement 8)
   */
  static async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await prisma.session.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  static async logoutAll(userId: string) {
    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Password Change (Requirement 21)
   */
  static async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const isValid = await verifyPassword(oldPass, user.passwordHash);
    if (!isValid) throw { statusCode: 400, message: 'Current password is incorrect.' };

    const newHash = await hashPassword(newPass);

    // Update password and revoke existing sessions
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password updated successfully. All sessions revoked.' };
  }

  /**
   * 2FA Setup
   */
  static async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const { secret, otpauthUrl } = generateTwoFactorSecret(user.username);
    const qrCodeDataUrl = await generateQRCodeDataUrl(otpauthUrl);
    const backupCodes = generateBackupCodes();

    await prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret,
        backupCodes: backupCodes.join(','),
        isEnabled: false,
      },
      create: {
        userId,
        secret,
        backupCodes: backupCodes.join(','),
        isEnabled: false,
      },
    });

    return { secret, qrCodeDataUrl, backupCodes };
  }

  static async enable2FA(userId: string, code: string) {
    const record = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!record) throw { statusCode: 400, message: 'Please initiate 2FA setup first.' };

    const isValid = verifyTwoFactorToken(code, record.secret);
    if (!isValid) throw { statusCode: 400, message: 'Invalid OTP verification code.' };

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { isEnabled: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: '2FA enabled successfully.' };
  }
}
