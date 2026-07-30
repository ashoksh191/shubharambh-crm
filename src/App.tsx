import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import { Sidebar } from './components/Navigation/Sidebar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { AssociateDashboard } from './components/MLM/AssociateDashboard';
import { FinancialDashboard } from './components/Admin/FinancialDashboard';
import { USPShowcase } from './components/Public/USPShowcase';
import { UserProfileDashboard } from './components/Dashboard/UserProfileDashboard';
import { AuditLogViewer } from './components/Admin/AuditLogViewer';
import { PendingApprovals } from './components/Admin/PendingApprovals';
import { BookingFormModal } from './components/Booking/BookingFormModal';
import { ReceiptPDF } from './components/Documents/ReceiptPDF';
import { AgreementBond } from './components/Documents/AgreementBond';
import { QRVerificationModal } from './components/Documents/QRVerificationModal';
import { PhoneCall, MapPin, Sparkles } from 'lucide-react';
import type { Plot } from './types';
import './styles/App.css';

const MainLayout: React.FC = () => {
  const { plots } = useApp();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals'>('map');

  // Modal States
  const [selectedBookingPlot, setSelectedBookingPlot] = useState<Plot | null>(null);
  const [activeReceiptBookingId, setActiveReceiptBookingId] = useState<string | null>(null);
  const [activeBondBookingId, setActiveBondBookingId] = useState<string | null>(null);
  const [activeQRBookingId, setActiveQRBookingId] = useState<string | null>(null);

  // Stats
  const availableCount = plots.filter((p) => p.status === 'available').length;
  const bookedCount = plots.filter((p) => p.status === 'booked').length;
  const soldCount = plots.filter((p) => p.status === 'sold').length;

  const userName = authUser?.fullName || authUser?.username || 'Ashok Kumar';

  return (
    <div className="sidebar-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right Main Content Area */}
      <div className="main-viewport-container">
        {/* Top Header Banner (Matching SehatMitra / Screenshot UI) */}
        <header className="dashboard-welcome-banner">
          <div className="welcome-text-block">
            <div className="greeting-pill">
              <Sparkles size={14} /> Good Evening
            </div>
            <h2>{userName}</h2>
            <p>
              Welcome to Shubharambh Green City CRM. Review real-time 60-Bigha plot inventory, associate hierarchy, and payment status.
            </p>
          </div>

          <div className="welcome-action-buttons">
            <button className="primary-action-btn" onClick={() => setActiveTab('map')}>
              <MapPin size={16} /> Explore Map Grid →
            </button>
            <button
              className="secondary-call-btn"
              onClick={() => alert('Support Line: +91 98765 43210 (24x7 Helpline)')}
            >
              <PhoneCall size={16} /> Call Support
            </button>
          </div>
        </header>

        {/* Dashboard Summary Metric Cards */}
        <div className="dashboard-summary-cards">
          <div className="metric-card available">
            <div className="metric-label">Available Plots</div>
            <div className="metric-value">{availableCount}</div>
            <div className="metric-subtext">Ready for instant booking</div>
          </div>

          <div className="metric-card booked">
            <div className="metric-label">Booked Plots</div>
            <div className="metric-value">{bookedCount}</div>
            <div className="metric-subtext">Tokens / UTR verification</div>
          </div>

          <div className="metric-card sold">
            <div className="metric-label">Sold Out</div>
            <div className="metric-value">{soldCount}</div>
            <div className="metric-subtext">Registry & Bond executed</div>
          </div>

          <div className="metric-card total">
            <div className="metric-label">Total Inventory</div>
            <div className="metric-value">{plots.length}</div>
            <div className="metric-subtext">60-Bigha Lucknow layout</div>
          </div>
        </div>

        {/* Dynamic Module Content View */}
        <main className="main-content-body">
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
        </main>

        {/* Modals */}
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
