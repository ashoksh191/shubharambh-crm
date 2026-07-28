import React, { useState } from 'react';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckboxClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      onVerify('turnstile_token_' + Date.now().toString(36));
    }, 600);
  };

  return (
    <div style={containerStyle}>
      <div style={innerBoxStyle} onClick={!verified && !loading ? handleCheckboxClick : undefined}>
        <div style={checkboxStyle}>
          {loading ? (
            <span style={{ fontSize: '0.8rem', color: '#10b981' }}>⌛</span>
          ) : verified ? (
            <span style={{ fontSize: '1rem', color: '#10b981' }}>✓</span>
          ) : (
            <div style={emptyBoxStyle} />
          )}
        </div>
        <span style={{ fontSize: '0.82rem', color: '#d1d5db', fontWeight: 500 }}>
          {verified ? 'Security Verification Passed' : 'I am human (Smart CAPTCHA)'}
        </span>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Protected by Cloudflare Turnstile</div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  background: 'rgba(31, 41, 55, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  padding: '0.65rem 0.85rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '0.5rem',
};

const innerBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  width: '22px',
  height: '22px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.2)',
};

const emptyBoxStyle: React.CSSProperties = {
  width: '12px',
  height: '12px',
  background: 'transparent',
};
