import React, { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { LandingPage } from '../Public/LandingPage';
import { AppProvider } from '../../context/AppContext';

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
        {showLoginModal ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 9999,
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                border: '1px solid #ef4444',
                padding: '10px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              }}
            >
              ← Back to Landing Page
            </button>
            <LoginPage />
          </div>
        ) : (
          <LandingPage
            onNavigateToMap={() => setShowLoginModal(true)}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        )}
      </AppProvider>
    );
  }

  return <>{children}</>;
};
