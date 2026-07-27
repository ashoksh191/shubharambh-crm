import React, { useState } from 'react';
import type { Plot } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle } from 'lucide-react';

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

  if (!plot) return null;

  const associate = users.find((u) => u.id === associateId) || currentUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !utrNumber) return;

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

    onSuccess(booking.bookingId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Plot Booking & Document Registration</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)' }}>
              Plot {plot.plotNo} ({plot.block}) — Total Price: ₹{plot.totalPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
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
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Mahindra"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Aadhaar Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012"
                  value={customerAadhaar}
                  onChange={(e) => setCustomerAadhaar(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  PAN Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={customerPan}
                  onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Sponsoring Associate ID *
                </label>
                <select
                  value={associateId}
                  onChange={(e) => setAssociateId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id}) — {u.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Permanent Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="House / Flat No, Street, City, State, Pincode"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            {/* Payment Details */}
            <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
              2. Booking Payment & UTR Transaction Verification
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Advance Booking Amount (₹) *
                </label>
                <input
                  type="number"
                  required
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
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <CheckCircle size={16} /> Confirm Booking & Generate PDF Receipt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
