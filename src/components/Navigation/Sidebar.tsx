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
  ChevronDown,
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
  _onOpenQuickFeature?: (featureName: string) => void;
}

interface NavItem {
  id: 'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals';
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge: string | null;
  permission?: any;
  color: string;
  key: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user: authUser, logout, switchRolePreset } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Shubharambh 60 Bigha');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

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
      { id: 'mlm', label: 'MLM Associate Hierarchy', icon: Users, badge: 'BETA', color: '#38bdf8', key: 'A' },
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
      className={`app-sidebar-redesign ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '84px' : '300px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header & Brand Logo */}
      <div className="sidebar-top-brand">
        <div className="sidebar-brand-logo-container">
          <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" className="sidebar-brand-img" />
          <span className="sidebar-online-indicator-dot" title="Server Connection Active"></span>
        </div>

        {!isCollapsed && (
          <div className="sidebar-brand-text-block">
            <h2 className="sidebar-brand-main-title">SHUBHARAMBH</h2>
            <span className="sidebar-brand-sub-title">Green City Township</span>
          </div>
        )}

        <button
          className="sidebar-collapse-toggle-btn"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Expand Sidebar (\\)' : 'Collapse Sidebar (\\)'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="sidebar-workspace-container" ref={workspaceRef}>
          <button
            className="workspace-switcher-card"
            onClick={() => setShowWorkspaceMenu((prev) => !prev)}
          >
            <div className="workspace-icon-box">
              <Layers size={15} color="#0EA5E9" />
            </div>
            <div className="workspace-info">
              <span className="workspace-caption">CURRENT WORKSPACE</span>
              <strong className="workspace-current-name">{activeWorkspace}</strong>
            </div>
            <ChevronDown size={14} className={`chevron-arrow ${showWorkspaceMenu ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="workspace-dropdown-card"
              >
                {['Shubharambh 60 Bigha', 'Kanpur Highway Phase-II', 'Green Valley Extension'].map((ws) => (
                  <div
                    key={ws}
                    className={`workspace-dropdown-item ${activeWorkspace === ws ? 'active' : ''}`}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <ChevronRight size={14} color="#0EA5E9" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Rounded Search Input Box */}
      {!isCollapsed && (
        <div className="sidebar-search-box-container">
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search-input"
          />
          <kbd className="sidebar-search-shortcut-key">⌘ K</kbd>
        </div>
      )}

      {/* Main Navigation List */}
      <nav className="sidebar-navigation-list">
        {filteredNavItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          const buttonElement = (
            <div key={item.id} style={{ position: 'relative' }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`sidebar-nav-link-btn ${isActive ? 'active-gradient-pill' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {/* Active Left Indicator Bar */}
                {isActive && <div className="active-left-indicator-bar"></div>}

                <div
                  className="nav-link-icon-box"
                  style={{
                    transform: isHovered && !isActive ? 'rotate(5deg)' : 'none',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <IconComp size={isActive ? 20 : 18} />
                </div>

                {!isCollapsed && <span className="nav-link-label-text">{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span
                    className="nav-link-badge-pill"
                    style={{
                      background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.15)' : item.badge === 'NEW' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                      color: item.badge === 'LIVE' ? '#10B981' : item.badge === 'NEW' ? '#A855F7' : '#0EA5E9',
                      border: `1px solid ${item.badge === 'LIVE' ? '#10B981' : item.badge === 'NEW' ? '#A855F7' : '#0EA5E9'}40`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {!isCollapsed && <kbd className="nav-link-shortcut-badge">{item.key}</kbd>}
              </motion.button>

              {/* Collapsed Mode Floating Tooltip */}
              {isCollapsed && isHovered && (
                <div className="collapsed-sidebar-tooltip">
                  <span>{item.label}</span>
                  <kbd>[{item.key}]</kbd>
                </div>
              )}
            </div>
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
      </nav>

      {/* Bottom Profile Card Footer */}
      <div className="sidebar-bottom-profile-card">
        {authUser && (
          <div className="profile-user-info-row">
            <div className="profile-avatar-box">
              <span>{authUser.username?.charAt(0).toUpperCase() || 'A'}</span>
              <span className="profile-online-dot"></span>
            </div>

            {!isCollapsed && (
              <div className="profile-text-meta">
                <strong className="profile-user-name">{authUser.fullName || authUser.username || 'Ashok Kumar'}</strong>
                <span className="profile-user-role">{authUser.role}</span>
              </div>
            )}
          </div>
        )}

        {!isCollapsed && authUser && (
          <div className="profile-role-selector-row">
            <Shield size={13} color="#F59E0B" />
            <select
              value={authUser.role}
              onChange={(e) => switchRolePreset(e.target.value as any)}
              className="profile-role-select"
            >
              <option value="SUPER_ADMIN">👑 Super Admin</option>
              <option value="ADMIN">🛡️ Admin</option>
              <option value="SALES_MANAGER">💼 Sales Manager</option>
              <option value="FINANCE">💰 Finance</option>
              <option value="ASSOCIATE">🤝 Associate</option>
            </select>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sidebar-logout-btn"
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
