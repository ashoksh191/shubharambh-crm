import React, { useState } from 'react';
import { WebAuthnClient } from '../../services/webAuthnClient';

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
}

interface TrustedDevice {
  id: string;
  name: string;
  ip: string;
  expiresAt: string;
}

export const TrustedDevicesTab: React.FC<{ userEmail: string; userName: string }> = ({ userEmail, userName }) => {
  const [passkeys, setPasskeys] = useState<Passkey[]>([
    { id: 'pk-01', name: 'Windows Hello Fingerprint Sensor', createdAt: new Date().toLocaleDateString() },
    { id: 'pk-02', name: 'iPhone 15 Touch ID / Face ID', createdAt: new Date(Date.now() - 86400000 * 5).toLocaleDateString() },
  ]);

  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([
    { id: 'td-01', name: 'Work Workstation (Chrome)', ip: '192.168.1.45', expiresAt: 'In 28 days' },
  ]);

  const [registering, setRegistering] = useState(false);

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    try {
      if (!WebAuthnClient.isSupported()) {
        throw new Error('WebAuthn Passkeys are not supported by this browser.');
      }
      const cred = await WebAuthnClient.registerPasskey(userEmail, userName);
      const newPk: Passkey = {
        id: cred.credentialId,
        name: 'New Platform Passkey (' + new Date().toLocaleTimeString() + ')',
        createdAt: new Date().toLocaleDateString(),
      };
      setPasskeys((prev) => [newPk, ...prev]);
      alert('Passkey successfully registered!');
    } catch (e: any) {
      alert(e.message || 'Failed to register passkey.');
    } finally {
      setRegistering(false);
    }
  };

  const removePasskey = (id: string) => {
    setPasskeys((prev) => prev.filter((p) => p.id !== id));
  };

  const removeTrustedDevice = (id: string) => {
    setTrustedDevices((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      {/* Passkeys Card */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>🔑 Registered WebAuthn Passkeys</h3>
          <button className="sec-btn secondary" onClick={handleRegisterPasskey} disabled={registering}>
            {registering ? 'Scanning Biometrics...' : '+ Register New Passkey'}
          </button>
        </div>
        <p className="dash-card-sub">Passwordless Touch ID, Face ID, Windows Hello & YubiKey credentials.</p>

        <div className="session-table-container">
          <table className="session-table">
            <thead>
              <tr>
                <th>Authenticator Name</th>
                <th>Registered Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {passkeys.map((pk) => (
                <tr key={pk.id}>
                  <td><strong style={{ color: '#ffffff' }}>{pk.name}</strong></td>
                  <td>{pk.createdAt}</td>
                  <td>
                    <button className="revoke-btn" onClick={() => removePasskey(pk.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trusted Devices Card */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>🛡️ 30-Day Trusted Devices (MFA Bypass)</h3>
        </div>
        <p className="dash-card-sub">Devices remembered for 30 days without prompting for MFA OTP codes.</p>

        <div className="session-table-container">
          <table className="session-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>IP Address</th>
                <th>Trust Expiry</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trustedDevices.map((td) => (
                <tr key={td.id}>
                  <td>{td.name}</td>
                  <td><code>{td.ip}</code></td>
                  <td><span style={{ color: '#6ee7b7' }}>{td.expiresAt}</span></td>
                  <td>
                    <button className="revoke-btn" onClick={() => removeTrustedDevice(td.id)}>Revoke Trust</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
