import React, { useState, useMemo, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import { Sidebar } from './components/Navigation/Sidebar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { PhoneCall, MapPin, Sparkles, Loader2, CheckCircle2, Clock, Ban, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plot } from './types';
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

const ComponentFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#0284c7', gap: '10px' }}>
    <Loader2 className="animate-spin" size={24} />
    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading Enterprise Module...</span>
  </div>
);

const MainLayout: React.FC = () => {
  const { plots } = useApp();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals'>('map');

  // Modal States
  const [selectedBookingPlot, setSelectedBookingPlot] = useState<Plot | null>(null);
  const [activeReceiptBookingId, setActiveReceiptBookingId] = useState<string | null>(null);
  const [activeBondBookingId, setActiveBondBookingId] = useState<string | null>(null);
  const [activeQRBookingId, setActiveQRBookingId] = useState<string | null>(null);

  // Memoized Inventory Metrics
  const { availableCount, bookedCount, soldCount } = useMemo(() => {
    let available = 0;
    let booked = 0;
    let sold = 0;
    for (let i = 0; i < plots.length; i++) {
      const status = plots[i].status;
      if (status === 'available') available++;
      else if (status === 'booked') booked++;
      else if (status === 'sold') sold++;
    }
    return { availableCount: available, bookedCount: booked, soldCount: sold };
  }, [plots]);

  const userName = authUser?.fullName || authUser?.username || 'Ashok Kumar';

  return (
    <div className="sidebar-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right Main Content Area */}
      <div className="main-viewport-container">
        {/* Top Header Banner */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="dashboard-welcome-banner"
        >
          <div className="welcome-text-block">
            <div className="greeting-pill">
              <Sparkles size={14} /> Live Enterprise CRM Command Center
            </div>
            <h2>Welcome back, {userName} 👋</h2>
            <p>
              Real-time 60-Bigha township layout inventory, associate tree hierarchy, and server-authoritative OCC booking engine.
            </p>
          </div>

          <div className="welcome-action-buttons">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="primary-action-btn"
              onClick={() => setActiveTab('map')}
            >
              <MapPin size={16} /> Explore Map Grid →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="secondary-call-btn"
              onClick={() => alert('Support Line: +91 98765 43210 (24x7 Helpline)')}
            >
              <PhoneCall size={16} /> Call Support
            </motion.button>
          </div>
        </motion.header>

        {/* Dashboard Summary Metric Cards with Framer Motion Stagger */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="dashboard-summary-cards"
        >
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card available"
          >
            <div className="metric-header-row">
              <div className="metric-label">Available Plots</div>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div className="metric-value">{availableCount}</div>
            <div className="metric-subtext">Ready for instant booking</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card booked"
          >
            <div className="metric-header-row">
              <div className="metric-label">Booked Plots</div>
              <Clock size={18} color="#f59e0b" />
            </div>
            <div className="metric-value">{bookedCount}</div>
            <div className="metric-subtext">Tokens / UTR verification</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card sold"
          >
            <div className="metric-header-row">
              <div className="metric-label">Sold Out</div>
              <Ban size={18} color="#ef4444" />
            </div>
            <div className="metric-value">{soldCount}</div>
            <div className="metric-subtext">Registry & Bond executed</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="metric-card total"
          >
            <div className="metric-header-row">
              <div className="metric-label">Total Inventory</div>
              <Layers size={18} color="#0284c7" />
            </div>
            <div className="metric-value">{plots.length}</div>
            <div className="metric-subtext">60-Bigha Lucknow layout</div>
          </motion.div>
        </motion.div>

        {/* Dynamic Module Content View */}
        <main className="main-content-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
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
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#fca5a5' }}>
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
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#fca5a5' }}>
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
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#fca5a5' }}>
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

        {/* Lazy Loaded Modals */}
        <Suspense fallback={null}>
          {selectedBookingPlot && (
            <BookingFormModal
              plot={selectedBookingPlot}
              onClose={() => setSelectedBookingPlot(null)}
              onSuccess={(bId) => {
                setSelectedBookingPlot(null);
                setActiveReceiptBookingId(bId);
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
