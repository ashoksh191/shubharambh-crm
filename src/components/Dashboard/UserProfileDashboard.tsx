import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TwoFactorSetupModal } from '../Auth/TwoFactorSetupModal';
import { TrustedDevicesTab } from './TrustedDevicesTab';
import { apiClient } from '../../services/apiClient';
import './UserProfileDashboard.css';

export const UserProfileDashboard: React.FC = () => {
  const { user, logoutAll, sessions, loginHistory, fetchSessionsAndHistory, revokeSession } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'passkeys' | 'password'>('sessions');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passStatus, setPassStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionsAndHistory();
  }, [fetchSessionsAndHistory]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.changePassword(oldPassword, newPassword);
      setPassStatus('Password changed successfully! Previous 5 password hashes updated.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassStatus(err.message || 'Failed to change password.');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-dashboard-container">
      {/* Profile Header */}
      <div className="profile-hero-card">
        <div className="profile-avatar">
          {user.fullName.charAt(0)}
        </div>
        <div className="profile-details">
          <h2>{user.fullName}</h2>
          <div className="profile-meta-row">
            <span className="role-pill-badge">{user.role}</span>
            <span>✉️ {user.email}</span>
            {user.phone && <span>📱 {user.phone}</span>}
            <span className={`status-badge ${user.twoFactorEnabled ? 'verified' : 'unverified'}`}>
              {user.twoFactorEnabled ? '🔒 MFA Active' : '🔓 MFA Disabled'}
            </span>
            <span style={{ color: '#fcd34d', fontSize: '0.78rem' }}>⏳ Password Expiry: In 82 days</span>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button className="sec-btn secondary" onClick={() => setShow2FAModal(true)}>
            {user.twoFactorEnabled ? 'Configure MFA' : 'Enable MFA'}
          </button>
          <button className="sec-btn danger" onClick={logoutAll}>
            Revoke All Sessions
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button
          className={`sec-btn ${activeSubTab === 'sessions' ? 'secondary' : ''}`}
          onClick={() => setActiveSubTab('sessions')}
        >
          📱 Active Sessions & History
        </button>
        <button
          className={`sec-btn ${activeSubTab === 'passkeys' ? 'secondary' : ''}`}
          onClick={() => setActiveSubTab('passkeys')}
        >
          🔑 WebAuthn Passkeys & Trusted Devices
        </button>
        <button
          className={`sec-btn ${activeSubTab === 'password' ? 'secondary' : ''}`}
          onClick={() => setActiveSubTab('password')}
        >
          🔒 Password Policy & Security
        </button>
      </div>

      {activeSubTab === 'passkeys' && (
        <TrustedDevicesTab userEmail={user.email} userName={user.fullName} />
      )}

      {activeSubTab === 'sessions' && (
        <div className="dashboard-grid">
          {/* Active Device Sessions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>📱 Logged Devices & Active Sessions</h3>
              <button className="refresh-btn" onClick={fetchSessionsAndHistory}>🔄 Refresh</button>
            </div>
            <p className="dash-card-sub">Manage active tokens across all your browsers and devices.</p>

            <div className="session-table-container">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Device / Browser</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Login Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>No active sessions recorded.</td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{sess.device}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{sess.browser} ({sess.os})</div>
                        </td>
                        <td><code>{sess.ipAddress}</code></td>
                        <td>{sess.country}</td>
                        <td>{new Date(sess.createdAt).toLocaleString()}</td>
                        <td>
                          {sess.isCurrent ? (
                            <span className="current-sess-tag">Current Device</span>
                          ) : (
                            <button className="revoke-btn" onClick={() => revokeSession(sess.id)}>
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Login History */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>📜 Recent Login Audit History</h3>
            </div>
            <div className="session-table-container">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`log-status-pill ${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                      <td><code>{log.ipAddress}</code></td>
                      <td>{log.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'password' && (
        <div className="dash-card" style={{ maxWidth: '600px' }}>
          <div className="dash-card-header">
            <h3>🔑 Update Password & History Rules</h3>
          </div>
          <p className="dash-card-sub">Password policy requires min 12 characters and restricts reusing the last 5 passwords.</p>

          {passStatus && <div className="status-notice">{passStatus}</div>}

          <form onSubmit={handleChangePassword} className="change-pass-form">
            <div className="input-field-group">
              <label>Current Password</label>
              <input
                type="password"
                className="glass-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-field-group">
              <label>New Password (Min 12 chars, A-Z, 0-9, Special)</label>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn-glow" style={{ marginTop: '0.5rem' }}>
              Update Password & Store History Hash
            </button>
          </form>
        </div>
      )}

      {show2FAModal && (
        <TwoFactorSetupModal
          onClose={() => setShow2FAModal(false)}
          onSuccess={() => {
            setShow2FAModal(false);
            alert('Multi-Factor Authentication has been successfully activated on your account!');
          }}
        />
      )}
    </div>
  );
};
