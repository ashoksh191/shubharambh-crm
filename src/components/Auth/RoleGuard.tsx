import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Permission, AppRole } from '../../types/auth';

interface RoleGuardProps {
  children: ReactNode;
  requiredPermissions?: Permission | Permission[];
  allowedRoles?: AppRole[];
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredPermissions,
  allowedRoles,
  fallback = null,
}) => {
  const { user, hasPermission } = useAuth();

  if (!user) return <>{fallback}</>;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
