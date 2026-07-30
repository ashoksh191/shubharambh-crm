import type { AuthUser, ActiveSession, LoginHistoryLog, AuditLogEntry } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Singleton API Client for handling authenticated HTTP requests, CSRF protection,
 * automatic token refreshing, and server communication.
 */
class ApiClient {
  private accessToken: string | null = null;

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private getCsrfToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    return match ? match[2] : null;
  }

  /**
   * Executes HTTP request with Authorization and CSRF tokens attached.
   */
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Send HTTP-Only Cookies
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshed = await this.refreshTokenSilently();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
        if (retryResponse.ok) return await retryResponse.json();
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data as T;
  }

  /**
   * Refreshes access token silently using HTTP-Only refresh cookie.
   */
  public async refreshTokenSilently(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          this.setAccessToken(data.accessToken);
          return true;
        }
      }
    } catch (_err) {
      this.setAccessToken(null);
    }
    return false;
  }

  // Auth endpoints
  public async register(payload: Record<string, any>) {
    return this.request<{ success: boolean; user: AuthUser; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async login(identifier: string, password: string, rememberMe: boolean = false, twoFactorToken?: string) {
    return this.request<{
      success: boolean;
      requiresTwoFactor?: boolean;
      userId?: string;
      accessToken?: string;
      user?: AuthUser;
      session?: ActiveSession;
      message?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, rememberMe, twoFactorToken }),
    });
  }

  public async logout() {
    return this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  }

  public async logoutAll() {
    return this.request<{ success: boolean }>('/auth/logout-all', { method: 'POST' });
  }

  public async changePassword(oldPassword: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  public async setup2FA() {
    return this.request<{ secret: string; qrCodeDataUrl: string; backupCodes: string[] }>(
      '/auth/2fa/setup',
      { method: 'POST' }
    );
  }

  public async enable2FA(code: string) {
    return this.request<{ success: boolean; message: string }>('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Sessions endpoints
  public async getActiveSessions() {
    return this.request<{ success: boolean; sessions: ActiveSession[] }>('/sessions/active');
  }

  public async revokeSession(sessionId: string) {
    return this.request<{ success: boolean; message: string }>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  public async getLoginHistory() {
    return this.request<{ success: boolean; history: LoginHistoryLog[] }>('/sessions/history');
  }

  // Audit Logs
  public async getAuditLogs(page: number = 1) {
    return this.request<{ success: boolean; logs: AuditLogEntry[]; pagination: Record<string, any> }>(
      `/audit?page=${page}`
    );
  }
}

export const apiClient = new ApiClient();
