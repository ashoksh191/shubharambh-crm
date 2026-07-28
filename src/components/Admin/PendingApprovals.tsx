import React, { useState } from 'react';

interface PendingUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export const PendingApprovals: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    {
      id: 'usr-pend-01',
      username: 'harsh_patel',
      email: 'harsh.patel@shubharambh.com',
      fullName: 'Harsh Vardhan Patel',
      phone: '+91 98112 33445',
      role: 'SALES_EXECUTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-pend-02',
      username: 'kavita_singh',
      email: 'kavita.singh@shubharambh.com',
      fullName: 'Kavita Singh',
      phone: '+91 97788 99001',
      role: 'ASSOCIATE',
      createdAt: new Date(Date.now() - 3600 * 4000).toISOString(),
    },
  ]);

  const handleAction = (userId: string, action: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    alert(`User registration ${action}D successfully.`);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', color: '#f3f4f6' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff' }}>⏳ Pending User Registration Approvals</h2>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
          Review and approve or reject new account onboarding requests before granting CRM access.
        </p>
      </div>

      <div className="dash-card">
        {pendingUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            🎉 No pending user registration requests. All accounts reviewed!
          </p>
        ) : (
          <div className="session-table-container">
            <table className="session-table">
              <thead>
                <tr>
                  <th>Requested Date</th>
                  <th>Full Name</th>
                  <th>Username / Email</th>
                  <th>Requested Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((usr) => (
                  <tr key={usr.id}>
                    <td>{new Date(usr.createdAt).toLocaleString()}</td>
                    <td><strong style={{ color: '#ffffff' }}>{usr.fullName}</strong></td>
                    <td>
                      <div>{usr.username}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{usr.email}</div>
                    </td>
                    <td><span className="role-pill-badge">{usr.role}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleAction(usr.id, 'APPROVE')}
                          style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(usr.id, 'REJECT')}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
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
