import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, ShieldCheck } from 'lucide-react';

interface AssociateRegistrationProps {
  onClose: () => void;
}

export const AssociateRegistration: React.FC<AssociateRegistrationProps> = ({ onClose }) => {
  const { users, currentUser, registerAssociate } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentId, setParentId] = useState(currentUser.id);
  const [createdAssociateId, setCreatedAssociateId] = useState<string | null>(null);

  // Available sponsors (Leaders & Admins)
  const availableSponsors = users.filter((u) => u.role === 'admin' || u.role === 'leader');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;

    const newAssoc = registerAssociate(name, phone, email, parentId);
    setCreatedAssociateId(newAssoc.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Associate Onboarding (MLM Registration)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)' }}>
              Register new field sales agent & assign sponsor ID
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {createdAssociateId ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: 'var(--status-available-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--status-available-border)'
            }}>
              <ShieldCheck size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.3rem', color: '#065f46', marginBottom: '8px' }}>
                Associate Successfully Registered!
              </h4>
              <p style={{ color: '#047857', marginBottom: '16px' }}>
                New Unique Associate ID Assigned:
              </p>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--primary-forest)',
                background: '#ffffff',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-block',
                border: '2px dashed var(--accent-gold)'
              }}>
                {createdAssociateId}
              </div>
              <div style={{ marginTop: '20px' }}>
                <button className="btn-primary" onClick={onClose}>
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="agent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Assign Sponsoring Leader / Admin *
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  {availableSponsors.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.id}) — {sp.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ℹ️ Registering will auto-generate a unique Associate ID (e.g. SGC-A005) and place them in the specified leader's downline tree.
              </div>

              <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold">
                  <UserPlus size={16} /> Generate Associate ID
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
