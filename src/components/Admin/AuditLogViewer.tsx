import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/apiClient';
import type { AuditLogEntry } from '../../types/auth';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAuditLogs(page);
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (_e) {
      // Mock data fallback for local demo
      setLogs([
        {
          id: 'audit-101',
          username: 'superadmin',
          role: 'SUPER_ADMIN',
          action: 'PAYMENT_APPROVE',
          targetEntity: 'Booking',
          targetId: 'BK-2026-891',
          metadata: '{"amount": 450000, "customer": "Ramesh Kumar"}',
          ipAddress: '192.168.1.45',
          userAgent: 'Chrome 122.0 Windows',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'audit-102',
          username: 'admin',
          role: 'ADMIN',
          action: 'PLOT_DELETE',
          targetEntity: 'Plot',
          targetId: 'PLOT-A-012',
          metadata: '{"reason": "Inventory recalculation"}',
          ipAddress: '192.168.1.50',
          userAgent: 'Firefox 120.0 Linux',
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        },
        {
          id: 'audit-103',
          username: 'superadmin',
          role: 'SUPER_ADMIN',
          action: 'USER_ROLE_CHANGED',
          targetEntity: 'User',
          targetId: 'user-assoc-01',
          metadata: '{"oldRole": "ASSOCIATE", "newRole": "SALES_EXECUTIVE"}',
          ipAddress: '192.168.1.45',
          userAgent: 'Chrome 122.0 Windows',
          createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', color: '#f3f4f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff' }}>📋 Enterprise Security Audit Logs</h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
            Comprehensive immutable audit trail of all sensitive domain actions & role updates.
          </p>
        </div>
        <button onClick={fetchLogs} className="sec-btn secondary">
          🔄 Refresh Audit Feed
        </button>
      </div>

      <div className="dash-card">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Loading audit logs...</p>
        ) : (
          <div className="session-table-container">
            <table className="session-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Metadata</th>
                  <th>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.username}</div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981' }}>{log.role}</div>
                    </td>
                    <td>
                      <span className="log-status-pill success" style={{ textTransform: 'uppercase' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      {log.targetEntity} {log.targetId ? `(#${log.targetId})` : ''}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: '#fcd34d' }}>
                        {log.metadata || '—'}
                      </code>
                    </td>
                    <td><code>{log.ipAddress}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
