import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AssociateRegistration } from './AssociateRegistration';
import { Users, Award, DollarSign, TrendingUp, UserPlus, Shield } from 'lucide-react';
import '../../styles/Dashboard.css';

export const AssociateDashboard: React.FC = () => {
  const { users, currentUser, bookings } = useApp();
  const [showRegModal, setShowRegModal] = useState(false);

  // Calculate downline associates for current user
  const getDownlines = (userId: string) => {
    return users.filter((u) => u.parentId === userId);
  };

  const directDownlines = getDownlines(currentUser.id);

  // Total sales & bookings from bookings list
  const userBookings = bookings.filter((b) => b.associateId === currentUser.id);

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))',
            color: 'var(--primary-forest-dark)',
            fontWeight: 800,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-forest)' }}>
              {currentUser.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>ID: <strong style={{ color: 'var(--primary-forest)' }}>{currentUser.id}</strong></span>
              <span>•</span>
              <span className={`role-badge role-${currentUser.role}`}>{currentUser.role.toUpperCase()}</span>
              {currentUser.parentId && (
                <>
                  <span>•</span>
                  <span>Sponsor: {currentUser.parentId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button className="btn-gold" onClick={() => setShowRegModal(true)}>
          <UserPlus size={18} /> Register New Associate
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="dashboard-grid">
        <div className="kpi-card gold">
          <div className="kpi-icon">
            <Award size={24} />
          </div>
          <div className="kpi-info">
            <h4>Plots Booked By Me</h4>
            <div className="kpi-value">{currentUser.totalBookingsCount} Plots</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {userBookings.length} Active Reservations
            </span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Sales Volume</h4>
            <div className="kpi-value">₹{(currentUser.totalSalesVolume / 100000).toFixed(1)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: '#047857' }}>
              Full Property Value
            </span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <h4>Commission Generated</h4>
            <div className="kpi-value">₹{currentUser.totalCommissionEarned.toLocaleString('en-IN')}</div>
            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
              5% Direct Sales Commission
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Downline Team</h4>
            <div className="kpi-value">{directDownlines.length} Associates</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active Network Sales Force
            </span>
          </div>
        </div>
      </div>

      {/* Downline Tree Listing */}
      <div className="tree-card">
        <div className="tree-header">
          <h3>
            <Shield size={20} color="var(--primary-forest)" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Multi-Level Network Hierarchy Tree
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tracking sales hierarchy & associate downlines
          </span>
        </div>

        {/* Tree Root */}
        <div className="tree-node level-0">
          <div className="user-meta">
            <div className="user-avatar">{currentUser.name.charAt(0)}</div>
            <div className="user-details">
              <h5>{currentUser.name} (YOU)</h5>
              <span>ID: {currentUser.id} • Role: {currentUser.role.toUpperCase()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem' }}>
            <div>Bookings: <strong>{currentUser.totalBookingsCount}</strong></div>
            <div>Sales: <strong>₹{(currentUser.totalSalesVolume / 100000).toFixed(1)}L</strong></div>
            <div>Commission: <strong>₹{currentUser.totalCommissionEarned.toLocaleString('en-IN')}</strong></div>
          </div>
        </div>

        {/* Level 1 Downlines */}
        {directDownlines.length > 0 ? (
          directDownlines.map((child) => {
            const grandChildren = getDownlines(child.id);
            return (
              <React.Fragment key={child.id}>
                <div className="tree-node level-1">
                  <div className="user-meta">
                    <div className="user-avatar" style={{ background: 'var(--accent-gold-dark)' }}>
                      {child.name.charAt(0)}
                    </div>
                    <div className="user-details">
                      <h5>{child.name}</h5>
                      <span>ID: {child.id} • Sponsor: {child.parentId}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem' }}>
                    <div>Bookings: <strong>{child.totalBookingsCount}</strong></div>
                    <div>Sales: <strong>₹{(child.totalSalesVolume / 100000).toFixed(1)}L</strong></div>
                    <div>Earned: <strong>₹{child.totalCommissionEarned.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>

                {/* Level 2 Downlines */}
                {grandChildren.map((gChild) => (
                  <div key={gChild.id} className="tree-node level-2">
                    <div className="user-meta">
                      <div className="user-avatar" style={{ background: '#059669' }}>
                        {gChild.name.charAt(0)}
                      </div>
                      <div className="user-details">
                        <h5>{gChild.name}</h5>
                        <span>ID: {gChild.id} • Sponsor: {gChild.parentId}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem' }}>
                      <div>Bookings: <strong>{gChild.totalBookingsCount}</strong></div>
                      <div>Sales: <strong>₹{(gChild.totalSalesVolume / 100000).toFixed(1)}L</strong></div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            );
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No downline associates registered yet under your ID. Click "Register New Associate" above to recruit field agents!
          </div>
        )}
      </div>

      {/* Associate Registration Modal */}
      {showRegModal && (
        <AssociateRegistration onClose={() => setShowRegModal(false)} />
      )}
    </div>
  );
};
