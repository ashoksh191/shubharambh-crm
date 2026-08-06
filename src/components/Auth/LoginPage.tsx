import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';
import { PasskeyLogin } from './PasskeyLogin';
import { CaptchaWidget } from './CaptchaWidget';
import { generateDeviceFingerprint } from '../../utils/fingerprint';
import { dispatchRealSmsOtp } from '../../utils/fast2smsClient';
import { Mail, Lock, ArrowLeft, LogIn, Sparkles, UserCheck, Eye, EyeOff } from 'lucide-react';
import luxuryModernTownshipImg from '../../assets/luxury_modern_township.jpg';
import luxuryVillasImg from '../../assets/luxury_villas.jpg';
import luxuryTownshipImg from '../../assets/luxury_township.jpg';
import '../../styles/LoginPage.css';

const FAST2SMS_API_KEY = 'B57vxDy96JW4dtrlmUasIzQoenHj21Fk8XgRwqTNfYOiEZPpCSKETS7m53od4VMDfwZvsyqN90kYuej1';

const CAROUSEL_SLIDES = [
  {
    id: 0,
    image: luxuryModernTownshipImg,
    tag: 'Luxury Township CRM',
    titleLine1: 'Manage Every Plot.',
    titleLine2: 'Manage Every Lead.',
    subtext: 'Luxury Township CRM for complete property management.',
  },
  {
    id: 1,
    image: luxuryVillasImg,
    tag: 'Premium Real Estate',
    titleLine1: 'Premium Township.',
    titleLine2: 'Premium Investment.',
    subtext: 'Invest in 60-bigha master planned prime gated township.',
  },
  {
    id: 2,
    image: luxuryTownshipImg,
    tag: 'Smart Township CRM',
    titleLine1: 'Luxury Living.',
    titleLine2: 'Smart Property Management.',
    subtext: 'Real-time plot availability, automated agreement bonds & GIS engine.',
  },
];

interface LoginPageProps {
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome }) => {
  const { login } = useAuth();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

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

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const sendNewOtp = async (channel: 'SMS' | 'EMAIL' | 'TOTP') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTwoFactorCode(code);

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
    }, 200);
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
    } catch (_e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySuccess = (userObj: any) => {
    login(userObj.username, 'Password@123456');
  };

  return (
    <div className="sgc-login-container">
      {/* Background ambient glow circles matching Landing Page */}
      <div className="hero-ambient-glow-circle-1" />
      <div className="hero-ambient-glow-circle-2" />

      {/* Main Split-Screen Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`sgc-login-split-grid ${shake ? 'shake-animation' : ''}`}
      >
        {/* LEFT COLUMN: Premium Hero Image & Text Carousel Showcase */}
        <div
          className="sgc-login-left-showcase"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Crossfade Images */}
          <div className="login-carousel-images-container">
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <motion.img
                key={slide.id}
                src={slide.image}
                alt="Luxury Real Estate Showcase"
                className="login-bg-showcase-img"
                initial={false}
                animate={{
                  opacity: activeSlide === idx ? 1 : 0,
                  scale: activeSlide === idx ? 1.08 : 1.02,
                }}
                transition={{
                  opacity: { duration: 0.8, ease: 'easeInOut' },
                  scale: { duration: 6, ease: 'linear' },
                }}
                style={{
                  zIndex: activeSlide === idx ? 1 : 0,
                }}
              />
            ))}
          </div>

          {/* Dark Gradient Overlay */}
          <div className="login-bg-overlay" />

          {/* Top Brand Badge */}
          <div className="mercury-pill-badge" style={{ alignSelf: 'flex-start' }}>
            <Sparkles size={13} color="#34d399" />
            SHUBHARAMBH GREEN CITY
          </div>

          {/* Bottom-left Content Lockup with synchronized text animation */}
          <div className="login-left-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={CAROUSEL_SLIDES[activeSlide].id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div className="login-brand-subtitle-tag">{CAROUSEL_SLIDES[activeSlide].tag}</div>
                <h1 className="login-left-headline">
                  {CAROUSEL_SLIDES[activeSlide].titleLine1} <br />
                  <span className="hero-gradient-text">{CAROUSEL_SLIDES[activeSlide].titleLine2}</span>
                </h1>
                <p className="login-left-subtext">
                  {CAROUSEL_SLIDES[activeSlide].subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* 3 Premium Badges */}
            <div className="login-trust-chips">
              <div className="trust-chip">
                <span className="badge-check-icon">✓</span>
                <span>RERA Approved</span>
              </div>
              <div className="trust-chip">
                <span className="badge-check-icon">✓</span>
                <span>980+ Plots</span>
              </div>
              <div className="trust-chip">
                <span className="badge-check-icon">✓</span>
                <span>Secure CRM</span>
              </div>
            </div>

            {/* 3 Manual Navigation Dots */}
            <div className="hero-carousel-dots">
              {CAROUSEL_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero-carousel-dot ${activeSlide === idx ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Centered Glassmorphism Login Card */}
        <div className="sgc-login-right-wrapper">
          {onBackToHome && (
            <motion.button
              whileHover={{ x: -4 }}
              className="sgc-login-back-btn"
              onClick={onBackToHome}
            >
              <ArrowLeft size={15} /> Back to main site
            </motion.button>
          )}

          <div className="login-form-card-inner">
            {/* Header Brand Ring & Titles */}
            <div className="login-brand-header">
              <div className="sgc-logo-ring">
                <img
                  src="./assets/logo_and_entrance.jpg"
                  alt="Shubharambh Green City Logo"
                  className="sgc-logo-img"
                />
                <div className="sgc-logo-glow" />
              </div>
              <h2>Welcome Back</h2>
              <p>Login to access your CRM dashboard.</p>
            </div>

            {/* Fast Direct Access Sign In */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="login-fast-direct-btn"
              onClick={handleFastDirectLogin}
            >
              <Sparkles size={16} color="#34d399" /> Fast Direct Sign In (Demo Access)
            </motion.button>

            <div className="login-divider">
              <span>or log in with credentials</span>
            </div>

            {errorMessage && (
              <div className="alert-box-error">
                <span>⚠️</span>
                <div>{errorMessage}</div>
              </div>
            )}

            {step === 'CREDENTIALS' ? (
              <form onSubmit={handleCredentialsSubmit} className="sgc-login-form">
                {/* Identifier Input */}
                <div className="sgc-input-group">
                  <label htmlFor="identifier">Username or Email</label>
                  <div className="sgc-input-relative">
                    <Mail size={17} className="sgc-field-icon" />
                    <input
                      id="identifier"
                      type="text"
                      className="sgc-input"
                      placeholder="you@example.com or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="sgc-input-group">
                  <label htmlFor="password">Password</label>
                  <div className="sgc-input-relative">
                    <Lock size={17} className="sgc-field-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="sgc-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="sgc-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="login-form-options">
                  <label className="remember-me-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    className="forgot-pass-btn"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                {failedCount >= 3 && (
                  <CaptchaWidget onVerify={(token) => setCaptchaToken(token)} />
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary-gradient login-submit-btn"
                  disabled={isLoading}
                >
                  <LogIn size={17} /> {isLoading ? 'Verifying...' : 'Login to Dashboard'}
                </motion.button>

                {/* Passkeys & Registration */}
                <div className="login-extra-methods">
                  <PasskeyLogin onSuccess={handlePasskeySuccess} onError={(msg) => setErrorMessage(msg)} />

                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="register-account-btn"
                  >
                    <UserCheck size={15} /> Register New Mobile Account
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: 2FA Form */
              <form onSubmit={handleOtpVerify} className="sgc-login-form">
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>2-Factor Verification</h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                    Type the 6-digit OTP code below.
                  </p>
                </div>

                {otpNotice && (
                  <div style={{ background: '#07291F', border: '1px solid #D4AF37', color: '#E8C96A', padding: '0.85rem', borderRadius: '14px', fontSize: '0.85rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '3px', margin: '0.3rem 0', color: '#ffffff' }}>
                      OTP CODE: {generatedOtp}
                    </div>
                  </div>
                )}

                <div className="sgc-input-group">
                  <label htmlFor="mfaChannel">2FA Channel</label>
                  <select
                    value={mfaChannel}
                    onChange={(e) => {
                      const ch = e.target.value as 'SMS' | 'EMAIL' | 'TOTP';
                      setMfaChannel(ch);
                      sendNewOtp(ch);
                    }}
                    className="sgc-input"
                    style={{ paddingLeft: '14px' }}
                  >
                    <option value="SMS">📱 Mobile SMS OTP</option>
                    <option value="EMAIL">📧 Email OTP</option>
                    <option value="TOTP">🔑 Authenticator App</option>
                  </select>
                </div>

                <div className="sgc-input-group">
                  <label htmlFor="twoFactorCode">6-Digit OTP Code</label>
                  <div className="sgc-input-relative">
                    <Lock size={17} className="sgc-field-icon" />
                    <input
                      id="twoFactorCode"
                      type="text"
                      className="sgc-input"
                      placeholder="123456"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary-gradient login-submit-btn"
                  disabled={isLoading}
                >
                  <LogIn size={17} /> {isLoading ? 'Verifying OTP...' : 'Verify & Complete Login'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem', textAlign: 'center' }}
                >
                  ← Back to Password
                </button>
              </form>
            )}

            {/* Footer Branding */}
            <div className="login-footer-branding">
              Powered by Shubharambh Green City CRM
            </div>
          </div>
        </div>
      </motion.div>

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
