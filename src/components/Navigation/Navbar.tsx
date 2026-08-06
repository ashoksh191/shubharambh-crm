import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Map, Users, DollarSign, Sparkles, Shield, User, FileText, CheckSquare, LogOut } from 'lucide-react';
import { RoleGuard } from '../Auth/RoleGuard';

interface NavbarProps {
  activeTab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals';
  setActiveTab: (tab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user: authUser, logout, switchRolePreset } = useAuth();

  return (
    <header className="navbar" style={{ background: 'rgba(7, 41, 31, 0.94)', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', backdropFilter: 'blur(20px)' }}>
      <div className="navbar-inner">
        {/* Official Brand Logo */}
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('map'); }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #D4AF37', background: '#07291F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="brand-text">
            <h1 style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E8C96A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SHUBHARAMBH
            </h1>
            <span style={{ color: '#E8C96A', fontWeight: 600 }}>Green City Township • Lucknow</span>
          </div>
        </a>

        {/* Module Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
            style={{
              background: activeTab === 'map' ? '#0B3D2E' : 'transparent',
              border: activeTab === 'map' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'map' ? '#E8C96A' : '#F8F7F3',
              borderRadius: '10px',
            }}
          >
            <Map size={16} /> Architectural Layout Map
          </button>
          <button
            className={`nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
            onClick={() => setActiveTab('mlm')}
            style={{
              background: activeTab === 'mlm' ? '#0B3D2E' : 'transparent',
              border: activeTab === 'mlm' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'mlm' ? '#E8C96A' : '#F8F7F3',
              borderRadius: '10px',
            }}
          >
            <Users size={16} /> Network Team
          </button>

          <RoleGuard requiredPermissions="payments:approve">
            <button
              className={`nav-btn ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
              style={{
                background: activeTab === 'finance' ? '#0B3D2E' : 'transparent',
                border: activeTab === 'finance' ? '1px solid #D4AF37' : '1px solid transparent',
                color: activeTab === 'finance' ? '#E8C96A' : '#F8F7F3',
                borderRadius: '10px',
              }}
            >
              <DollarSign size={16} /> Accounting Panel
            </button>
          </RoleGuard>

          <button
            className={`nav-btn ${activeTab === 'usps' ? 'active' : ''}`}
            onClick={() => setActiveTab('usps')}
            style={{
              background: activeTab === 'usps' ? '#0B3D2E' : 'transparent',
              border: activeTab === 'usps' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'usps' ? '#E8C96A' : '#F8F7F3',
              borderRadius: '10px',
            }}
          >
            <Sparkles size={16} /> Project Features
          </button>

          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{
              background: activeTab === 'profile' ? '#0B3D2E' : 'transparent',
              border: activeTab === 'profile' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'profile' ? '#E8C96A' : '#F8F7F3',
              borderRadius: '10px',
            }}
          >
            <User size={16} /> My Profile
          </button>

          <RoleGuard requiredPermissions="users:manage_roles">
            <button
              className={`nav-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
              style={{
                background: activeTab === 'approvals' ? '#0B3D2E' : 'transparent',
                border: activeTab === 'approvals' ? '1px solid #D4AF37' : '1px solid transparent',
                color: activeTab === 'approvals' ? '#E8C96A' : '#F8F7F3',
                borderRadius: '10px',
              }}
            >
              <CheckSquare size={16} /> Approvals
            </button>
          </RoleGuard>

          <RoleGuard requiredPermissions="audit_logs:read">
            <button
              className={`nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
              style={{
                background: activeTab === 'audit' ? '#0B3D2E' : 'transparent',
                border: activeTab === 'audit' ? '1px solid #D4AF37' : '1px solid transparent',
                color: activeTab === 'audit' ? '#E8C96A' : '#F8F7F3',
                borderRadius: '10px',
              }}
            >
              <FileText size={16} /> Audit Logs
            </button>
          </RoleGuard>
        </nav>

        {/* Role & Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {authUser && (
            <div className="role-switcher-container" style={{ background: '#07291F', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', padding: '4px 8px' }}>
              <Shield size={16} color="#D4AF37" />
              <span className="role-badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#E8C96A', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {authUser.role}
              </span>
              {(authUser.role === 'SUPER_ADMIN' || authUser.role === 'ADMIN') && (
                <select
                  className="role-select"
                  value={authUser.role}
                  onChange={(e) => switchRolePreset(e.target.value as any)}
                  style={{ background: '#0B3D2E', color: '#F8F7F3', border: '1px solid #D4AF37', borderRadius: '6px' }}
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SALES_EXECUTIVE">SALES_EXECUTIVE</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                </select>
              )}
            </div>
          )}

          <button
            onClick={logout}
            style={{
              background: '#FFFFFF',
              color: '#07291F',
              border: '1px solid #D4AF37',
              borderRadius: '10px',
              padding: '6px 12px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};
