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

          {/* Clean High-Performance Sign In Modal Popup */}
          {showLoginModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(11, 15, 25, 0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
                {/* Close Button */}
                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    position: 'absolute',
                    top: '-42px',
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100,
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
