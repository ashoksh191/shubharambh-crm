import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AppRole } from '../../types/auth';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login, switchRolePreset } = useAuth();

  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('Password@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);

  // Calculate Password Strength score (0 to 4)
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 50, label: 'Medium', color: '#f59e0b' };
    if (score === 3) return { score: 75, label: 'Strong', color: '#3b82f6' };
    return { score: 100, label: 'Very Strong', color: '#10b981' };
  };

  const strength = calculateStrength(password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(identifier, password, rememberMe, twoFactorCode || undefined);
      if (res.requiresTwoFactor) {
        setRequiresTwoFactor(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (role: AppRole, userStr: string) => {
    switchRolePreset(role);
    setIdentifier(userStr);
    setPassword('Password@123456');
    setErrorMessage(null);
  };

  return (
    <div className="login-page-wrapper">
      {/* Background ambient lighting */}
      <div className="login-bg-glow-1"></div>
      <div className="login-bg-glow-2"></div>

      {/* Preset Quick Role Switcher Bar */}
      <div className="role-presets-bar">
        <div className="role-presets-header">
          <span>⚡ Enterprise Role Presets (Instant Demo Switcher):</span>
        </div>
        <div className="role-badges-group">
          <button className="role-preset-chip" onClick={() => handlePresetSelect('SUPER_ADMIN', 'superadmin')}>
            👑 Super Admin
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('ADMIN', 'admin')}>
            🛡️ Admin
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('SALES_MANAGER', 'salesmanager')}>
            💼 Sales Manager
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('SALES_EXECUTIVE', 'salesexec')}>
            🎯 Sales Executive
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('FINANCE', 'finance')}>
            💰 Finance
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('ASSOCIATE', 'associate')}>
            🤝 Associate
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('CUSTOMER_SUPPORT', 'support')}>
            🎧 Support
          </button>
          <button className="role-preset-chip" onClick={() => handlePresetSelect('VIEWER', 'viewer')}>
            👁️ Viewer
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className={`glass-login-card ${shake ? 'shake-animation' : ''}`}>
        <div className="brand-header">
          <div className="brand-logo-badge">🏞️</div>
          <h1>Shubharambh CRM</h1>
          <p>Enterprise Real Estate & Plot Inventory Security</p>
        </div>

        {errorMessage && (
          <div className="alert-box-error mb-3">
            <span>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Username / Email */}
          <div className="input-field-group">
            <label htmlFor="identifier">Email or Username</label>
            <div className="input-relative">
              <span className="field-icon">👤</span>
              <input
                id="identifier"
                type="text"
                className="glass-input"
                placeholder="Enter email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-field-group">
            <label htmlFor="password">Password</label>
            <div className="input-relative">
              <span className="field-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="glass-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="strength-meter-container">
                <div className="strength-bar-bg">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${strength.score}%`,
                      backgroundColor: strength.color,
                    }}
                  ></div>
                </div>
                <div className="strength-label">
                  <span>Password Strength</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2FA Code Input if triggered */}
          {requiresTwoFactor && (
            <div className="input-field-group">
              <label htmlFor="twoFactor">Google Authenticator / 2FA OTP Code</label>
              <div className="input-relative">
                <span className="field-icon">🔑</span>
                <input
                  id="twoFactor"
                  type="text"
                  className="glass-input"
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>
          )}

          {/* Options Row */}
          <div className="form-options-row">
            <label className="remember-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              className="forgot-pass-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn-glow" disabled={isLoading}>
            {isLoading ? (
              <span>Authenticating...</span>
            ) : requiresTwoFactor ? (
              <span>Verify OTP & Sign In</span>
            ) : (
              <span>Secure Sign In →</span>
            )}
          </button>
        </form>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};
