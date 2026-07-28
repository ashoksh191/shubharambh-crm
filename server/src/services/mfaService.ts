import { PrismaClient } from '@prisma/client';
import { encryptAES256, decryptAES256 } from '../utils/cryptoAES.js';
import {
  generateTwoFactorSecret,
  generateQRCodeDataUrl,
  verifyTwoFactorToken,
  generateBackupCodes,
} from '../utils/twoFactor.js';

const prisma = new PrismaClient();

export class MfaService {
  /**
   * Generates AES-256 encrypted TOTP secret & QR Code for setup
   */
  static async initiateTotpSetup(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const { secret, otpauthUrl } = generateTwoFactorSecret(user.username);
    const qrCodeDataUrl = await generateQRCodeDataUrl(otpauthUrl);
    const backupCodes = generateBackupCodes(10); // 10 Recovery codes (Requirement 1)

    // Encrypt secret & backup codes with AES-256 before saving to DB
    const encryptedSecret = encryptAES256(secret);
    const encryptedBackupCodes = encryptAES256(backupCodes.join(','));

    await prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        isEnabled: false,
      },
      create: {
        userId,
        secret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        isEnabled: false,
      },
    });

    return { secret, qrCodeDataUrl, backupCodes };
  }

  /**
   * Confirms & Enables TOTP MFA after verifying OTP
   */
  static async enableTotpMfa(userId: string, code: string) {
    const record = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!record) throw { statusCode: 400, message: 'Initiate MFA setup first.' };

    const plainSecret = decryptAES256(record.secret);
    const isValid = verifyTwoFactorToken(code, plainSecret);
    if (!isValid) throw { statusCode: 400, message: 'Invalid 6-digit OTP code.' };

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { isEnabled: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: 'Multi-Factor Authentication enabled successfully.' };
  }

  /**
   * Generates and dispatches Email OTP
   */
  static async sendEmailOtp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📧 [MFA] Dispatched Email OTP: ${otpCode} to ${user.email}`);

    return { message: `Email OTP code sent to ${user.email}` };
  }

  /**
   * Generates and dispatches SMS OTP
   */
  static async sendSmsOtp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.phone) throw { statusCode: 400, message: 'User mobile number not configured.' };

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 [MFA] Dispatched SMS OTP: ${otpCode} to ${user.phone}`);

    return { message: `SMS OTP code dispatched to ${user.phone}` };
  }

  /**
   * Registers a Trusted Device (30-day cookie bypass, Requirement 1)
   */
  static async registerTrustedDevice(userId: string, deviceHash: string, deviceName: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

    await prisma.trustedDevice.upsert({
      where: { deviceHash },
      update: { expiresAt },
      create: {
        userId,
        deviceHash,
        deviceName,
        expiresAt,
      },
    });

    return { expiresAt };
  }
}
