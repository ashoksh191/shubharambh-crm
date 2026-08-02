import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { RoleGuard } from '../Auth/RoleGuard';

interface SidebarProps {
  activeTab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals';
  setActiveTab: (tab: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals') => void;
  onOpenQuickFeature?: (featureName: string) => void;
}

interface NavItem {
  id: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals';
  label: string;
  icon: React.FC<{ size?: number }>;
  badge: string | null;
  permission?: any;
  color: string;
  key: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenQuickFeature }) => {
  const { user: authUser, logout, switchRolePreset } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Shubharambh 60-Bigha Main');
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts Listener ([M] Map, [A] MLM, [F] Finance, [P] Profile, [\] Toggle Sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '\\' || (e.ctrlKey && e.key === 'b')) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setActiveTab('map');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setActiveTab('mlm');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveTab('finance');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveTab('profile');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreFeatures(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const navItems: NavItem[] = useMemo(() => {
    return [
      { id: 'map', label: 'Dashboard & Layout Map', icon: Map, badge: 'LIVE', color: '#10b981', key: 'M' },
      { id: 'mlm', label: 'MLM Associate Hierarchy', icon: Users, badge: null, color: '#38bdf8', key: 'A' },
      { id: 'finance', label: 'Accounting & Payments', icon: DollarSign, badge: null, permission: 'payments:approve', color: '#f59e0b', key: 'F' },
      { id: 'usps', label: 'Project USPs & Gate', icon: Sparkles, badge: 'NEW', color: '#a855f7', key: 'U' },
      { id: 'profile', label: 'Security Profile', icon: User, badge: null, color: '#0284c7', key: 'P' },
      { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare, badge: '2', permission: 'users:manage_roles', color: '#ef4444', key: 'R' },
      { id: 'audit', label: 'Security Audit Logs', icon: FileText, badge: null, permission: 'audit_logs:read', color: '#64748b', key: 'S' },
    ];
  }, []);

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [navItems, searchQuery]);

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '80px' : '280px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Brand & Workspace Switcher Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
        </div>
        {!isCollapsed && (
          <div className="sidebar-brand-title">
            <h2>SHUBHARAMBH</h2>
            <span>Green City Township</span>
          </div>
        )}
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Expand Sidebar (\\)' : 'Collapse Sidebar (\\)'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="sidebar-workspace-wrapper" ref={workspaceRef}>
          <button
            className="sidebar-workspace-btn"
            onClick={() => setShowWorkspaceMenu((prev) => !prev)}
          >
            <div className="workspace-badge-icon">
              <Layers size={14} color="#0284c7" />
            </div>
            <div className="workspace-title-block">
              <span className="workspace-label">ACTIVE WORKSPACE</span>
              <strong className="workspace-name">{activeWorkspace}</strong>
            </div>
            <ChevronDown size={14} className={`chevron-icon ${showWorkspaceMenu ? 'rotated' : ''}`} />
          </button>

          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="workspace-menu-dropdown"
              >
                {['Shubharambh 60-Bigha Main', 'Kanpur Highway Phase-II', 'Green Valley Extension'].map((ws) => (
                  <div
                    key={ws}
                    className={`workspace-menu-item ${activeWorkspace === ws ? 'active' : ''}`}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <ChevronRight size={14} color="#0284c7" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sidebar Quick Filter Search Input */}
      {!isCollapsed && (
        <div className="sidebar-search-box">
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Quick search tabs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        {filteredNavItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;

          const buttonElement = (
            <motion.button
              key={item.id}
              whileHover={{ x: isCollapsed ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? `${item.label} [${item.key}]` : undefined}
            >
              <div className="nav-icon-container" style={{ color: isActive ? '#0284c7' : item.color }}>
                <IconComp size={18} />
              </div>

              {!isCollapsed && <span className="nav-item-label">{item.label}</span>}

              {!isCollapsed && item.badge && (
                <span
                  className="nav-item-badge"
                  style={{
                    background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    color: item.badge === 'LIVE' ? '#10b981' : '#0284c7',
                    border: `1px solid ${item.badge === 'LIVE' ? '#10b981' : '#0284c7'}`,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {!isCollapsed && <kbd className="nav-item-shortcut">{item.key}</kbd>}
            </motion.button>
          );

          if (item.permission) {
            return (
              <RoleGuard key={item.id} requiredPermissions={item.permission}>
                {buttonElement}
              </RoleGuard>
            );
          }

          return buttonElement;
        })}

        {/* 3 Dots (...) Expandable More Features Menu */}
        <div className="sidebar-more-section" ref={moreMenuRef}>
          <motion.button
            whileHover={{ x: isCollapsed ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            className={`sidebar-nav-item more-toggle ${showMoreFeatures ? 'open' : ''}`}
            onClick={() => setShowMoreFeatures((prev) => !prev)}
            title="More CRM Features"
          >
            <MoreHorizontal size={20} className="three-dots-icon" />
            {!isCollapsed && <span>More Features</span>}
            {!isCollapsed && <ChevronDown size={14} className={`chevron-icon ${showMoreFeatures ? 'rotated' : ''}`} />}
          </motion.button>

          <AnimatePresence>
            {showMoreFeatures && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="more-features-dropdown"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Profile Card Footer */}
      <div className="sidebar-user-footer">
        {authUser && (
          <>
            <div className="user-profile-info">
              <div className="user-avatar-circle">
                {authUser.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {!isCollapsed && (
                <div className="user-text-details">
                  <div className="user-name">{authUser.fullName || authUser.username || 'Ashok Kumar'}</div>
                  <div className="user-email">{authUser.email || 'ashoksh191@gmail.com'}</div>
                </div>
              )}
            </div>

            {/* Role Preset Switcher */}
            {!isCollapsed && (
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
            )}
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sidebar-signout-btn"
          onClick={logout}
          title="Sign Out"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign Out</span>}
        </motion.button>
      </div>
    </aside>
  );
};
