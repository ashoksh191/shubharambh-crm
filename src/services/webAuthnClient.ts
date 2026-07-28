export class WebAuthnClient {
  public static isSupported(): boolean {
    return (
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === 'function'
    );
  }

  /**
   * Registers a new Passkey authenticator (Touch ID, Face ID, Windows Hello)
   */
  public static async registerPasskey(userEmail: string, userName: string): Promise<{ credentialId: string; publicKey: string }> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn Passkeys are not supported by this browser.');
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode(userEmail);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Shubharambh Green City CRM',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Passkey creation failed or cancelled.');
    }

    const credentialId = Buffer.from(credential.rawId).toString('base64url');
    const publicKey = 'pubkey_' + Math.random().toString(36).substring(2);

    return { credentialId, publicKey };
  }

  /**
   * Authenticates using registered Passkey
   */
  public static async authenticatePasskey(): Promise<{ credentialId: string }> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn Passkeys are not supported by this browser.');
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const options: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'preferred',
    };

    const assertion = (await navigator.credentials.get({
      publicKey: options,
    })) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Passkey authentication cancelled or failed.');
    }

    const credentialId = Buffer.from(assertion.rawId).toString('base64url');
    return { credentialId };
  }
}
