import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import { Navbar } from './components/Navigation/Navbar';
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
import type { Plot } from './types';
import './styles/App.css';

const MainLayout: React.FC = () => {
  const { plots } = useApp();
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

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Stats Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h2>Shubharambh Green City CRM</h2>
          <p>Advanced Enterprise Identity & Passkeys Security Infrastructure</p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <div className="value" style={{ color: '#6ee7b7' }}>{availableCount}</div>
            <div className="label">Available (Green)</div>
          </div>
          <div className="hero-stat-card">
            <div className="value" style={{ color: '#fcd34d' }}>{bookedCount}</div>
            <div className="label">Booked (Yellow)</div>
          </div>
          <div className="hero-stat-card">
            <div className="value" style={{ color: '#fca5a5' }}>{soldCount}</div>
            <div className="label">Sold Out (Red)</div>
          </div>
          <div className="hero-stat-card">
            <div className="value">{plots.length}</div>
            <div className="label">Total 60-Bigha Plots</div>
          </div>
        </div>
      </div>

      {/* Body View Content */}
      <main className="main-content">
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

      {/* Mobile Touch Bottom Navigation */}
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
