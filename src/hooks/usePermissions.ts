import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user, permissions, hasPermission } = useAuth();

  return {
    role: user?.role,
    permissions,
    hasPermission,
    canApprovePayments: hasPermission('payments:approve'),
    canDeletePlot: hasPermission('plots:delete'),
    canEditMasterData: hasPermission('master_data:edit'),
    canManageRoles: hasPermission('users:manage_roles'),
    canGenerateReceipt: hasPermission('receipts:generate'),
    canReadAuditLogs: hasPermission('audit_logs:read'),
  };
};
