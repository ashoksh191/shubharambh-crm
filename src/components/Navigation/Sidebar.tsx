import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Layers,
  CalendarCheck,
  Users,
  DollarSign,
  CheckSquare,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { RoleGuard } from '../Auth/RoleGuard';

export type NavTabId = 'dashboard' | 'bookings' | 'customers' | 'inventory' | 'map' | 'finance' | 'approvals' | 'profile' | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  _onOpenQuickFeature?: (featureName: string) => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: string | null;
  permission?: any;
  color: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user: authUser, logout, switchRolePreset } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Shubharambh Green City');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts Listener ([\] Toggle Sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '\\' || (e.ctrlKey && e.key === 'b')) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#10b981' },
      { id: 'bookings', label: 'Bookings', icon: CalendarCheck, color: '#38bdf8' },
      { id: 'customers', label: 'Customers', icon: Users, color: '#a855f7' },
      { id: 'inventory', label: 'Plot Inventory', icon: Layers, color: '#0ea5e9' },
      { id: 'map', label: 'Layout Map', icon: Map, color: '#34d399' },
      { id: 'finance', label: 'Accounting & Payments', icon: DollarSign, permission: 'payments:approve', color: '#f59e0b' },
      { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare, badge: '2', permission: 'users:manage_roles', color: '#ef4444' },
      { id: 'profile', label: 'My Profile', icon: User, color: '#0284c7' },
      { id: 'settings', label: 'Settings', icon: Settings, color: '#64748b' },
    ];
  }, []);

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

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="sidebar-collapse-toggle-btn"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Expand Sidebar (\\)' : 'Collapse Sidebar (\\)'}
          aria-label="Toggle Sidebar Navigation"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={18} />}
          </motion.div>
        </motion.button>
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
                {['Shubharambh Green City', 'Sector A & B (Residential)', 'Sector C & D (Commercial)'].map((ws) => (
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

      {/* Main Navigation List */}
      <nav className="sidebar-navigation-list">
        {navItems.map((item) => {
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
                    color: isActive ? '#34d399' : undefined,
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))' : isHovered ? 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.4))' : 'none',
                    transition: 'all 200ms ease',
                  }}
                >
                  <IconComp size={isActive ? 20 : 18} />
                </div>

                {!isCollapsed && <span className="nav-link-label-text">{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span
                    className="nav-link-badge-pill"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>

              {/* Collapsed Mode Floating Tooltip */}
              {isCollapsed && isHovered && (
                <div className="collapsed-sidebar-tooltip">
                  <span>{item.label}</span>
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
            <div className="profile-avatar-box" title={authUser.fullName || authUser.username}>
              <span>{authUser.username?.charAt(0).toUpperCase() || 'A'}</span>
              <span className="profile-online-dot"></span>
            </div>

            {!isCollapsed && (
              <div className="profile-text-meta">
                <strong className="profile-user-name">{authUser.fullName || authUser.username || 'Ashok Kumar'}</strong>
                <span className="profile-user-role">{authUser.role}</span>
              </div>
            )}

            {!isCollapsed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sidebar-logout-btn-circular"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </motion.button>
            )}
          </div>
        )}

        {isCollapsed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sidebar-logout-btn-circular"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </motion.button>
        )}

        {!isCollapsed && authUser && (
          <div className="profile-role-selector-row">
            <Shield size={13} color="#34D399" />
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
      </div>
    </aside>
  );
};
