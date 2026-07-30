import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestAuthConsumer = () => {
  const { user, isAuthenticated, login, logout, twoFactorRequired } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-name">{user?.name || 'guest'}</span>
      <span data-testid="user-role">{user?.role || 'none'}</span>
      <span data-testid="2fa-status">{twoFactorRequired ? 'required' : 'not-required'}</span>
      
      <button onClick={() => login('admin@shubharambhgreencity.com', 'admin123')}>Login Admin</button>
      <button onClick={() => login('vikram.singh@gmail.com', 'leader123')}>Login Leader</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Authentication Module & AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders unauthenticated state initially when no saved user exists', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
      expect(screen.getByTestId('user-name').textContent).toBe('guest');
    });
  });

  it('authenticates user upon successful login credentials', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login Admin');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-role').textContent).toBe('SUPER_ADMIN');
    });
  });

  it('switches active user session when logging in', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Leader'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });
  });

  it('clears user session on logout', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Admin'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
      expect(screen.getByTestId('user-name').textContent).toBe('guest');
    });
  });
});
