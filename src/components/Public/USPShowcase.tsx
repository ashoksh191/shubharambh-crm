import React from 'react';
import { Trees, ShieldCheck, Sun, Droplets, Home, Car } from 'lucide-react';

export const USPShowcase: React.FC = () => {
  const usps = [
    {
      icon: <Trees size={28} color="#10b981" />,
      title: "Eco Green Environment",
      desc: "60-Bigha lush green township with landscaped parks, open walkways & 1000+ planted trees.",
    },
    {
      icon: <Car size={28} color="#d4af37" />,
      title: "40ft & 30ft Wide Roads",
      desc: "Spacious concrete wide sector avenues & main boulevard connecting all blocks.",
    },
    {
      icon: <ShieldCheck size={28} color="#059669" />,
      title: "24x7 Gated Security",
      desc: "Perimeter boundary wall, smart CCTV surveillance & 24x7 guarded security entry gates.",
    },
    {
      icon: <Droplets size={28} color="#0284c7" />,
      title: "Pure Drinking Water",
      desc: "Overhead water storage tanks & deep borewell underground supply line network.",
    },
    {
      icon: <Sun size={28} color="#f59e0b" />,
      title: "Solar Street Lights",
      desc: "Energy-efficient automatic solar street lighting along all internal sector roads.",
    },
    {
      icon: <Home size={28} color="#8b5cf6" />,
      title: "Premium Club House",
      desc: "Community club house, swimming pool, badminton court & children's play area.",
    },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f382c, #08221b)',
      color: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      padding: '32px',
      marginTop: '32px',
      border: '2px solid var(--accent-gold)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Project Highlights & USPs
        </span>
        <h2 style={{ color: '#ffffff', fontSize: '1.75rem', marginTop: '4px' }}>
          Why Invest in Shubharambh Green City?
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {usps.map((usp, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(8px)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {usp.icon}
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '4px' }}>{usp.title}</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.4 }}>{usp.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
