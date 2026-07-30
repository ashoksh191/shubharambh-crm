import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Map,
  Users,
  DollarSign,
  Sparkles,
  Shield,
  User,
  FileText,
  CheckSquare,
  LogOut,
  MoreHorizontal,
  ChevronDown,
  PhoneCall,
  QrCode,
  FileCheck,
  Building,
} from 'lucide-react';
import { RoleGuard } from '../Auth/RoleGuard';

interface SidebarProps {
  activeTab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals';
  setActiveTab: (tab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals') => void;
  onOpenQuickFeature?: (featureName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenQuickFeature }) => {
  const { user: authUser, logout, switchRolePreset } = useAuth();
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close 3-dots features menu on click/touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreFeatures(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <aside className="app-sidebar">
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
        </div>
        <div className="sidebar-brand-title">
          <h2>SHUBHARAMBH</h2>
          <span>Green City Township</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Map size={18} />
          <span>Dashboard & Layout Map</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'mlm' ? 'active' : ''}`}
          onClick={() => setActiveTab('mlm')}
        >
          <Users size={18} />
          <span>MLM Associate Hierarchy</span>
        </button>

        <RoleGuard requiredPermissions="payments:approve">
          <button
            className={`sidebar-nav-item ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <DollarSign size={18} />
            <span>Accounting & Payments</span>
          </button>
        </RoleGuard>

        <button
          className={`sidebar-nav-item ${activeTab === 'usps' ? 'active' : ''}`}
          onClick={() => setActiveTab('usps')}
        >
          <Sparkles size={18} />
          <span>Project USPs & Gate</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          <span>Security Profile</span>
        </button>

        <RoleGuard requiredPermissions="users:manage_roles">
          <button
            className={`sidebar-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <CheckSquare size={18} />
            <span>Pending Approvals</span>
          </button>
        </RoleGuard>

        <RoleGuard requiredPermissions="audit_logs:read">
          <button
            className={`sidebar-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <FileText size={18} />
            <span>Security Audit Logs</span>
          </button>
        </RoleGuard>

        {/* 3 Dots (...) Expandable More Features Menu */}
        <div className="sidebar-more-section" ref={moreMenuRef}>
          <button
            className={`sidebar-nav-item more-toggle ${showMoreFeatures ? 'open' : ''}`}
            onClick={() => setShowMoreFeatures((prev) => !prev)}
            title="Tap for more CRM features"
          >
            <MoreHorizontal size={20} className="three-dots-icon" />
            <span>More Features</span>
            <ChevronDown size={14} className={`chevron-icon ${showMoreFeatures ? 'rotated' : ''}`} />
          </button>

          {showMoreFeatures && (
            <div className="more-features-dropdown">
              <button
                className="more-feature-subitem"
                onClick={() => {
                  setShowMoreFeatures(false);
                  setActiveTab('usps');
                  if (onOpenQuickFeature) onOpenQuickFeature('site-visit');
                }}
              >
                <Building size={15} />
                <span>Book Site Visit</span>
              </button>

              <button
                className="more-feature-subitem"
                onClick={() => {
                  setShowMoreFeatures(false);
                  setActiveTab('map');
                  if (onOpenQuickFeature) onOpenQuickFeature('qr-verify');
                }}
              >
                <QrCode size={15} />
                <span>QR Receipt Verification</span>
              </button>

              <button
                className="more-feature-subitem"
                onClick={() => {
                  setShowMoreFeatures(false);
                  setActiveTab('map');
                  if (onOpenQuickFeature) onOpenQuickFeature('bond');
                }}
              >
                <FileCheck size={15} />
                <span>Agreement Bond Generator</span>
              </button>

              <button
                className="more-feature-subitem"
                onClick={() => {
                  setShowMoreFeatures(false);
                  alert('24x7 Support Helpline: +91 98765 43210 / support@shubharambh.com');
                }}
              >
                <PhoneCall size={15} />
                <span>Help & Support</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile Card Footer (Matching SehatMitra / Screenshot UI) */}
      <div className="sidebar-user-footer">
        {authUser && (
          <>
            <div className="user-profile-info">
              <div className="user-avatar-circle">
                {authUser.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-text-details">
                <div className="user-name">{authUser.fullName || authUser.username || 'Ashok Kumar'}</div>
                <div className="user-email">{authUser.email || 'ashoksh191@gmail.com'}</div>
              </div>
            </div>

            {/* Role Preset Switcher */}
            <div className="sidebar-role-selector">
              <Shield size={14} color="#f59e0b" />
              <select
                value={authUser.role}
                onChange={(e) => switchRolePreset(e.target.value as any)}
                title="Switch Role Preset"
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
          </>
        )}

        <button className="sidebar-signout-btn" onClick={logout} title="Sign Out">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
