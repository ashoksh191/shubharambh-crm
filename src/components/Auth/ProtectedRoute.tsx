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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e1a24', color: '#38bdf8' }}>
        <h3>Loading Security Engine...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppProvider>
        {showLoginModal ? (
          <LoginPage onBackToHome={() => setShowLoginModal(false)} />
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
