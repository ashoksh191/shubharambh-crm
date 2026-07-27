import React from 'react';
import { useApp } from '../../context/AppContext';
import { Map, Users, DollarSign, Sparkles, RotateCcw, Shield } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'mlm' | 'finance' | 'usps';
  setActiveTab: (tab: 'map' | 'mlm' | 'finance' | 'usps') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, users, setCurrentUserId, resetAllData } = useApp();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('map'); }}>
          <div className="brand-icon">SGC</div>
          <div className="brand-text">
            <h1>SHUBHARAMBH</h1>
            <span>Green City CRM & Plot Inventory</span>
          </div>
        </a>

        {/* Module Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={16} /> Interactive Map
          </button>
          <button
            className={`nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
            onClick={() => setActiveTab('mlm')}
          >
            <Users size={16} /> MLM Hierarchy
          </button>
          <button
            className={`nav-btn ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <DollarSign size={16} /> Accounting Panel
          </button>
          <button
            className={`nav-btn ${activeTab === 'usps' ? 'active' : ''}`}
            onClick={() => setActiveTab('usps')}
          >
            <Sparkles size={16} /> Project USPs
          </button>
        </nav>

        {/* Role Switcher Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="role-switcher-container">
            <Shield size={16} color="var(--accent-gold)" />
            <span className={`role-badge role-${currentUser.role}`}>
              {currentUser.role}
            </span>
            <select
              className="role-select"
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              title="Switch Active User & Role"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Demo Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all plots, bookings and transactions to initial seed state?')) {
                resetAllData();
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Reset to Initial Seed Data"
          >
            <RotateCcw size={14} /> Reset Data
          </button>
        </div>
      </div>
    </header>
  );
};
