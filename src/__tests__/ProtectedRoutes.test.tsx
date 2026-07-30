import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Protected Component Guard Simulation
const ProtectedAdminPanel = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div data-testid="redirect">redirect-to-auth</div>;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <div data-testid="access-denied">access-denied</div>;
  }

  return (
    <div>
      <div data-testid="admin-panel">welcome-admin</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Protected Routes & Authorization Guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated guest users to login/auth view when no user session exists', async () => {
    render(
      <AuthProvider>
        <ProtectedAdminPanel />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('redirect').textContent).toBe('redirect-to-auth');
    });
  });

  it('denies access to non-admin roles trying to view admin routes', async () => {
    localStorage.setItem(
      'sgc_auth_user',
      JSON.stringify({
        id: 'SGC-L001',
        name: 'Vikram Singh',
        role: 'ASSOCIATE',
        email: 'vikram.singh@gmail.com',
        permissions: ['plots:read'],
      })
    );

    render(
      <AuthProvider>
        <ProtectedAdminPanel />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('access-denied').textContent).toBe('access-denied');
    });
  });

  it('grants access to authorized admin user', async () => {
    localStorage.setItem(
      'sgc_auth_user',
      JSON.stringify({
        id: 'SGC-ADM01',
        name: 'Ramesh Sharma',
        role: 'ADMIN',
        email: 'admin@shubharambhgreencity.com',
        permissions: ['plots:read', 'plots:edit', 'users:manage'],
      })
    );

    render(
      <AuthProvider>
        <ProtectedAdminPanel />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-panel').textContent).toBe('welcome-admin');
    });
  });
});
