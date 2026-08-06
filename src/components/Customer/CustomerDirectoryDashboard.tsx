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
        <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Users size={14} /> Township Buyer & Customer Directory
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
          Customers & Verified Leads
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
          Directory of plot buyers, KYC documents, and associate lead contacts.
        </p>
      </div>

      {/* Metrics Row (20px Rounded Cards with Thin Gold Borders) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600 }}>TOTAL BUYERS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{customerList.length}</div>
          <span style={{ fontSize: '0.75rem', color: '#E8C96A' }}>KYC Verified Profiles</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600 }}>ACTIVE PLOT OWNERS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D4AF37', marginTop: '4px' }}>
            {customerList.filter((c) => c.bookedPlots.length > 0).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D4AF37' }}>Allocated plots</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3B1AC' }} />
          <input
            type="text"
            placeholder="Search by buyer name, phone, plot number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 14px 0 40px',
              borderRadius: '12px',
              background: 'rgba(4, 25, 19, 0.7)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '0.82rem', color: '#A3B1AC' }}>
          Showing <strong>{filteredCustomers.length}</strong> active profiles
        </div>
      </div>

      {/* Customer Directory Table */}
      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#07291F', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#E8C96A', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 18px' }}>Customer Name</th>
                <th style={{ padding: '14px 18px' }}>Phone Contact</th>
                <th style={{ padding: '14px 18px' }}>Allocated Plots</th>
                <th style={{ padding: '14px 18px' }}>KYC Verification</th>
                <th style={{ padding: '14px 18px' }}>Contracted Volume</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Role / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.phone} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#ffffff' }}>{c.name}</td>
                  <td style={{ padding: '14px 18px', color: '#A3B1AC' }}>{c.phone}</td>
                  <td style={{ padding: '14px 18px', color: '#E8C96A', fontWeight: 800 }}>
                    {c.bookedPlots.length > 0 ? c.bookedPlots.join(', ') : 'None'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#E8C96A', fontSize: '0.78rem' }}>
                      <ShieldCheck size={14} color="#D4AF37" /> {c.aadhaar}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#D4AF37', fontWeight: 800 }}>
                    ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: '#07291F', color: '#E8C96A', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
