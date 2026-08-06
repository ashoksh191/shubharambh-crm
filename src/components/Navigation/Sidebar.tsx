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
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#D4AF37' },
      { id: 'bookings', label: 'Bookings', icon: CalendarCheck, color: '#D4AF37' },
      { id: 'customers', label: 'Customers', icon: Users, color: '#D4AF37' },
      { id: 'inventory', label: 'Plot Inventory', icon: Layers, color: '#D4AF37' },
      { id: 'map', label: 'Layout Map', icon: Map, color: '#D4AF37' },
      { id: 'finance', label: 'Accounting & Payments', icon: DollarSign, permission: 'payments:approve', color: '#D4AF37' },
      { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare, badge: '2', permission: 'users:manage_roles', color: '#D4AF37' },
      { id: 'profile', label: 'My Profile', icon: User, color: '#D4AF37' },
      { id: 'settings', label: 'Settings', icon: Settings, color: '#D4AF37' },
    ];
  }, []);

  return (
    <aside
      className={`app-sidebar-redesign ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '84px' : '300px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(7, 41, 31, 0.94)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(212, 175, 55, 0.25)',
      }}
    >
      {/* Top Header & Brand Logo */}
      <div className="sidebar-top-brand" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div className="sidebar-brand-logo-container" style={{ border: '1px solid #D4AF37', background: '#07291F' }}>
          <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" className="sidebar-brand-img" />
          <span className="sidebar-online-indicator-dot" style={{ background: '#D4AF37', borderColor: '#07291F', boxShadow: 'none' }} title="Server Connection Active"></span>
        </div>

        {!isCollapsed && (
          <div className="sidebar-brand-text-block">
            <h2 className="sidebar-brand-main-title" style={{ background: 'linear-gradient(110deg, #FFFFFF 0%, #E8C96A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SHUBHARAMBH
            </h2>
            <span className="sidebar-brand-sub-title" style={{ color: '#E8C96A', fontWeight: 600 }}>Green City Township</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="sidebar-collapse-toggle-btn"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Expand Sidebar (\\)' : 'Collapse Sidebar (\\)'}
          aria-label="Toggle Sidebar Navigation"
          style={{ color: '#E8C96A', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)' }}
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
            style={{ background: 'rgba(11, 61, 46, 0.6)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '14px' }}
          >
            <div className="workspace-icon-box" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#E8C96A' }}>
              <Layers size={15} color="#E8C96A" />
            </div>
            <div className="workspace-info">
              <span className="workspace-caption" style={{ color: '#A3B1AC' }}>TOWNSHIP CRM</span>
              <strong className="workspace-current-name" style={{ color: '#F8F7F3' }}>{activeWorkspace}</strong>
            </div>
            <ChevronDown size={14} className={`chevron-arrow ${showWorkspaceMenu ? 'open' : ''}`} style={{ color: '#E8C96A' }} />
          </button>

          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="workspace-dropdown-card"
                style={{ background: '#07291F', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px' }}
              >
                {['Shubharambh Green City', 'Sector A & B (Residential)', 'Sector C & D (Commercial)'].map((ws) => (
                  <div
                    key={ws}
                    className={`workspace-dropdown-item ${activeWorkspace === ws ? 'active' : ''}`}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    style={{ color: activeWorkspace === ws ? '#E8C96A' : '#F8F7F3' }}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <ChevronRight size={14} color="#D4AF37" />}
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
                style={{
                  background: isActive ? 'rgba(11, 61, 46, 0.9)' : isHovered ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                  borderRadius: '14px',
                  color: isActive ? '#E8C96A' : '#F8F7F3',
                }}
              >
                {/* Active Left Indicator Bar */}
                {isActive && <div className="active-left-indicator-bar" style={{ background: '#D4AF37', boxShadow: 'none' }}></div>}

                <div
                  className="nav-link-icon-box"
                  style={{
                    color: isActive ? '#E8C96A' : isHovered ? '#D4AF37' : '#A3B1AC',
                    transition: 'all 200ms ease',
                  }}
                >
                  <IconComp size={isActive ? 20 : 18} />
                </div>

                {!isCollapsed && <span className="nav-link-label-text" style={{ color: isActive ? '#FFFFFF' : undefined }}>{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span
                    className="nav-link-badge-pill"
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#E8C96A',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
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

      {/* Role Switcher */}
      {!isCollapsed && (
        <div style={{ padding: '8px', background: 'rgba(11, 61, 46, 0.4)', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="#D4AF37" />
            <span style={{ fontSize: '0.72rem', color: '#E8C96A', fontWeight: 700 }}>ROLE: {authUser?.role}</span>
          </div>

          {(authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN') && (
            <select
              value={authUser.role}
              onChange={(e) => switchRolePreset(e.target.value as any)}
              style={{ background: '#07291F', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#F8F7F3', fontSize: '0.7rem', borderRadius: '8px', padding: '2px 4px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SALES_EXECUTIVE">SALES</option>
              <option value="ACCOUNTANT">FINANCE</option>
            </select>
          )}
        </div>
      )}

      {/* User Footer Profile & Logout */}
      <div className="sidebar-user-footer-card" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '12px' }}>
        <div className="sidebar-user-avatar-circle" style={{ background: '#07291F', border: '1px solid #D4AF37', color: '#E8C96A' }}>
          {(authUser?.name || 'V')[0]}
        </div>

        {!isCollapsed && (
          <div className="sidebar-user-details">
            <strong className="sidebar-user-name" style={{ color: '#F8F7F3' }}>{authUser?.name || 'Vikramaditya'}</strong>
            <span className="sidebar-user-role-label" style={{ color: '#E8C96A' }}>{authUser?.email || 'sales@shubharambh.com'}</span>
          </div>
        )}

        <button className="sidebar-logout-btn" onClick={logout} title="Sign Out" style={{ color: '#A3B1AC' }}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
