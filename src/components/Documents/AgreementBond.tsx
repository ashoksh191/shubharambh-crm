import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, FileCheck } from 'lucide-react';
import '../../styles/Document.css';

interface AgreementBondProps {
  bookingId: string | null;
  onClose: () => void;
}

export const AgreementBond: React.FC<AgreementBondProps> = ({ bookingId, onClose }) => {
  const { bookings, plots } = useApp();

  const booking = bookings.find((b) => b.bookingId === bookingId);
  const plot = booking ? plots.find((p) => p.id === booking.plotId) : null;

  if (!booking || !plot) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="document-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Control Header */}
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
            <FileCheck size={20} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700 }}>Plot Sale & Purchase Agreement Bond</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-gold" onClick={handlePrint}>
              <Printer size={16} /> Print Agreement Document
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Bond Sheet */}
        <div className="printable-area bond-sheet">
          <h2>MEMORANDUM OF AGREEMENT FOR PLOT SALE</h2>

          <div className="bond-clause">
            This Sale Agreement is executed on this <strong>{booking.bookingDate}</strong> at Shubharambh Green City Office, between:
          </div>

          <div className="bond-clause">
            <strong>DEVELOPER / FIRST PARTY:</strong> <strong>M/S SHUBHARAMBH GREEN CITY REAL ESTATES LTD.</strong>, having its principal project office at Main Sector Boulevard, 60-Bigha Township.
          </div>

          <div className="bond-clause">
            <strong>PURCHASER / SECOND PARTY:</strong> <strong>{booking.customerName}</strong>, Resident of {booking.customerAddress}, holding Aadhaar No. <strong>{booking.customerAadhaar}</strong> and PAN No. <strong>{booking.customerPan}</strong> (Contact: {booking.customerPhone}).
          </div>

          <hr style={{ margin: '20px 0', borderColor: '#d4af37' }} />

          <div className="bond-clause">
            <strong>1. PROPERTY SPECIFICATIONS:</strong> The Developer agrees to sell and the Purchaser agrees to purchase residential Plot <strong>{plot.plotNo}</strong> situated in <strong>{plot.block}</strong> of Shubharambh Green City layout plan, measuring dimensions <strong>{plot.dimensions}</strong> with a total area of <strong>{plot.totalArea} Sq. Ft.</strong>, facing <strong>{plot.facing}</strong> direction on a <strong>{plot.roadWidth}</strong>.
          </div>

          <div className="bond-clause">
            <strong>2. CONSIDERATION & PAYMENT SCHEDULE:</strong> Total agreed sale value for the subject plot is fixed at <strong>₹{plot.totalPrice.toLocaleString('en-IN')}</strong> (Rupees {plot.totalPrice.toLocaleString('en-IN')} Only). The Second Party has paid an advance booking amount of <strong>₹{booking.bookingAmount.toLocaleString('en-IN')}</strong> via {booking.paymentMode} under UTR Reference <strong>{booking.utrNumber}</strong>. The remaining balance of <strong>₹{booking.balanceDue.toLocaleString('en-IN')}</strong> shall be payable prior to registration.
          </div>

          <div className="bond-clause">
            <strong>3. REGISTRY TIMELINE & INVENTORY CLAUSE:</strong> As per company policy, the customer must complete full payment and registry procedures within <strong>90 days (by {booking.registryDueDate})</strong>. Failure to complete registry within the stipulated timeframe permits the Company Management to exercise the "Wipe Out" inventory reset option.
          </div>

          <div className="bond-clause">
            <strong>4. TOWNSHIP AMENITIES GUARANTEE:</strong> The Developer assures that the 60-bigha property includes 24x7 gated security, 40ft/30ft wide concrete roads, pure drinking water infrastructure, solar street lighting, and access to the Club House & Central Park.
          </div>

          <div className="bond-clause">
            <strong>5. SPONSORING ASSOCIATE:</strong> This booking transaction has been facilitated through Sponsoring Associate <strong>{booking.associateName} ({booking.associateId})</strong>.
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px' }}>
            <div className="signature-box">
              <div className="signature-line" style={{ borderTopColor: '#0f382c' }}>
                ({booking.customerName})<br />
                <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Signature of Purchaser</span>
              </div>
            </div>

            <div className="signature-box">
              <div className="signature-line" style={{ borderTopColor: '#0f382c' }}>
                FOR SHUBHARAMBH GREEN CITY LTD.<br />
                <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Authorized Signatory / Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
