import React from 'react';
import { ShieldCheck, MapPin, FileText, Download } from 'lucide-react';

export const USPShowcase: React.FC = () => {
  return (
    <div className="usps-container" style={{ padding: '1rem' }}>
      {/* Grand Entrance Gate Banner */}
      <div className="usps-hero-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.8)' }}>
        <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden' }}>
          <img
            src="./assets/logo_and_entrance.jpg"
            alt="Shubharambh Green City Grand Entrance Gate"
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(11,15,25,0.95), transparent)', padding: '2rem 1.5rem 1rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              SHUBHARAMBH GREEN CITY TOWNSHIP
            </h2>
            <p style={{ color: '#e5e7eb', fontSize: '0.95rem', margin: '0.4rem 0 0 0' }}>
              स्वागतं आपका हार्दिक अभिनंदन • Village Hasnapur, Amethi, Lucknow (Purwnachal Expressway)
            </p>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>🌿</div>
          <h4 style={{ margin: 0, color: '#10b981' }}>हरियाली भरा परिवेश</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Green Environment & Parks</p>
        </div>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>🛣️</div>
          <h4 style={{ margin: 0, color: '#f59e0b' }}>चौड़ी सड़कें</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>50ft, 40ft, 30ft, 25ft Wide Roads</p>
        </div>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>👮</div>
          <h4 style={{ margin: 0, color: '#3b82f6' }}>24x7 सुरक्षा</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Gated Entrance & Security</p>
        </div>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>🚰</div>
          <h4 style={{ margin: 0, color: '#06b6d4' }}>पेयजल सुविधा</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>24/7 Clean Water Supply</p>
        </div>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>☀️</div>
          <h4 style={{ margin: 0, color: '#eab308' }}>सोलर स्ट्रीट लाइट</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Solar Street Lights</p>
        </div>
        <div style={featureBoxStyle}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>🏛️</div>
          <h4 style={{ margin: 0, color: '#ec4899' }}>क्लब हाउस & पार्क</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Club House & Central Parks</p>
        </div>
      </div>

      {/* Official Layout Blueprint Card */}
      <div style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="#f59e0b" size={22} /> Official Master Layout Plan Blueprint (Amethi, Lucknow)
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Architect: Ar. Sachin Pal (The Art Life Architecture) • Contact: 9935887067
            </p>
          </div>

          <a
            href="./assets/layout_plan_master.pdf"
            download="Shubharambh_Green_City_Master_Layout.pdf"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <Download size={16} /> Download PDF Blueprint
          </a>
        </div>

        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000000' }}>
          <img
            src="./assets/layout_map_fast.jpg"
            alt="Shubharambh Master Layout Blueprint"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* Legal & Location Specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <MapPin size={20} /> Prime Location Connectivity
          </h3>
          <ul style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '0.88rem', paddingLeft: '1.2rem' }}>
            <li>📍 <strong>Location</strong>: Village Hasnapur, Amethi, Lucknow</li>
            <li>🛣️ <strong>Purwnachal Expressway</strong>: Directly connected via 50ft Wide Boulevard Entrance</li>
            <li>🏫 <strong>Education & Medical Hub</strong>: Schools, colleges, and hospitals within 10-15 mins</li>
            <li>🛒 <strong>Commercial Space</strong>: 20,440 sq.ft Commercial Zone & 29,535 sq.ft Mixed Land Use</li>
          </ul>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <ShieldCheck size={20} /> Guaranteed Safe Investment
          </h3>
          <ul style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '0.88rem', paddingLeft: '1.2rem' }}>
            <li>📜 <strong>Clear Title Deeds</strong>: 100% Freehold Residential & Commercial Plots</li>
            <li>🔒 <strong>Secure Registry</strong>: Instant Registry and Immediate Mutation (Dakhil Kharij)</li>
            <li>🤝 <strong>Developer</strong>: Shubharambh Heights & Green City Township</li>
            <li>✨ <strong>Tagline</strong>: <em>"यहाँ सुविधाएं नहीं, एक बेहतर जीवन आपका इंतजार कर रहा है।"</em></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const featureBoxStyle: React.CSSProperties = {
  background: 'rgba(17, 24, 39, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1rem',
  textAlign: 'center',
};
