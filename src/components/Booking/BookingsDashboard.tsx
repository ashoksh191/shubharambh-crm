import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  FileText,
  FileCheck,
  QrCode,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
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
  onOpenQR,
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
          <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            className="btn-primary-gradient"
            style={{
              padding: '12px 22px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Plus size={18} /> New Plot Booking
          </motion.button>
        )}
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL BOOKINGS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{stats.totalCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>{stats.confirmedCount} Verified Confirmed</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL BOOKING VOLUME</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            ₹{(stats.totalVolume / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gross contracted value</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>ADVANCE COLLECTED</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            ₹{(stats.totalAdvance / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Received token & instalments</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '18px 20px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>OUTSTANDING BALANCE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            ₹{(stats.totalDue / 100000).toFixed(2)} Lakh
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Due at registry execution</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
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
              background: 'rgba(10, 14, 26, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Status:</span>
          {(['ALL', 'VERIFIED', 'PENDING', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: statusFilter === st ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: statusFilter === st ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: statusFilter === st ? '#34d399' : '#94a3b8',
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
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Booking Records ({filteredBookings.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Click any row to inspect details</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(10, 14, 26, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
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
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: isSelected ? 'rgba(52, 211, 153, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#34d399' }}>
                          {b.plotNo} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>({b.block})</span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#ffffff' }}>
                          {b.customerName}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                          {b.customerPhone}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                          {new Date(b.bookingDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#ffffff' }}>
                          ₹{b.totalAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#38bdf8' }}>
                          ₹{(b.bookingAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: isVerified ? 'rgba(52, 211, 153, 0.15)' : b.status === 'pending_verification' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: isVerified ? '#34d399' : b.status === 'pending_verification' ? '#f59e0b' : '#ef4444',
                              border: `1px solid ${isVerified ? 'rgba(52, 211, 153, 0.3)' : b.status === 'pending_verification' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            }}
                          >
                            {isVerified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {b.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            {onOpenReceipt && (
                              <button
                                onClick={() => onOpenReceipt(b.bookingId)}
                                title="View Payment Receipt"
                                style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', cursor: 'pointer' }}
                              >
                                <FileText size={14} />
                              </button>
                            )}
                            {onOpenBond && (
                              <button
                                onClick={() => onOpenBond(b.bookingId)}
                                title="Generate Agreement Bond"
                                style={{ padding: '6px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', cursor: 'pointer' }}
                              >
                                <FileCheck size={14} />
                              </button>
                            )}
                            {onOpenQR && (
                              <button
                                onClick={() => onOpenQR(b.bookingId)}
                                title="Verify QR Code"
                                style={{ padding: '6px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', cursor: 'pointer' }}
                              >
                                <QrCode size={14} />
                              </button>
                            )}
                            {isAdminOrFinance && (
                              <button
                                onClick={() => handleWipeout(b.plotId, b.plotNo)}
                                title="Wipeout / Cancel Booking"
                                style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
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

        {/* Selected Booking Details Side Drawer */}
        {selectedBooking && (
          <div style={{ background: 'rgba(15, 22, 36, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>BOOKING DOSSIER</span>
                <h4 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Plot {selectedBooking.plotNo}
                </h4>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Buyer Info Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 14, 26, 0.5)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
                <User size={15} color="#34d399" /> {selectedBooking.customerName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <Phone size={14} color="#38bdf8" /> {selectedBooking.customerPhone}
              </div>
              {selectedBooking.customerAadhaar && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Aadhaar / KYC: <strong style={{ color: '#ffffff' }}>{selectedBooking.customerAadhaar}</strong>
                </div>
              )}
            </div>

            {/* Financial Ledger Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>PAYMENT BREAKDOWN</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <span>Total Contract Price:</span>
                <strong style={{ color: '#ffffff' }}>₹{selectedBooking.totalAmount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8' }}>
                <span>Advance Token Received:</span>
                <strong>₹{(selectedBooking.bookingAmount || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#f59e0b', fontWeight: 700, paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <span>Balance Payable:</span>
                <span>₹{selectedBooking.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
              {onOpenReceipt && (
                <button
                  onClick={() => onOpenReceipt(selectedBooking.bookingId)}
                  className="btn-primary-gradient"
                  style={{ width: '100%', height: '38px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <FileText size={15} /> Download Payment Receipt PDF
                </button>
              )}
              {onOpenBond && (
                <button
                  onClick={() => onOpenBond(selectedBooking.bookingId)}
                  style={{ width: '100%', height: '38px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <FileCheck size={15} /> Open Agreement Bond Deed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
