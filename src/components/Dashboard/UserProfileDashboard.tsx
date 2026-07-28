import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TwoFactorSetupModal } from '../Auth/TwoFactorSetupModal';
import { apiClient } from '../../services/apiClient';
import './UserProfileDashboard.css';

export const UserProfileDashboard: React.FC = () => {
  const { user, logoutAll, sessions, loginHistory, fetchSessionsAndHistory, revokeSession } = useAuth();

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passStatus, setPassStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionsAndHistory();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.changePassword(oldPassword, newPassword);
      setPassStatus('Password changed successfully! You may need to log in again.');
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
              {user.twoFactorEnabled ? '🔒 2FA Enabled' : '🔓 2FA Disabled'}
            </span>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button className="sec-btn secondary" onClick={() => setShow2FAModal(true)}>
            {user.twoFactorEnabled ? 'Configure 2FA' : 'Enable 2FA'}
          </button>
          <button className="sec-btn danger" onClick={logoutAll}>
            Revoke All Sessions
          </button>
        </div>
      </div>

      {/* Grid Section: Security Settings & Permissions */}
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

        {/* Change Password Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>🔑 Change Account Password</h3>
          </div>

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
              <label>New Password (Min 8 chars, A-Z, 0-9, Special)</label>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn-glow" style={{ marginTop: '0.5rem' }}>
              Update Password & Regenerate JWT
            </button>
          </form>
        </div>

        {/* Recent Login History */}
        <div className="dash-card span-full">
          <div className="dash-card-header">
            <h3>📜 Login History Logs</h3>
          </div>
          <div className="session-table-container">
            <table className="session-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Browser & OS</th>
                  <th>Failure Reason</th>
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
                    <td>{log.browser} on {log.os}</td>
                    <td>{log.failureReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {show2FAModal && (
        <TwoFactorSetupModal
          onClose={() => setShow2FAModal(false)}
          onSuccess={() => {
            setShow2FAModal(false);
            alert('2-Factor Authentication has been successfully activated on your account!');
          }}
        />
      )}
    </div>
  );
};
