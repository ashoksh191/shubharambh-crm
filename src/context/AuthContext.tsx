import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, AppRole, Permission, ActiveSession, LoginHistoryLog } from '../types/auth';
import { apiClient } from '../services/apiClient';

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: [
    'plots:read',
    'plots:create',
    'plots:edit',
    'plots:delete',
    'bookings:create',
    'bookings:cancel',
    'payments:approve',
    'receipts:generate',
    'users:manage_roles',
    'users:create_admin',
    'master_data:edit',
    'audit_logs:read',
    'sessions:manage',
  ],
  ADMIN: [
    'plots:read',
    'plots:create',
    'plots:edit',
    'plots:delete',
    'bookings:create',
    'bookings:cancel',
    'receipts:generate',
    'master_data:edit',
    'audit_logs:read',
    'sessions:manage',
  ],
  SALES_MANAGER: [
    'plots:read',
    'plots:edit',
    'bookings:create',
    'bookings:cancel',
    'receipts:generate',
    'sessions:manage',
  ],
  SALES_EXECUTIVE: [
    'plots:read',
    'bookings:create',
    'sessions:manage',
  ],
  FINANCE: [
    'plots:read',
    'payments:approve',
    'receipts:generate',
    'sessions:manage',
  ],
  ASSOCIATE: [
    'plots:read',
    'bookings:create',
    'sessions:manage',
  ],
  CUSTOMER_SUPPORT: [
    'plots:read',
    'sessions:manage',
  ],
  VIEWER: [
    'plots:read',
    'sessions:manage',
  ],
};

const DEFAULT_USERS: Record<AppRole, AuthUser> = {
  SUPER_ADMIN: {
    id: 'user-superadmin-01',
    email: 'superadmin@shubharambh.com',
    username: 'superadmin',
    fullName: 'Vikramaditya Singh',
    phone: '+91 98765 43210',
    role: 'SUPER_ADMIN',
    twoFactorEnabled: true,
  },
  ADMIN: {
    id: 'user-admin-01',
    email: 'admin@shubharambh.com',
    username: 'admin',
    fullName: 'Rajesh Sharma',
    phone: '+91 98765 43211',
    role: 'ADMIN',
    twoFactorEnabled: false,
  },
  SALES_MANAGER: {
    id: 'user-sm-01',
    email: 'salesmanager@shubharambh.com',
    username: 'salesmanager',
    fullName: 'Ananya Verma',
    role: 'SALES_MANAGER',
    twoFactorEnabled: false,
  },
  SALES_EXECUTIVE: {
    id: 'user-se-01',
    email: 'salesexec@shubharambh.com',
    username: 'salesexec',
    fullName: 'Rahul Gupta',
    role: 'SALES_EXECUTIVE',
    twoFactorEnabled: false,
  },
  FINANCE: {
    id: 'user-fin-01',
    email: 'finance@shubharambh.com',
    username: 'finance',
    fullName: 'Priya Mehta',
    role: 'FINANCE',
    twoFactorEnabled: false,
  },
  ASSOCIATE: {
    id: 'user-assoc-01',
    email: 'associate@shubharambh.com',
    username: 'associate',
    fullName: 'Amit Kumar',
    role: 'ASSOCIATE',
    twoFactorEnabled: false,
  },
  CUSTOMER_SUPPORT: {
    id: 'user-supp-01',
    email: 'support@shubharambh.com',
    username: 'support',
    fullName: 'Neha Joshi',
    role: 'CUSTOMER_SUPPORT',
    twoFactorEnabled: false,
  },
  VIEWER: {
    id: 'user-view-01',
    email: 'viewer@shubharambh.com',
    username: 'viewer',
    fullName: 'Suresh Patel',
    role: 'VIEWER',
    twoFactorEnabled: false,
  },
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  hasPermission: (required: Permission | Permission[]) => boolean;
  login: (identifier: string, password: string, rememberMe?: boolean, twoFactorToken?: string) => Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  switchRolePreset: (role: AppRole) => void;
  sessions: ActiveSession[];
  loginHistory: LoginHistoryLog[];
  fetchSessionsAndHistory: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes Idle Timeout

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sgc_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS.SUPER_ADMIN; // Default logged in for demo
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryLog[]>([]);

  // Calculate user permissions based on active role
  const permissions = user ? ROLE_PERMISSIONS[user.role] || [] : [];

  const saveUserToState = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('sgc_auth_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('sgc_auth_user');
    }
  };

  // Check silent JWT refresh on boot if server is available
  useEffect(() => {
    const checkInitialAuth = async () => {
      setIsLoading(true);
      try {
        const refreshed = await apiClient.refreshTokenSilently();
        if (!refreshed && !localStorage.getItem('sgc_auth_user')) {
          // If no server and no saved local user, prompt login
          saveUserToState(null);
        }
      } catch (err) {
        // Keep default saved user if offline
      } finally {
        setIsLoading(false);
      }
    };
    checkInitialAuth();
  }, []);

  // Idle Timeout Engine (Requirement 25)
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn('⚠️ User inactive for 15 minutes. Automatically logging out for security.');
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer(); // Initialize timer

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user]);

  const hasPermission = useCallback(
    (required: Permission | Permission[]): boolean => {
      if (!user) return false;
      const userPerms = ROLE_PERMISSIONS[user.role] || [];
      if (Array.isArray(required)) {
        return required.every((p) => userPerms.includes(p));
      }
      return userPerms.includes(required);
    },
    [user]
  );

  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean = false,
    twoFactorToken?: string
  ) => {
    try {
      // 1. Try real server request first
      const res = await apiClient.login(identifier, password, rememberMe, twoFactorToken);
      if (res.requiresTwoFactor) {
        return { success: false, requiresTwoFactor: true, message: res.message };
      }

      if (res.success && res.user && res.accessToken) {
        apiClient.setAccessToken(res.accessToken);
        saveUserToState(res.user);
        return { success: true };
      }
    } catch (err: any) {
      // 2. Fallback local validation if server is not started yet
      const match = Object.values(DEFAULT_USERS).find(
        (u) => u.username === identifier || u.email === identifier
      );

      if (match) {
        if (password === 'Password@123456' || password.length >= 6) {
          saveUserToState(match);
          return { success: true };
        }
      }
      throw new Error(err.message || 'Invalid credentials.');
    }

    return { success: false, message: 'Authentication failed.' };
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      // Ignore
    } finally {
      apiClient.setAccessToken(null);
      saveUserToState(null);
    }
  };

  const logoutAll = async () => {
    try {
      await apiClient.logoutAll();
    } catch (e) {
      // Ignore
    } finally {
      apiClient.setAccessToken(null);
      saveUserToState(null);
    }
  };

  const switchRolePreset = (role: AppRole) => {
    const targetUser = DEFAULT_USERS[role];
    if (targetUser) {
      saveUserToState(targetUser);
    }
  };

  const fetchSessionsAndHistory = async () => {
    try {
      const [sessRes, histRes] = await Promise.all([
        apiClient.getActiveSessions(),
        apiClient.getLoginHistory(),
      ]);
      if (sessRes.success) setSessions(sessRes.sessions);
      if (histRes.success) setLoginHistory(histRes.history);
    } catch (e) {
      // Mock data fallback if offline
      setSessions([
        {
          id: 'sess-01',
          device: 'Windows PC (Chrome)',
          browser: 'Chrome 122.0',
          os: 'Windows 11',
          ipAddress: '192.168.1.45',
          country: 'India',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isCurrent: true,
        },
        {
          id: 'sess-02',
          device: 'iPhone 15 Pro (Safari)',
          browser: 'Safari 17.2',
          os: 'iOS 17',
          ipAddress: '106.210.44.12',
          country: 'India',
          createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          isCurrent: false,
        },
      ]);

      setLoginHistory([
        {
          id: 'hist-01',
          ipAddress: '192.168.1.45',
          browser: 'Chrome 122.0',
          os: 'Windows 11',
          device: 'Desktop',
          country: 'India',
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'hist-02',
          ipAddress: '49.36.12.90',
          browser: 'Firefox 120.0',
          os: 'Linux',
          device: 'Desktop',
          country: 'India',
          status: 'FAILED',
          failureReason: 'Invalid password. Attempt 1/5',
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
      ]);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await apiClient.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        permissions,
        hasPermission,
        login,
        logout,
        logoutAll,
        switchRolePreset,
        sessions,
        loginHistory,
        fetchSessionsAndHistory,
        revokeSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
