export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'FINANCE'
  | 'ASSOCIATE'
  | 'CUSTOMER_SUPPORT'
  | 'VIEWER';

export type Permission =
  | 'plots:read'
  | 'plots:create'
  | 'plots:edit'
  | 'plots:delete'
  | 'bookings:create'
  | 'bookings:cancel'
  | 'payments:approve'
  | 'receipts:generate'
  | 'users:manage_roles'
  | 'users:create_admin'
  | 'master_data:edit'
  | 'audit_logs:read'
  | 'sessions:manage';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  role: AppRole;
  twoFactorEnabled: boolean;
  emailVerified?: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface LoginHistoryLog {
  id: string;
  ipAddress: string;
  browser: string;
  os: string;
  device: string;
  country: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  username: string;
  role: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  metadata?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}
