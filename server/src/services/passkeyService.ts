import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class PasskeyService {
  /**
   * Generates WebAuthn registration options for new authenticator
   */
  static async generateRegistrationOptions(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const challenge = crypto.randomBytes(32).toString('base64url');

    return {
      challenge,
      rp: { name: 'Shubharambh Green City CRM', id: 'localhost' },
      user: {
        id: user.id,
        name: user.email,
        displayName: user.fullName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    };
  }

  /**
   * Saves registered WebAuthn passkey credential
   */
  static async verifyAndSaveCredential(
    userId: string,
    credentialId: string,
    publicKey: string,
    transports?: string
  ) {
    return await prisma.webAuthnCredential.create({
      data: {
        userId,
        credentialId,
        publicKey,
        transports: transports || 'internal,usb,ble,nfc',
      },
    });
  }

  /**
   * Generates WebAuthn authentication options for passwordless sign-in
   */
  static async generateAuthenticationOptions(identifier: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { webAuthnCredentials: true },
    });

    if (!user) throw { statusCode: 404, message: 'User not found.' };

    const challenge = crypto.randomBytes(32).toString('base64url');

    const allowCredentials = user.webAuthnCredentials.map((cred) => ({
      id: cred.credentialId,
      type: 'public-key',
    }));

    return {
      challenge,
      allowCredentials,
      userVerification: 'preferred',
      userId: user.id,
    };
  }

  /**
   * Verifies Passkey Assertion signature & logs user in
   */
  static async verifyAssertion(userId: string, credentialId: string) {
    const credential = await prisma.webAuthnCredential.findFirst({
      where: { userId, credentialId },
      include: { user: true },
    });

    if (!credential) throw { statusCode: 401, message: 'Invalid or unregistered WebAuthn Passkey credential.' };

    return credential.user;
  }
}
