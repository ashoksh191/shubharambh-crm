import React, { useState } from 'react';
import type { Plot } from '../../types';
import { useApp } from '../../context/AppContext';
import { submitBookingApi, type TransactionStatus } from '../../services/api';
import { X, CheckCircle, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface BookingFormModalProps {
  plot: Plot | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({ plot, onClose, onSuccess }) => {
  const { currentUser, users, bookPlot } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [bookingAmount, setBookingAmount] = useState<number>(plot ? Math.round(plot.totalPrice * 0.15) : 200000);
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [utrNumber, setUtrNumber] = useState('');
  const [associateId, setAssociateId] = useState(currentUser.id);

  // Transaction Status & Error States (Server Authoritative OCC)
  const [txnStatus, setTxnStatus] = useState<TransactionStatus | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!plot) return null;

  const associate = users.find((u) => u.id === associateId) || currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !utrNumber) return;

    // 1. Optimistic Concurrency Control Check: Verify plot status prior to transaction submission
    if (plot.status !== 'available') {
      setTxnStatus('conflict');
      setErrorMessage(`Conflict: Plot ${plot.plotNo} is no longer available. It has already been reserved or booked by another user transaction.`);
      return;
    }

    setTxnStatus('pending');
    setErrorMessage(null);

    // 2. Submit to Server-Authoritative API
    const apiResult = await submitBookingApi({
      plotId: plot.id,
      customerName,
      customerPhone,
      bookingAmount: Number(bookingAmount),
      utrNumber,
      paymentMode,
      expectedStatus: 'available',
    });

    if (!apiResult.success) {
      setTxnStatus(apiResult.status);
      setErrorMessage(apiResult.message);
      return;
    }

    // 3. Mutate local state ONLY AFTER server-authoritative confirmation succeeds
    const booking = bookPlot({
      plotId: plot.id,
      plotNo: plot.plotNo,
      block: plot.block,
      customerName,
      customerPhone,
      customerAadhaar,
      customerPan,
      customerAddress,
      bookingAmount: Number(bookingAmount),
      totalAmount: plot.totalPrice,
      utrNumber,
      paymentMode,
      associateId: associate.id,
      associateName: associate.name,
    });

    setTxnStatus('success');
    onSuccess(booking.bookingId);
  };

  const isSubmitting = txnStatus === 'pending';

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Plot Booking & Document Registration</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)' }}>
              Plot {plot.plotNo} ({plot.block}) — Total Price: ₹{plot.totalPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Conflict Banner */}
          {txnStatus === 'conflict' && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
            }}>
              <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <strong>Booking Conflict Detected</strong>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Server Error Banner */}
          {txnStatus === 'failed' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
            }}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <strong>Server Communication Error</strong>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Plot Summary Banner */}
            <div style={{
              background: 'var(--primary-forest-subtle)',
              border: '1px solid var(--primary-forest)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-forest)' }}>Selected Property:</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-forest-dark)' }}>
                  Plot {plot.plotNo} • {plot.dimensions} ({plot.totalArea} sq.ft)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-forest)' }}>Rate: ₹{plot.ratePerSqFt}/sq.ft</span>
                <div style={{ fontWeight: 800, color: 'var(--accent-gold-dark)', fontSize: '1.1rem' }}>
                  Total: ₹{plot.totalPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
              1. Customer KYC & Personal Information
            </h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Rajesh Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Aadhaar Card Number
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. 1234 5678 9012"
                  value={customerAadhaar}
                  onChange={(e) => setCustomerAadhaar(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  PAN Card Number
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. ABCDE1234F"
                  value={customerPan}
                  onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Assigned Associate / Agent
                </label>
                <select
                  disabled={isSubmitting}
                  value={associateId}
                  onChange={(e) => setAssociateId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Full Residential Address
              </label>
              <textarea
                rows={2}
                disabled={isSubmitting}
                placeholder="Enter complete postal address..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'vertical' }}
              />
            </div>

            {/* Payment Details */}
            <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
              2. Advance Token & Payment Receipt Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Booking Advance Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  disabled={isSubmitting}
                  min={50000}
                  step={10000}
                  value={bookingAmount}
                  onChange={(e) => setBookingAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Payment Mode *
                </label>
                <select
                  disabled={isSubmitting}
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <option value="NEFT">NEFT Bank Transfer</option>
                  <option value="RTGS">RTGS High-Value Transfer</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Bank Demand Draft / Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Bank UTR / Transaction Reference ID *
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. UTR887766554433"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Required by Company Accountant to verify payment receipt before converting plot to officially "Sold".
              </span>
            </div>

            <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-gold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying Server Transaction...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> Confirm Booking & Generate PDF Receipt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
