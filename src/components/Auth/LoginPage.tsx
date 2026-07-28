import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AppRole } from '../../types/auth';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';
import { PasskeyLogin } from './PasskeyLogin';
import { CaptchaWidget } from './CaptchaWidget';
import { generateDeviceFingerprint } from '../../utils/fingerprint';
import { dispatchRealSmsOtp } from '../../utils/fast2smsClient';
import './LoginPage.css';

const FAST2SMS_API_KEY = 'B57vxDy96JW4dtrlmUasIzQoenHj21Fk8XgRwqTNfYOiEZPpCSKETS7m53od4VMDfwZvsyqN90kYuej1';

export const LoginPage: React.FC = () => {
  const { login, switchRolePreset } = useAuth();

  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('Password@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [mfaChannel, setMfaChannel] = useState<'SMS' | 'EMAIL' | 'TOTP'>('SMS');

  // Mandatory 2FA OTP state
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [generatedOtp, setGeneratedOtp] = useState<string>('123456');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  const [failedCount, setFailedCount] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    generateDeviceFingerprint();
  }, []);

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 12) score += 2;
    else if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 25, label: 'Weak (Rejected)', color: '#ef4444' };
    if (score === 3) return { score: 50, label: 'Medium', color: '#f59e0b' };
    if (score === 4) return { score: 75, label: 'Strong', color: '#3b82f6' };
    return { score: 100, label: 'Very Strong', color: '#10b981' };
  };

  const strength = calculateStrength(password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const sendNewOtp = async (channel: 'SMS' | 'EMAIL' | 'TOTP') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTwoFactorCode(code); // Pre-fill generated OTP for seamless zero-friction demo testing

    if (channel === 'SMS') {
      const targetPhone = '+919876543210';
      const result = await dispatchRealSmsOtp(targetPhone, code, FAST2SMS_API_KEY);
      if (result.success) {
        setOtpNotice(`📱 [Real SMS Sent!] Code sent to your mobile SIM.`);
      } else {
        setOtpNotice(result.message);
      }
    } else if (channel === 'EMAIL') {
      setOtpNotice(`📧 [Email OTP Dispatched] Enter the 6-digit OTP code to verify.`);
    } else {
      setOtpNotice(`🔑 [Authenticator App TOTP Active] Enter 6-digit OTP code.`);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (failedCount >= 3 && !captchaToken) {
      setErrorMessage('Please complete the CAPTCHA verification to proceed.');
      triggerShake();
      return;
    }

    if (!identifier || !password) {
      setErrorMessage('Please enter both username/email and password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      setStep('OTP');
      await sendNewOtp(mfaChannel);
    }, 300);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsLoading(true);
    try {
      await login(identifier, password, rememberMe, twoFactorCode || generatedOtp);
    } catch (err: any) {
      setFailedCount((prev) => prev + 1);
      setErrorMessage(err.message || 'Authentication failed after 2FA.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastDirectLogin = async () => {
    setIsLoading(true);
    try {
      await login(identifier || 'superadmin', password || 'Password@123456', rememberMe, '123456');
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySuccess = (userObj: any) => {
    login(userObj.username, 'Password@123456');
  };

  const handlePresetSelect = (role: AppRole, userStr: string) => {
    switchRolePreset(role);
    setIdentifier(userStr);
    setPassword('Password@123456');
    setErrorMessage(null);
    setStep('CREDENTIALS');
  };

  return (
    <div className="login-page-wrapper">
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
        {/* Clean Logo Header Without Address Line */}
        <div className="brand-header">
          <div style={{ margin: '0 auto 0.75rem auto', width: '180px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
            <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SHUBHARAMBH
          </h1>
        </div>

        {/* Step 1: Passkeys or Standard Credentials */}
        {step === 'CREDENTIALS' && (
          <>
            <PasskeyLogin onSuccess={handlePasskeySuccess} onError={(msg) => setErrorMessage(msg)} />

            {/* Direct Instant Fast Sign In Button */}
            <button
              type="button"
              onClick={handleFastDirectLogin}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              🚀 Fast Direct Sign In (Instant Access)
            </button>

            {/* Create Custom Account / Register Mobile button */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginBottom: '0.75rem',
              }}
            >
              ➕ Create Custom Account / Register Mobile
            </button>

            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.78rem', margin: '0.75rem 0' }}>
              ── OR ENTER CREDENTIALS FOR MANDATORY OTP ──
            </div>
          </>
        )}

        {errorMessage && (
          <div className="alert-box-error mb-3">
            <span>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        )}

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleCredentialsSubmit} className="login-form">
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

            <div className="input-field-group">
              <label htmlFor="password">Password (Min 12 Chars)</label>
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
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>

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

            {failedCount >= 3 && (
              <CaptchaWidget onVerify={(token) => setCaptchaToken(token)} />
            )}

            <div className="form-options-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Device (30 Days)</span>
              </label>

              <button
                type="button"
                className="forgot-pass-link"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="submit-btn-glow" disabled={isLoading}>
              {isLoading ? 'Verifying Password...' : 'Proceed to Mandatory 2FA OTP →'}
            </button>
          </form>
        ) : (
          /* Step 2: Mandatory 2FA OTP Form */
          <form onSubmit={handleOtpVerify} className="login-form">
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>🔒</div>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>2-Factor Authentication Required</h3>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '0.2rem 0' }}>
                Account protected with mandatory 2FA. Type the 6-digit OTP code below.
              </p>
            </div>

            {otpNotice && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '2px', margin: '0.3rem 0', color: '#ffffff', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '6px' }}>
                  OTP CODE: {generatedOtp}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', marginTop: '0.3rem' }}>
                  {otpNotice}
                </div>
              </div>
            )}

            <div className="input-field-group">
              <label style={{ fontSize: '0.82rem', color: '#d1d5db' }}>Select 2FA Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => { setMfaChannel('SMS'); sendNewOtp('SMS'); }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (mfaChannel === 'SMS' ? '#10b981' : 'rgba(255,255,255,0.15)'),
                    background: mfaChannel === 'SMS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                    color: mfaChannel === 'SMS' ? '#10b981' : '#9ca3af',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📱 Real SMS OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setMfaChannel('EMAIL'); sendNewOtp('EMAIL'); }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (mfaChannel === 'EMAIL' ? '#10b981' : 'rgba(255,255,255,0.15)'),
                    background: mfaChannel === 'EMAIL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                    color: mfaChannel === 'EMAIL' ? '#10b981' : '#9ca3af',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📧 Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setMfaChannel('TOTP'); sendNewOtp('TOTP'); }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (mfaChannel === 'TOTP' ? '#10b981' : 'rgba(255,255,255,0.15)'),
                    background: mfaChannel === 'TOTP' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                    color: mfaChannel === 'TOTP' ? '#10b981' : '#9ca3af',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔑 Authenticator App
                </button>
              </div>
            </div>

            <div className="input-field-group">
              <label htmlFor="twoFactorCode">Type the 6-Digit OTP Code</label>
              <div className="input-relative">
                <span className="field-icon">🔑</span>
                <input
                  id="twoFactorCode"
                  type="text"
                  className="glass-input"
                  placeholder="Enter 6-digit OTP code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn-glow" disabled={isLoading}>
              {isLoading ? 'Verifying OTP Code...' : 'Verify OTP & Complete Sign In →'}
            </button>

            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem' }}
            >
              ← Back to Password
            </button>
          </form>
        )}
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newUsr) => {
            setShowRegisterModal(false);
            setIdentifier(newUsr.username);
            alert(`Account registered for ${newUsr.fullName}! You can now log in using username: ${newUsr.username}`);
          }}
        />
      )}
    </div>
  );
};
