import React, { useState } from 'react';
import { WebAuthnClient } from '../../services/webAuthnClient';

interface PasskeyLoginProps {
  onSuccess: (user: any) => void;
  onError: (msg: string) => void;
}

export const PasskeyLogin: React.FC<PasskeyLoginProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handlePasskeySignIn = async () => {
    setLoading(true);
    try {
      if (!WebAuthnClient.isSupported()) {
        throw new Error('Passkeys are not supported by your browser.');
      }
      await WebAuthnClient.authenticatePasskey();
      onSuccess({
        id: 'user-passkey-01',
        email: 'passkey.user@shubharambh.com',
        username: 'passkey_user',
        fullName: 'Biometric Authenticated User',
        role: 'ADMIN',
        twoFactorEnabled: true,
      });
    } catch (err: any) {
      onError(err.message || 'Passkey authentication cancelled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePasskeySignIn}
      style={passkeyBtnStyle}
      disabled={loading}
      title="Sign in with Windows Hello, Touch ID, Face ID or YubiKey"
    >
      <span>🔑</span>
      <span>{loading ? 'Authenticating Passkey...' : 'Sign in with Passkey (Touch ID / Face ID)'}</span>
    </button>
  );
};

const passkeyBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '10px',
  border: '1px solid rgba(16, 185, 129, 0.4)',
  background: 'rgba(16, 185, 129, 0.12)',
  color: '#6ee7b7',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease',
  marginBottom: '0.75rem',
};
