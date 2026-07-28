import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<Props> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-content glass-card" style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>🔐 Reset Your Password</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
            <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>Password Reset Token Dispatched!</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              We have generated a one-time 15-minute secure reset token for <strong>{email}</strong>. Please check your email inbox.
            </p>
            <button onClick={onClose} className="submit-btn-glow" style={{ marginTop: '1rem' }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: 0 }}>
              Enter your registered account email. We will issue a secure 15-minute one-time password reset token.
            </p>
            <div className="input-field-group">
              <label style={{ fontSize: '0.82rem', color: '#d1d5db' }}>Registered Email</label>
              <input
                type="email"
                className="glass-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn-glow" disabled={loading}>
              {loading ? 'Generating Token...' : 'Send Secure Reset Token'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(17, 24, 39, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: '1.75rem',
  maxWidth: '420px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#9ca3af',
  fontSize: '1.2rem',
  cursor: 'pointer',
};
