import React from 'react';
import type { Plot } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, Clock, AlertTriangle, Shield, FileText, Download, RotateCcw } from 'lucide-react';

interface PlotModalProps {
  plot: Plot | null;
  onClose: () => void;
  onOpenBooking: (plot: Plot) => void;
  onOpenReceipt: (bookingId: string) => void;
  onOpenBond: (bookingId: string) => void;
}

export const PlotModal: React.FC<PlotModalProps> = ({
  plot,
  onClose,
  onOpenBooking,
  onOpenReceipt,
  onOpenBond,
}) => {
  const { bookings, currentUser, wipeOutBooking } = useApp();

  if (!plot) return null;

  const booking = bookings.find((b) => b.plotId === plot.id || b.bookingId === plot.bookingId);
  const canWipeOut = currentUser.role === 'admin' || currentUser.role === 'accountant';

  const handleWipeOut = () => {
    if (window.confirm(`Are you sure you want to Wipe Out the booking for Plot ${plot.plotNo}? This will reset the plot status back to "Available".`)) {
      wipeOutBooking(plot.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3>Plot Details & Inventory</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)' }}>
              Shubharambh Green City — {plot.block}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Main Title Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-forest)' }}>
                Plot {plot.plotNo}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {plot.facing} Facing • {plot.roadWidth}
              </span>
            </div>
            <div>
              {plot.status === 'available' && (
                <span className="badge badge-available">
                  <CheckCircle size={14} /> Available
                </span>
              )}
              {plot.status === 'booked' && (
                <span className="badge badge-booked">
                  <Clock size={14} /> Booked
                </span>
              )}
              {plot.status === 'sold' && (
                <span className="badge badge-sold">
                  <AlertTriangle size={14} /> Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Grid Spec Attributes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dimensions</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{plot.dimensions}</div>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Area</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{plot.totalArea} Sq. Ft.</div>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rate / Sq. Ft.</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>₹{plot.ratePerSqFt.toLocaleString('en-IN')}</div>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-gold)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Price</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-forest)' }}>₹{plot.totalPrice.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Booking Info Section if Booked/Sold */}
          {booking && (
            <div style={{
              background: 'var(--status-booked-bg)',
              border: '1px solid var(--status-booked-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} /> Active Booking Records
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.875rem' }}>
                <div><strong>Customer:</strong> {booking.customerName}</div>
                <div><strong>Booking ID:</strong> {booking.bookingId}</div>
                <div><strong>Aadhaar:</strong> {booking.customerAadhaar}</div>
                <div><strong>PAN:</strong> {booking.customerPan}</div>
                <div><strong>Booking Paid:</strong> ₹{booking.bookingAmount.toLocaleString('en-IN')}</div>
                <div><strong>Balance Due:</strong> ₹{booking.balanceDue.toLocaleString('en-IN')}</div>
                <div><strong>Associate:</strong> {booking.associateName} ({booking.associateId})</div>
                <div><strong>Registry Due Date:</strong> {booking.registryDueDate}</div>
                <div><strong>UTR / Txn ID:</strong> {booking.utrNumber}</div>
                <div><strong>Status:</strong> {booking.status.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          {plot.status === 'available' && (
            <button
              className="btn-gold"
              onClick={() => {
                onClose();
                onOpenBooking(plot);
              }}
            >
              <FileText size={16} /> Book Plot Now
            </button>
          )}

          {booking && (
            <>
              <button
                className="btn-secondary"
                onClick={() => onOpenReceipt(booking.bookingId)}
              >
                <Download size={16} /> Receipt PDF
              </button>
              <button
                className="btn-primary"
                onClick={() => onOpenBond(booking.bookingId)}
              >
                <FileText size={16} /> Agreement Bond
              </button>
            </>
          )}

          {booking && canWipeOut && (
            <button
              className="btn-danger"
              onClick={handleWipeOut}
              title="Admin Inventory Reset: Wipe out booking and restore status to Available"
            >
              <RotateCcw size={16} /> Wipe Out (Reset)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
