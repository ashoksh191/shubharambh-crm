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
          
          <RoleGuard requiredPermissions="payments:approve">
            <button
              className={`nav-btn ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
            >
              <DollarSign size={16} /> Accounting Panel
            </button>
          </RoleGuard>

          <button
            className={`nav-btn ${activeTab === 'usps' ? 'active' : ''}`}
            onClick={() => setActiveTab('usps')}
          >
            <Sparkles size={16} /> Project USPs
          </button>

          {/* Security & Active Sessions Tab */}
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Security Profile
          </button>

          {/* Pending Registration Approvals Tab */}
          <RoleGuard requiredPermissions="users:manage_roles">
            <button
              className={`nav-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <CheckSquare size={16} /> Approvals
            </button>
          </RoleGuard>

          {/* Audit Trail Tab for Admins */}
          <RoleGuard requiredPermissions="audit_logs:read">
            <button
              className={`nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <FileText size={16} /> Audit Logs
            </button>
          </RoleGuard>
        </nav>

        {/* Role & Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {authUser && (
            <div className="role-switcher-container">
              <Shield size={16} color="var(--accent-gold)" />
              <span className="role-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                {authUser.role}
              </span>
              <select
                className="role-select"
                value={authUser.role}
                onChange={(e) => switchRolePreset(e.target.value as any)}
                title="Switch Active Role Preset"
              >
                <option value="SUPER_ADMIN">👑 Super Admin</option>
                <option value="ADMIN">🛡️ Admin</option>
                <option value="SALES_MANAGER">💼 Sales Manager</option>
                <option value="SALES_EXECUTIVE">🎯 Sales Executive</option>
                <option value="FINANCE">💰 Finance</option>
                <option value="ASSOCIATE">🤝 Associate</option>
                <option value="CUSTOMER_SUPPORT">🎧 Support</option>
                <option value="VIEWER">👁️ Viewer</option>
              </select>
            </div>
          )}

          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            title="Sign out of Shubharambh CRM"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
