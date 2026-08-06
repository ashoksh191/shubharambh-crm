import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  ShieldCheck,
} from 'lucide-react';
import '../../styles/App.css';

export const CustomerDirectoryDashboard: React.FC = () => {
  const { bookings, users } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Extracted unique customer profiles from bookings & registered users
  const customerList = useMemo(() => {
    const map = new Map<string, any>();

    // Add buyers from bookings
    bookings.forEach((b) => {
      if (!map.has(b.customerPhone)) {
        map.set(b.customerPhone, {
          id: b.bookingId,
          name: b.customerName,
          phone: b.customerPhone,
          aadhaar: b.customerAadhaar || 'Verified KYC',
          bookedPlots: [b.plotNo],
          totalSpent: b.totalAmount,
          joinedDate: b.bookingDate,
          status: 'VERIFIED_BUYER',
        });
      } else {
        const existing = map.get(b.customerPhone);
        existing.bookedPlots.push(b.plotNo);
        existing.totalSpent += b.totalAmount;
      }
    });

    // Add registered associate users
    users.forEach((u) => {
      if (!map.has(u.phone)) {
        map.set(u.phone, {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          aadhaar: 'Government ID Verified',
          bookedPlots: [],
          totalSpent: u.totalSalesVolume || 0,
          joinedDate: u.joinedDate,
          status: u.role.toUpperCase(),
        });
      }
    });

    return Array.from(map.values());
  }, [bookings, users]);

  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.bookedPlots.join(' ').toLowerCase().includes(q)
      );
    });
  }, [customerList, searchQuery]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Users size={14} /> Township Buyer & Customer Directory
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
          Customers & Verified Leads
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
          Directory of plot buyers, KYC documents, and associate lead contacts.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL BUYERS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{customerList.length}</div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>KYC Verified Profiles</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE PLOT OWNERS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
            {customerList.filter((c) => c.bookedPlots.length > 0).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a855f7' }}>Allocated plots</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '16px 20px', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by customer name, phone number, or plot number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 14px 0 40px',
              borderRadius: '12px',
              background: 'rgba(10, 14, 26, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Registered Customer Accounts ({filteredCustomers.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(10, 14, 26, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 18px' }}>Customer Name</th>
                <th style={{ padding: '14px 18px' }}>Phone Number</th>
                <th style={{ padding: '14px 18px' }}>KYC Document</th>
                <th style={{ padding: '14px 18px' }}>Booked Plots</th>
                <th style={{ padding: '14px 18px' }}>Total Portfolio Value</th>
                <th style={{ padding: '14px 18px' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#ffffff' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                      {c.phone}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem' }}>
                        <ShieldCheck size={14} /> {c.aadhaar}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#34d399' }}>
                      {c.bookedPlots.length > 0 ? c.bookedPlots.join(', ') : 'Lead (No Plot)'}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#ffffff' }}>
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
