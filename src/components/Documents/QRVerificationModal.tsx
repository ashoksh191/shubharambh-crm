import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface QRVerificationModalProps {
  bookingId: string | null;
  onClose: () => void;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({ bookingId, onClose }) => {
  const { bookings, plots } = useApp();

  const booking = bookings.find((b) => b.bookingId === bookingId);
  const plot = booking ? plots.find((p) => p.id === booking.plotId) : null;

  if (!booking || !plot) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#065f46' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="var(--accent-gold-light)" />
            <div>
              <h3>Official Document Verification Pass</h3>
              <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Shubharambh Green City Security Portal</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#d1fae5',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid #34d399'
          }}>
            <CheckCircle size={36} />
          </div>

          <h4 style={{ fontSize: '1.25rem', color: '#065f46', marginBottom: '4px' }}>
            AUTHENTICATED REAL ESTATE RECEIPT
          </h4>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Digital Signature Verification Verified by Bank & Admin Ledger
          </span>

          <div style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginTop: '20px',
            textAlign: 'left',
            border: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '0.875rem'
          }}>
            <div><strong>Verification ID:</strong> <br /><code style={{ color: 'var(--primary-forest)' }}>{booking.bookingId}</code></div>
            <div><strong>Plot Allotted:</strong> <br />Plot {booking.plotNo} ({booking.block})</div>
            <div><strong>Customer Name:</strong> <br />{booking.customerName}</div>
            <div><strong>Bank UTR Ref:</strong> <br />{booking.utrNumber}</div>
            <div><strong>Deposit Received:</strong> <br />₹{booking.bookingAmount.toLocaleString('en-IN')}</div>
            <div><strong>Registry Due:</strong> <br />{booking.registryDueDate}</div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: '#fef3c7',
            borderRadius: 'var(--radius-md)',
            color: '#92400e',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <QrCode size={18} /> Valid document copy registered in Shubharambh Green City CRM system.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close Security Audit
          </button>
        </div>
      </div>
    </div>
  );
};
