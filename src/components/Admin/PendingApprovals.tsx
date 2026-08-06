import React, { useState } from 'react';
import '../../styles/App.css';

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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#F8F7F3' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          TOWNSHIP USER ACCESS CONTROL
        </div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#ffffff', fontWeight: 800 }}>Pending Registration Approvals</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#A3B1AC' }}>
          Review and approve or reject new account onboarding requests before granting CRM access.
        </p>
      </div>

      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
        {pendingUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#A3B1AC', padding: '40px' }}>
            🎉 No pending user registration requests. All accounts reviewed!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#07291F', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#E8C96A', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 18px' }}>Requested Date</th>
                  <th style={{ padding: '14px 18px' }}>Full Name</th>
                  <th style={{ padding: '14px 18px' }}>Username / Email</th>
                  <th style={{ padding: '14px 18px' }}>Requested Role</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <td style={{ padding: '14px 18px', color: '#A3B1AC' }}>{new Date(usr.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#ffffff' }}>{usr.fullName}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#F8F7F3', fontWeight: 600 }}>{usr.username}</div>
                      <div style={{ fontSize: '0.75rem', color: '#A3B1AC' }}>{usr.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: '#07291F', color: '#E8C96A', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {usr.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleAction(usr.id, 'APPROVE')}
                          style={{ background: '#07291F', color: '#FFFFFF', border: '1px solid #D4AF37', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(usr.id, 'REJECT')}
                          style={{ background: 'rgba(128, 0, 32, 0.2)', color: '#F87171', border: '1px solid rgba(128, 0, 32, 0.4)', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
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
