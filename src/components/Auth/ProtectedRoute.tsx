import React, { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { LandingPage } from '../Public/LandingPage';
import { AppProvider } from '../../context/AppContext';
import { X } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#10b981' }}>
        <h3>Loading Security Engine...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppProvider>
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          {/* Main Single Landing Page */}
          <LandingPage
            onNavigateToMap={() => setShowLoginModal(true)}
            onOpenLogin={() => setShowLoginModal(true)}
          />

          {/* Clean Login Modal Popup */}
          {showLoginModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(11, 15, 25, 0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflowY: 'auto',
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                {/* Close Button */}
                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    position: 'absolute',
                    top: '-45px',
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Close Sign In Modal"
                >
                  <X size={20} />
                </button>

                <LoginPage />
              </div>
            </div>
          )}
        </div>
      </AppProvider>
    );
  }

  return <>{children}</>;
};
