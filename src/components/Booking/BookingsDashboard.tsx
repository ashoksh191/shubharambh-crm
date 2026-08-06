import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import '../../styles/App.css';

interface BookingsDashboardProps {
  onOpenBooking?: () => void;
  onOpenReceipt?: (bookingId: string) => void;
  onOpenBond?: (bookingId: string) => void;
  onOpenQR?: (bookingId: string) => void;
}

export const BookingsDashboard: React.FC<BookingsDashboardProps> = ({
  onOpenBooking,
  onOpenReceipt,
  onOpenBond,
}) => {
  const { bookings, wipeOutBooking } = useApp();
  const { user: authUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const isAdminOrFinance =
    authUser?.role === 'SUPER_ADMIN' ||
    authUser?.role === 'ADMIN' ||
    authUser?.role === 'FINANCE';

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.plotNo.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.bookingId.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && (b.status === 'verified' || b.status === 'sold')) ||
        (statusFilter === 'PENDING' && b.status === 'pending_verification') ||
        (statusFilter === 'CANCELLED' && b.status === 'cancelled');

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'verified' || b.status === 'sold').length;
    const totalVolume = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalAdvance = bookings.reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
    const totalDue = bookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);

    return { totalCount, confirmedCount, totalVolume, totalAdvance, totalDue };
  }, [bookings]);

  const handleWipeout = (plotId: string, plotNo: string) => {
    if (window.confirm(`Are you sure you want to cancel booking for Plot ${plotNo}? This will free up the plot.`)) {
      wipeOutBooking(plotId);
      if (selectedBooking?.plotId === plotId) {
        setSelectedBooking(null);
      }
    }
  };

  return (
    <div className="bookings-dashboard-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Section Header & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <CalendarCheck size={14} /> Township Sales & Bookings Ledger
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
            Plot Bookings & Transactions
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Manage buyer records, advance token payments, and agreement bond documents.
          </p>
        </div>

        {onOpenBooking && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenBooking}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#07291F',
              color: '#ffffff',
              border: '1px solid #D4AF37',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(7, 41, 31, 0.3)',
            }}
          >
            <Plus size={18} color="#D4AF37" /> New Plot Booking
          </motion.button>
        )}
      </div>

      {/* Metric Cards Row (20px Rounded Cards with Thin Gold Borders) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL BOOKINGS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{stats.totalCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#E8C96A' }}>{stats.confirmedCount} Verified Confirmed</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL BOOKING VOLUME</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E8C96A', marginTop: '4px' }}>
            ₹{(stats.totalVolume / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#A3B1AC' }}>Gross contracted value</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600, textTransform: 'uppercase' }}>ADVANCE COLLECTED</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D4AF37', marginTop: '4px' }}>
            ₹{(stats.totalAdvance / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D4AF37' }}>Received token & instalments</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: '#A3B1AC', fontWeight: 600, textTransform: 'uppercase' }}>OUTSTANDING BALANCE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F87171', marginTop: '4px' }}>
            ₹{(stats.totalDue / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#F87171' }}>Due at registry execution</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3B1AC' }} />
          <input
            type="text"
            placeholder="Search by Plot No (e.g. A-101), Buyer Name, Phone or ID..."
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
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#D4AF37" />
          <span style={{ fontSize: '0.82rem', color: '#A3B1AC', fontWeight: 600 }}>Status:</span>
          {(['ALL', 'VERIFIED', 'PENDING', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: statusFilter === st ? '1px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.15)',
                background: statusFilter === st ? '#07291F' : 'transparent',
                color: statusFilter === st ? '#E8C96A' : '#A3B1AC',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table + Detail Panel Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedBooking ? '1fr 380px' : '1fr', gap: '20px', transition: 'all 0.3s ease' }}>
        {/* Bookings Table Card */}
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Booking Records ({filteredBookings.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#A3B1AC' }}>Click any row to inspect details</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#07291F', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#E8C96A', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 18px' }}>Plot No & Block</th>
                  <th style={{ padding: '14px 18px' }}>Buyer Name</th>
                  <th style={{ padding: '14px 18px' }}>Contact</th>
                  <th style={{ padding: '14px 18px' }}>Booking Date</th>
                  <th style={{ padding: '14px 18px' }}>Total Amount</th>
                  <th style={{ padding: '14px 18px' }}>Paid Token</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#A3B1AC' }}>
                      No booking records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isSelected = selectedBooking?.bookingId === b.bookingId;
                    const isVerified = b.status === 'verified' || b.status === 'sold';
                    return (
                      <tr
                        key={b.bookingId}
                        onClick={() => setSelectedBooking(b)}
                        style={{
                          background: isSelected ? 'rgba(11, 61, 46, 0.9)' : 'transparent',
                          borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#E8C96A' }}>{b.plotNo} ({b.block})</td>
                        <td style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 600 }}>{b.customerName}</td>
                        <td style={{ padding: '14px 18px', color: '#A3B1AC' }}>{b.customerPhone}</td>
                        <td style={{ padding: '14px 18px', color: '#A3B1AC', fontSize: '0.8rem' }}>{b.bookingDate}</td>
                        <td style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString()}</td>
                        <td style={{ padding: '14px 18px', color: '#D4AF37', fontWeight: 800 }}>₹{b.bookingAmount?.toLocaleString()}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: isVerified ? 'rgba(11, 61, 46, 0.6)' : 'rgba(212, 175, 55, 0.2)',
                              color: isVerified ? '#E8C96A' : '#D4AF37',
                              border: `1px solid ${isVerified ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.3)'}`,
                            }}
                          >
                            {isVerified ? 'CONFIRMED' : 'PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {onOpenReceipt && (
                              <button
                                onClick={() => onOpenReceipt(b.bookingId)}
                                style={{ padding: '4px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #D4AF37', color: '#07291F', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Receipt
                              </button>
                            )}
                            {onOpenBond && (
                              <button
                                onClick={() => onOpenBond(b.bookingId)}
                                style={{ padding: '4px 10px', borderRadius: '8px', background: '#07291F', border: '1px solid #D4AF37', color: '#FFFFFF', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Bond
                              </button>
                            )}
                            {isAdminOrFinance && (
                              <button
                                onClick={() => handleWipeout(b.plotId, b.plotNo)}
                                style={{ padding: '4px 8px', borderRadius: '8px', background: 'rgba(128, 0, 32, 0.2)', border: '1px solid rgba(128, 0, 32, 0.4)', color: '#F87171', fontSize: '0.74rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Booking Inspector Drawer Panel */}
        {selectedBooking && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: 800 }}>
                Booking Dossier {selectedBooking.bookingId}
              </h4>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div style={{ background: 'rgba(4, 25, 19, 0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                <span style={{ color: '#A3B1AC', fontSize: '0.75rem' }}>Plot Number</span>
                <strong style={{ display: 'block', color: '#E8C96A', fontSize: '1.1rem' }}>Plot {selectedBooking.plotNo} ({selectedBooking.block})</strong>
              </div>

              <div>
                <span style={{ color: '#A3B1AC' }}>Buyer Name:</span>
                <strong style={{ color: '#ffffff', display: 'block' }}>{selectedBooking.customerName}</strong>
              </div>

              <div>
                <span style={{ color: '#A3B1AC' }}>Mobile Phone:</span>
                <strong style={{ color: '#ffffff', display: 'block' }}>{selectedBooking.customerPhone}</strong>
              </div>

              <div>
                <span style={{ color: '#A3B1AC' }}>Bank UTR Reference:</span>
                <strong style={{ color: '#D4AF37', display: 'block' }}>{selectedBooking.utrNumber} ({selectedBooking.paymentMode})</strong>
              </div>

              <div>
                <span style={{ color: '#A3B1AC' }}>Assigned Executive:</span>
                <strong style={{ color: '#ffffff', display: 'block' }}>{selectedBooking.associateName} ({selectedBooking.associateId})</strong>
              </div>

              <div style={{ background: 'rgba(4, 25, 19, 0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A3B1AC' }}>Agreement Value:</span>
                  <strong style={{ color: '#ffffff' }}>₹{selectedBooking.totalAmount?.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#D4AF37' }}>Paid Token:</span>
                  <strong style={{ color: '#D4AF37' }}>₹{selectedBooking.bookingAmount?.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(212, 175, 55, 0.2)' }}>
                  <span style={{ color: '#F87171' }}>Balance Due:</span>
                  <strong style={{ color: '#F87171' }}>₹{selectedBooking.balanceDue?.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
