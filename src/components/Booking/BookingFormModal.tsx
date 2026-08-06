import React, { useState, useEffect } from 'react';
import type { Plot } from '../../types';
import { useApp } from '../../context/AppContext';
import { submitBookingApi, type TransactionStatus } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  ShieldCheck,
  CreditCard,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Upload,
  CheckCircle2,
  Building,
} from 'lucide-react';
import '../../styles/App.css';

interface BookingFormModalProps {
  plot: Plot | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({ plot, onClose, onSuccess }) => {
  const { currentUser, users, bookPlot } = useApp();

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');

  // Step 2: KYC Details
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string | null>(null);

  // Step 3: Payment Details
  const [bookingAmount, setBookingAmount] = useState<number>(plot ? Math.round(plot.totalPrice * 0.15) : 200000);
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [utrNumber, setUtrNumber] = useState('');
  const [associateId, setAssociateId] = useState(currentUser.id);
  const [remarks, setRemarks] = useState('');

  // Transaction Status & Error States (Server Authoritative OCC)
  const [txnStatus, setTxnStatus] = useState<TransactionStatus | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!plot) return null;

  const associate = users.find((u) => u.id === associateId) || currentUser;
  const isSubmitting = txnStatus === 'pending';

  // Financial Calculations
  const discount = 0;
  const agreementValue = plot.totalPrice;
  const finalAmount = Math.max(0, agreementValue - discount);
  const balanceDue = Math.max(0, finalAmount - bookingAmount);

  // Validation before proceeding to next step
  const canProceedStep1 = customerName.trim().length >= 2 && customerPhone.trim().length >= 10;
  const canProceedStep3 = utrNumber.trim().length >= 4 && bookingAmount >= 10000;

  const handleNextStep = () => {
    if (currentStep === 1 && !canProceedStep1) {
      alert('Please provide Customer Full Name and a valid Mobile Phone number.');
      return;
    }
    if (currentStep === 3 && !canProceedStep3) {
      alert('Please enter a valid Bank UTR / Transaction Reference number and token amount.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

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

  const steps = [
    { num: 1, label: 'Customer Details', icon: User },
    { num: 2, label: 'KYC & Verification', icon: ShieldCheck },
    { num: 3, label: 'Payment Details', icon: CreditCard },
    { num: 4, label: 'Review & Confirm', icon: FileCheck },
  ];

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none',
        }}
      >
        {/* Dark Translucent Backdrop Overlay with 15px Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitting ? undefined : onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.82)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Centered Premium 900px Multi-Step Modal Dialog (28px Rounded Corners) */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Booking Wizard for Plot ${plot.plotNo}`}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{
            width: '900px',
            maxWidth: '92vw',
            maxHeight: '80vh',
            background: 'rgba(11, 16, 28, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '28px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.2)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Ambient Background Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              left: '-120px',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* MODAL HEADER & STEPPER BAR */}
          <div
            style={{
              padding: '22px 28px 16px 28px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Header Title & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <Building size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Plot Booking Wizard
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Unit {plot.plotNo} ({plot.block}) • Agreement Value: <strong style={{ color: '#34d399' }}>₹{plot.totalPrice.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Premium Horizontal Stepper Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
              {/* Animated Glowing Progress Bar Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '40px',
                  right: '40px',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 0,
                  borderRadius: '9999px',
                }}
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                  }}
                />
              </div>

              {steps.map((st) => {
                const Icon = st.icon;
                const isActive = currentStep === st.num;
                const isPassed = currentStep > st.num;

                return (
                  <div
                    key={st.num}
                    onClick={() => {
                      if (isPassed) setCurrentStep(st.num as any);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 1,
                      cursor: isPassed ? 'pointer' : 'default',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isPassed
                          ? '#10b981'
                          : isActive
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(15, 23, 42, 0.8)',
                        border: `2px solid ${isPassed ? '#10b981' : isActive ? '#34d399' : 'rgba(255, 255, 255, 0.15)'}`,
                        color: isPassed ? '#ffffff' : isActive ? '#34d399' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        transition: 'all 0.25s ease',
                        boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
                      }}
                    >
                      {isPassed ? '✓' : <Icon size={16} />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? '#ffffff' : isPassed ? '#34d399' : '#64748b',
                        transition: 'color 0.25s ease',
                      }}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SCROLLABLE STEP BODY */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', zIndex: 1 }}>
            {/* Conflict & Error Banners */}
            {txnStatus === 'conflict' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '16px', padding: '12px 16px', marginBottom: '18px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
                <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Booking Conflict Detected</strong>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {txnStatus === 'failed' && (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '16px', padding: '12px 16px', marginBottom: '18px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Server Communication Error</strong>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* STEP 1: CUSTOMER DETAILS */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Customer Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder="e.g. Ramesh Kumar Gupta"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={isSubmitting}
                        placeholder="e.g. 9826012345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled={isSubmitting}
                      placeholder="e.g. ramesh.gupta@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      disabled={isSubmitting}
                      placeholder="Enter complete postal address..."
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  {/* Nominee Details Section */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      NOMINEE DETAILS (OPTIONAL)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Nominee Full Name"
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '10px', background: 'rgba(10, 14, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Relation (e.g. Wife/Son)"
                        value={nomineeRelation}
                        onChange={(e) => setNomineeRelation(e.target.value)}
                        style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '10px', background: 'rgba(10, 14, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                      />
                      <input
                        type="tel"
                        placeholder="Nominee Mobile Phone"
                        value={nomineePhone}
                        onChange={(e) => setNomineePhone(e.target.value)}
                        style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '10px', background: 'rgba(10, 14, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: KYC & VERIFICATION */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Aadhaar Card Number (12 Digits)
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="e.g. 4512 9834 1029"
                        value={customerAadhaar}
                        onChange={(e) => setCustomerAadhaar(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        PAN Card Number (10 Chars)
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="e.g. ABCDE1234F"
                        value={customerPan}
                        onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* File Upload Dropzones */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Passport Photo Upload */}
                    <div style={{ border: '2px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '18px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Upload size={24} color="#34d399" />
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Customer Passport Photo</strong>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>PNG, JPG up to 5MB</span>
                      <button
                        type="button"
                        onClick={() => setPhotoFileName('customer_passport_photo.jpg')}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {photoFileName ? `Uploaded: ${photoFileName}` : 'Select Photo'}
                      </button>
                    </div>

                    {/* Document Upload */}
                    <div style={{ border: '2px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '18px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Upload size={24} color="#38bdf8" />
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Aadhaar / PAN Copy (PDF)</strong>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>PDF up to 10MB</span>
                      <button
                        type="button"
                        onClick={() => setDocFileName('aadhaar_pan_scan.pdf')}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {docFileName ? `Uploaded: ${docFileName}` : 'Select File'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT DETAILS */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Booking Token Amount (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        disabled={isSubmitting}
                        min={10000}
                        step={5000}
                        value={bookingAmount}
                        onChange={(e) => setBookingAmount(Number(e.target.value))}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#34d399', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Payment Method *
                      </label>
                      <select
                        disabled={isSubmitting}
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                      >
                        <option value="NEFT">Bank Transfer (NEFT/RTGS)</option>
                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                        <option value="Cash">Cash Deposit</option>
                        <option value="Cheque">Bank Demand Draft / Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Bank UTR / Transaction Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. UTR9812374912"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Assigned Executive / Agent
                      </label>
                      <select
                        disabled={isSubmitting}
                        value={associateId}
                        onChange={(e) => setAssociateId(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Remarks & Notes
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        placeholder="e.g. Token paid via HDFC Bank"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Plot Summary Card */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>PLOT SUMMARY</span>
                      <h4 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>Plot {plot.plotNo} ({plot.block})</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {plot.dimensions} • {plot.totalArea.toLocaleString()} Sq.Ft • {plot.facing} Facing
                      </p>
                    </div>

                    {/* Customer Summary Card */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>CUSTOMER SUMMARY</span>
                      <h4 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>{customerName}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Mobile: {customerPhone} • Email: {customerEmail || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span>Agreement Value:</span>
                      <strong style={{ color: '#ffffff' }}>₹{agreementValue.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#34d399' }}>
                      <span>Booking Token Paid:</span>
                      <strong>₹{bookingAmount.toLocaleString('en-IN')} ({paymentMode} • UTR: {utrNumber})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800, paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                      <span>Outstanding Balance Due:</span>
                      <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STICKY STEP NAVIGATION FOOTER */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Previous Button (Secondary: White with Gold Border) */}
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1px solid #D4AF37',
                      color: '#07291F',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ArrowLeft size={16} color="#07291F" /> Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {/* Next / Submit Button (Primary: Dark Green with Gold Accent) */}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '12px',
                      background: '#07291F',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      border: '1px solid #D4AF37',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(7, 41, 31, 0.3)',
                    }}
                  >
                    Next Step <ArrowRight size={16} color="#D4AF37" />
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 26px',
                      borderRadius: '12px',
                      background: '#07291F',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      border: '1px solid #D4AF37',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(7, 41, 31, 0.4)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" color="#D4AF37" /> Confirming Transaction...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} color="#D4AF37" /> Confirm Booking & Issue Receipt
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
