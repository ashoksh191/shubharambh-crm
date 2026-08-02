import React, { useState, useMemo, useEffect, lazy, Suspense, memo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import { Sidebar } from './components/Navigation/Sidebar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { CommandPalette } from './components/UI/CommandPalette';
import { ToastContainer, type ToastMessage } from './components/UI/ToastContainer';
import {
  PhoneCall,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Ban,
  Layers,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plot } from './types';
import type { EnhancedPlot } from './types/propertyMap';
import './styles/App.css';

// Lazy Loaded Heavy Modules & Views
const AssociateDashboard = lazy(() =>
  import('./components/MLM/AssociateDashboard').then((m) => ({ default: m.AssociateDashboard }))
);
const FinancialDashboard = lazy(() =>
  import('./components/Admin/FinancialDashboard').then((m) => ({ default: m.FinancialDashboard }))
);
const USPShowcase = lazy(() =>
  import('./components/Public/USPShowcase').then((m) => ({ default: m.USPShowcase }))
);
const UserProfileDashboard = lazy(() =>
  import('./components/Dashboard/UserProfileDashboard').then((m) => ({ default: m.UserProfileDashboard }))
);
const AuditLogViewer = lazy(() =>
  import('./components/Admin/AuditLogViewer').then((m) => ({ default: m.AuditLogViewer }))
);
const PendingApprovals = lazy(() =>
  import('./components/Admin/PendingApprovals').then((m) => ({ default: m.PendingApprovals }))
);
const BookingFormModal = lazy(() =>
  import('./components/Booking/BookingFormModal').then((m) => ({ default: m.BookingFormModal }))
);
const ReceiptPDF = lazy(() =>
  import('./components/Documents/ReceiptPDF').then((m) => ({ default: m.ReceiptPDF }))
);
const AgreementBond = lazy(() =>
  import('./components/Documents/AgreementBond').then((m) => ({ default: m.AgreementBond }))
);
const QRVerificationModal = lazy(() =>
  import('./components/Documents/QRVerificationModal').then((m) => ({ default: m.QRVerificationModal }))
);

const ComponentFallback = memo(() => (
  <div className="component-fallback-container">
    <Loader2 className="animate-spin" size={26} color="#0284c7" />
    <span>Loading Enterprise Module...</span>
  </div>
));
ComponentFallback.displayName = 'ComponentFallback';

// Live Animated Counter Helper Component
const AnimatedCount: React.FC<{ value: number; suffix?: string }> = memo(({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 600;
    const stepTime = 16;
    const steps = Math.ceil(duration / stepTime);
    const increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
});
AnimatedCount.displayName = 'AnimatedCount';

const MainLayout: React.FC = () => {
  const { plots } = useApp();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals'>('map');

  // Command Palette & Toast System States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [selectedBookingPlot, setSelectedBookingPlot] = useState<Plot | null>(null);
  const [activeReceiptBookingId, setActiveReceiptBookingId] = useState<string | null>(null);
  const [activeBondBookingId, setActiveBondBookingId] = useState<string | null>(null);
  const [activeQRBookingId, setActiveQRBookingId] = useState<string | null>(null);

  // Global Ctrl + K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Memoized Inventory Metrics
  const { availableCount, bookedCount, soldCount, occupancyRate } = useMemo(() => {
    let available = 0;
    let booked = 0;
    let sold = 0;
    for (let i = 0; i < plots.length; i++) {
      const status = plots[i].status;
      if (status === 'available') available++;
      else if (status === 'booked') booked++;
      else if (status === 'sold') sold++;
    }
    const total = plots.length || 1;
    const rate = Math.round(((booked + sold) / total) * 100);
    return { availableCount: available, bookedCount: booked, soldCount: sold, occupancyRate: rate };
  }, [plots]);

  const userName = authUser?.fullName || authUser?.username || 'Ashok Kumar';

  // Mock Recent Activity Feed for Enterprise Timeline
  const recentActivities = useMemo(() => {
    return [
      { id: '1', title: 'Plot 104 Booked', desc: 'Advance token ₹50,000 received via Bank UTR', time: '10 mins ago', type: 'booking', icon: CheckCircle2, color: '#10b981' },
      { id: '2', title: 'UTR Ref #849204 Verified', desc: 'Accountant approved customer installment payment', time: '42 mins ago', type: 'finance', icon: TrendingUp, color: '#0284c7' },
      { id: '3', title: 'New Associate Registration', desc: 'Level-2 Associate assigned to Sales Manager Desk', time: '2 hours ago', type: 'user', icon: ShieldCheck, color: '#f59e0b' },
    ];
  }, []);

  return (
    <div className="sidebar-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right Main Viewport */}
      <div className="main-viewport-container">
        {/* Top Enterprise Hero Header Banner */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="dashboard-welcome-banner"
        >
          <div className="welcome-text-block">
            <div className="greeting-pill">
              <span className="live-status-dot"></span>
              <Sparkles size={14} /> Shubharambh Command Center v1.0
            </div>
            <h2>Welcome back, {userName} 👋</h2>
            <p>
              Real-time 60-Bigha township layout inventory, associate tree hierarchy, and server-authoritative OCC booking engine.
            </p>
          </div>

          <div className="welcome-action-buttons">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="primary-action-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Search size={16} /> Quick Search (Ctrl+K)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="secondary-call-btn"
              onClick={() => {
                addToast('info', 'Helpline Active', 'Connecting to 24x7 Customer Support Hotline...');
                alert('Support Line: +91 98765 43210 (24x7 Helpline)');
              }}
            >
              <PhoneCall size={16} /> Call Support
            </motion.button>
          </div>
        </motion.header>

        {/* Dashboard Summary Metric Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="dashboard-summary-cards"
        >
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card available"
          >
            <div className="metric-header-row">
              <span className="metric-label">Available Plots</span>
              <div className="metric-icon-badge green">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="metric-value">
              <AnimatedCount value={availableCount} />
            </div>
            <div className="metric-footer-row">
              <span className="trend-pill positive">
                <ArrowUpRight size={12} /> Ready for Booking
              </span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card booked"
          >
            <div className="metric-header-row">
              <span className="metric-label">Booked Plots</span>
              <div className="metric-icon-badge amber">
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value">
              <AnimatedCount value={bookedCount} />
            </div>
            <div className="metric-footer-row">
              <span className="trend-pill warning">
                <Clock size={12} /> Tokens / UTR Verification
              </span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card sold"
          >
            <div className="metric-header-row">
              <span className="metric-label">Sold Out</span>
              <div className="metric-icon-badge red">
                <Ban size={18} />
              </div>
            </div>
            <div className="metric-value">
              <AnimatedCount value={soldCount} />
            </div>
            <div className="metric-footer-row">
              <span className="trend-pill danger">
                <ShieldCheck size={12} /> Registry Executed
              </span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card total"
          >
            <div className="metric-header-row">
              <span className="metric-label">Total Inventory</span>
              <div className="metric-icon-badge blue">
                <Layers size={18} />
              </div>
            </div>
            <div className="metric-value">
              <AnimatedCount value={plots.length} />
            </div>
            <div className="metric-footer-row">
              <span className="trend-pill info">
                <Activity size={12} /> {occupancyRate}% Township Booked
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enterprise Widgets Bar (Sales Velocity Progress & Live Activity Feed) */}
        {activeTab === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="enterprise-widgets-row"
          >
            {/* Sales Velocity Overview Widget */}
            <div className="widget-card glass">
              <div className="widget-header">
                <div className="widget-title">
                  <TrendingUp size={18} color="#0284c7" />
                  <span>Township Inventory Sales Velocity</span>
                </div>
                <span className="widget-badge">{occupancyRate}% Complete</span>
              </div>
              <div className="progress-bar-track">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${occupancyRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="widget-legend-row">
                <span className="legend-item"><span className="dot green"></span> Available ({availableCount})</span>
                <span className="legend-item"><span className="dot amber"></span> Booked ({bookedCount})</span>
                <span className="legend-item"><span className="dot red"></span> Sold ({soldCount})</span>
              </div>
            </div>

            {/* Live Activity Feed Widget */}
            <div className="widget-card glass">
              <div className="widget-header">
                <div className="widget-title">
                  <Zap size={18} color="#f59e0b" />
                  <span>Live Audit & Transaction Activity</span>
                </div>
                <span className="widget-badge pulse">Realtime Sync</span>
              </div>
              <div className="activity-timeline-list">
                {recentActivities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div key={act.id} className="activity-timeline-item">
                      <div className="activity-icon-bubble" style={{ background: `${act.color}15`, color: act.color }}>
                        <IconComp size={14} />
                      </div>
                      <div className="activity-details">
                        <div className="activity-title-row">
                          <strong>{act.title}</strong>
                          <span className="activity-time">{act.time}</span>
                        </div>
                        <span className="activity-desc">{act.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Module Content View */}
        <main className="main-content-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <Suspense fallback={<ComponentFallback />}>
                {activeTab === 'map' && (
                  <InteractiveMap
                    onOpenBooking={(plot) => setSelectedBookingPlot(plot)}
                    onOpenReceipt={(bId) => setActiveReceiptBookingId(bId)}
                    onOpenBond={(bId) => setActiveBondBookingId(bId)}
                  />
                )}

                {activeTab === 'mlm' && <AssociateDashboard />}

                {activeTab === 'finance' && (
                  <RoleGuard
                    requiredPermissions="payments:approve"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>You need the <strong>FINANCE</strong> or <strong>SUPER_ADMIN</strong> role to view payment approvals & financial dashboards.</p>
                      </div>
                    }
                  >
                    <FinancialDashboard />
                  </RoleGuard>
                )}

                {activeTab === 'usps' && <USPShowcase />}

                {activeTab === 'profile' && <UserProfileDashboard />}

                {activeTab === 'approvals' && (
                  <RoleGuard
                    requiredPermissions="users:manage_roles"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>Only <strong>ADMIN</strong> and <strong>SUPER_ADMIN</strong> roles can review pending user registration requests.</p>
                      </div>
                    }
                  >
                    <PendingApprovals />
                  </RoleGuard>
                )}

                {activeTab === 'audit' && (
                  <RoleGuard
                    requiredPermissions="audit_logs:read"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>Only <strong>ADMIN</strong> and <strong>SUPER_ADMIN</strong> roles can inspect enterprise security audit trails.</p>
                      </div>
                    }
                  >
                    <AuditLogViewer />
                  </RoleGuard>
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            addToast('success', 'Navigation', `Switched view to ${tab.toUpperCase()}`);
          }}
          onSelectPlot={(plot: EnhancedPlot) => {
            setSelectedBookingPlot(plot);
            addToast('info', 'Plot Selected', `Inspecting Plot ${plot.plotNo} (${plot.block})`);
          }}
        />

        {/* Global Toast System */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Lazy Loaded Modals */}
        <Suspense fallback={null}>
          {selectedBookingPlot && (
            <BookingFormModal
              plot={selectedBookingPlot}
              onClose={() => setSelectedBookingPlot(null)}
              onSuccess={(bId) => {
                setSelectedBookingPlot(null);
                setActiveReceiptBookingId(bId);
                addToast('success', 'Booking Confirmed', `Booking ${bId} created successfully! Token verified.`);
              }}
            />
          )}

          {activeReceiptBookingId && (
            <ReceiptPDF
              bookingId={activeReceiptBookingId}
              onClose={() => setActiveReceiptBookingId(null)}
              onOpenVerification={(bId) => setActiveQRBookingId(bId)}
            />
          )}

          {activeBondBookingId && (
            <AgreementBond
              bookingId={activeBondBookingId}
              onClose={() => setActiveBondBookingId(null)}
            />
          )}

          {activeQRBookingId && (
            <QRVerificationModal
              bookingId={activeQRBookingId}
              onClose={() => setActiveQRBookingId(null)}
            />
          )}
        </Suspense>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            <button
              className={`mobile-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <span style={{ fontSize: '1.2rem' }}>🗺️</span>
              <span>Map Grid</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
              onClick={() => setActiveTab('mlm')}
            >
              <span style={{ fontSize: '1.2rem' }}>👥</span>
              <span>MLM Tree</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span style={{ fontSize: '1.2rem' }}>👤</span>
              <span>Profile</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'usps' ? 'active' : ''}`}
              onClick={() => setActiveTab('usps')}
            >
              <span style={{ fontSize: '1.2rem' }}>🌟</span>
              <span>USPs</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            © 2026 <span>Shubharambh Green City</span> Advanced Enterprise Security System. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
