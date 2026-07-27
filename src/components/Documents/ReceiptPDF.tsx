import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import '../../styles/Document.css';

interface ReceiptPDFProps {
  bookingId: string | null;
  onClose: () => void;
  onOpenVerification?: (bookingId: string) => void;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ bookingId, onClose, onOpenVerification }) => {
  const { bookings, plots } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const booking = bookings.find((b) => b.bookingId === bookingId);
  const plot = booking ? plots.find((p) => p.id === booking.plotId) : null;

  // Generate QR Code on canvas
  useEffect(() => {
    if (canvasRef.current && booking) {
      const qrData = JSON.stringify({
        project: 'Shubharambh Green City',
        bookingId: booking.bookingId,
        plotNo: booking.plotNo,
        customer: booking.customerName,
        utr: booking.utrNumber,
        verifyUrl: `${window.location.origin}/verify?id=${booking.bookingId}`,
      });

      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        { width: 110, margin: 1, color: { dark: '#0f382c', light: '#ffffff' } },
        (error) => {
          if (error) console.error('QR Code render error:', error);
        }
      );
    }
  }, [booking]);

  if (!booking || !plot) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="document-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'var(--primary-forest-dark)',
          color: '#ffffff',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700 }}>Official Payment Receipt Preview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-gold" onClick={handlePrint}>
              <Printer size={16} /> Print / Save as PDF
            </button>
            {onOpenVerification && (
              <button className="btn-secondary" onClick={() => onOpenVerification(booking.bookingId)}>
                Simulate QR Scan Verification
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Letterhead Sheet */}
        <div className="printable-area receipt-sheet">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-logo-block">
              <div className="receipt-logo-mark">SGC</div>
              <div className="receipt-company-title">
                <h1>SHUBHARAMBH GREEN CITY</h1>
                <p>Premium 60-Bigha Eco Residential Township & Plot Management</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Main Sector Road, City • Customer Support: +91 98765 43210</p>
              </div>
            </div>
            <div className="receipt-badge-title">
              <h2>PAYMENT RECEIPT</h2>
              <p>Receipt No: <strong>{booking.bookingId}</strong></p>
              <p>Date: <strong>{booking.bookingDate}</strong></p>
            </div>
          </div>

          {/* Customer & Booking Meta Table */}
          <div className="receipt-meta-grid">
            <div className="receipt-meta-item">
              <div><strong>Customer Name:</strong> {booking.customerName}</div>
              <div><strong>Phone Number:</strong> {booking.customerPhone}</div>
              <div><strong>Aadhaar Number:</strong> {booking.customerAadhaar}</div>
              <div><strong>PAN Number:</strong> {booking.customerPan}</div>
            </div>
            <div className="receipt-meta-item">
              <div><strong>Plot Number:</strong> Plot {booking.plotNo} ({booking.block})</div>
              <div><strong>Plot Dimensions:</strong> {plot.dimensions} ({plot.totalArea} sq.ft)</div>
              <div><strong>Sponsoring Associate:</strong> {booking.associateName} ({booking.associateId})</div>
              <div><strong>Registry Target Date:</strong> {booking.registryDueDate}</div>
            </div>
          </div>

          {/* Payment Financial Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Bank UTR / Txn Ref</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Plot Advance Booking Fee</strong><br />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Plot {booking.plotNo} ({plot.dimensions}) Total Value: ₹{booking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>{booking.paymentMode}</td>
                <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{booking.utrNumber}</code></td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{booking.bookingAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total Booking Deposit Received:</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f382c', fontSize: '1.05rem' }}>
                  ₹{booking.bookingAmount.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr style={{ background: '#fffbeb' }}>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, color: '#92400e' }}>Remaining Balance Payable at Registry:</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', fontSize: '1.05rem' }}>
                  ₹{booking.balanceDue.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer QR Code & Signatures */}
          <div className="receipt-footer-sign">
            <div className="qr-code-box">
              <canvas ref={canvasRef} />
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                SCAN QR TO VERIFY RECEIPT
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '300px' }}>
              <p><strong>Note & Terms:</strong></p>
              <p>1. This receipt is subject to bank clearance of UTR {booking.utrNumber}.</p>
              <p>2. Property registry must be executed within 90 days of booking.</p>
            </div>

            <div className="signature-box">
              <div style={{ height: '30px' }} />
              <div className="signature-line">
                SHUBHARAMBH GREEN CITY<br />
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
