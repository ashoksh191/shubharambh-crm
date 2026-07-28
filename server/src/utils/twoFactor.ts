import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

authenticator.options = {
  window: 1, // Allows 30-sec tolerance before/after
};

export const generateTwoFactorSecret = (username: string) => {
  const secret = authenticator.generateSecret();
  const serviceName = 'Shubharambh Green City CRM';
  const otpauthUrl = authenticator.keyuri(username, serviceName, secret);

  return { secret, otpauthUrl };
};

export const generateQRCodeDataUrl = async (otpauthUrl: string): Promise<string> => {
  return await QRCode.toDataURL(otpauthUrl);
};

export const verifyTwoFactorToken = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};

export const generateBackupCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};
