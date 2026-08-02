import React, { useState, useEffect, useMemo, memo } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Download,
  Share2,
  PhoneCall,
  FileText,
  Sparkles,
  User,
  Settings,
  Edit3,
  Calculator,
  Compass,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileCheck,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface PlotDrawerProps {
  plot: EnhancedPlot | null;
  onClose: () => void;
  onBookPlot: (plot: EnhancedPlot) => void;
  onUpdateStatus?: (plotId: string, newStatus: EnhancedPlotStatus) => void;
  onUpdatePrice?: (plotId: string, newPrice: number) => void;
  onOpenAdminEditor?: (plot: EnhancedPlot) => void;
}

export const PlotDrawer: React.FC<PlotDrawerProps> = memo(({
  plot,
  onClose,
  onBookPlot,
  onOpenAdminEditor,
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'finance' | 'timeline' | 'documents' | 'admin'>('overview');

  // EMI Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(10);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!plot) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [plot, onClose]);

  // EMI Calculation Formula
  const emiCalculated = useMemo(() => {
    if (!plot) return 0;
    const loanAmount = plot.totalPrice * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenureYears * 12;

    if (monthlyRate === 0) return Math.round(loanAmount / totalMonths);

    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    return Math.round(emi);
  }, [plot, downPaymentPercent, interestRate, loanTenureYears]);

  if (!plot) return null;

  const isBookedOrSold = plot.enhancedStatus === 'booked' || plot.enhancedStatus === 'sold' || plot.enhancedStatus === 'reserved';

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Shubharambh Green City Sales Desk! I am interested in Plot ${plot.plotNo} (${plot.dimensions}, ${plot.totalArea} sq.ft) in ${plot.block}. Please share brochure.`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  const handleGoogleMaps = () => {
    window.open('https://maps.google.com/?q=26.8467,80.9462', '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Shubharambh Green City — Plot ${plot.plotNo}`,
        text: `Check out Plot ${plot.plotNo} (${plot.dimensions}, ${plot.totalArea} sq.ft) in Shubharambh Green City!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Plot details link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {/* Dark Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Sliding Executive Property Intelligence Drawer (520px) */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Property Intelligence Panel for Plot ${plot.plotNo}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="property-intelligence-drawer-container"
        >
          {/* Top Breadcrumb Bar */}
          <div
            style={{
              padding: '12px 24px 8px 24px',
              background: '#0b1329',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#94a3b8',
            }}
          >
            <span>Township Layout</span>
            <ChevronRight size={12} />
            <span>{plot.block}</span>
            <ChevronRight size={12} />
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Unit {plot.plotNo}</span>
          </div>

          {/* Hero Property Inspector Header */}
          <div className="drawer-hero-header-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="drawer-plot-number-hero-title">
                  Plot {plot.plotNo}
                </h2>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                  {plot.block} Sector • {plot.facing} Facing • {plot.roadWidth} Boulevard
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN') && onOpenAdminEditor && (
                  <button
                    onClick={() => onOpenAdminEditor(plot)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid #f59e0b',
                      color: '#f59e0b',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                )}

                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Close Inspector (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Compact Header Chips Row */}
            <div className="drawer-header-chips-row">
              <span className={`drawer-status-badge-pill ${plot.enhancedStatus}`}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                {plot.enhancedStatus}
              </span>

              <span className="drawer-compact-info-chip">
                <MapPin size={12} color="#0ea5e9" /> {plot.block}
              </span>

              <span className="drawer-compact-info-chip">
                <Compass size={12} color="#38bdf8" /> {plot.facing}
              </span>

              <span className="drawer-compact-info-chip">
                <Sparkles size={12} color="#10b981" /> {plot.totalArea} sq.ft
              </span>

              <span className="drawer-compact-info-chip">
                <DollarSign size={12} color="#f59e0b" /> ₹{plot.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#0a1322',
              padding: '0 16px',
              gap: '4px',
              overflowX: 'auto',
            }}
          >
            {(['overview', 'customer', 'finance', 'timeline', 'documents', 'admin'] as const).map((tab) => {
              if (tab === 'admin' && authUser?.role !== 'SUPER_ADMIN' && authUser?.role !== 'ADMIN') return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #0ea5e9' : '2px solid transparent',
                    color: activeTab === tab ? '#ffffff' : '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === tab ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab === 'overview' && <Sparkles size={14} />}
                  {tab === 'customer' && <User size={14} />}
                  {tab === 'finance' && <Calculator size={14} />}
                  {tab === 'timeline' && <Clock size={14} />}
                  {tab === 'documents' && <FileText size={14} />}
                  {tab === 'admin' && <Settings size={14} />}
                  {tab === 'finance' ? 'EMI Calculator' : tab}
                </button>
              );
            })}
          </div>

          {/* Body Content Scroll View */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Hero Price Box Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '20px',
                    padding: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Total Plot Investment
                    </span>
                    <h3 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#10b981', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
                      ₹{plot.totalPrice.toLocaleString('en-IN')}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                      Rate: ₹{plot.ratePerSqFt.toLocaleString('en-IN')} / sq.ft • Advance Token: ₹50,000
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleMaps}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Compass size={16} /> GIS Coordinates
                  </button>
                </div>

                {/* Plot Physical Dimensions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Dimensions</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#f8fafc', marginTop: '4px' }}>{plot.dimensions}</strong>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Carpet Area</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#f8fafc', marginTop: '4px' }}>{plot.totalArea} Sq.Ft</strong>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Orientation</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#38bdf8', marginTop: '4px' }}>{plot.facing} Facing</strong>
                  </div>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Access Corridor</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#f59e0b', marginTop: '4px' }}>{plot.roadWidth} Wide Road</strong>
                  </div>
                </div>

                {/* Empty State Banner if Available */}
                {plot.enhancedStatus === 'available' && (
                  <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid #10b981', borderRadius: '18px', padding: '20px', textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                    <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Ready for Booking</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 14px 0' }}>
                      Clear Gram Panchayat title deed. Secure with instant ₹50,000 online token.
                    </p>
                    <button
                      onClick={() => onBookPlot(plot)}
                      style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Instant Booking
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="#0ea5e9" /> Allottee & Customer Intelligence
                </h4>

                {isBookedOrSold ? (
                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                        {(plot.owner || 'R')[0]}
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: '#ffffff', display: 'block' }}>{plot.owner || 'Ramesh Kumar'}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Customer ID: CUST-84920</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div><span>Phone:</span> <strong style={{ color: '#ffffff', display: 'block' }}>+91 98765 43210</strong></div>
                      <div><span>Email:</span> <strong style={{ color: '#ffffff', display: 'block' }}>customer@example.com</strong></div>
                      <div><span>Booking Date:</span> <strong style={{ color: '#ffffff', display: 'block' }}>02 Aug 2026</strong></div>
                      <div><span>KYC Status:</span> <strong style={{ color: '#10b981', display: 'block' }}>🟢 Verified</strong></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#0f172a', padding: '24px', borderRadius: '18px', textAlign: 'center', color: '#94a3b8' }}>
                    <User size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0 }}>Plot is currently unallocated and available for new booking.</p>
                  </div>
                )}
              </div>
            )}

            {/* FINANCE / EMI CALCULATOR TAB */}
            {activeTab === 'finance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} color="#38bdf8" /> Instant Bank EMI Loan Calculator
                </h4>

                <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(2, 132, 199, 0.4)', borderRadius: '20px', padding: '22px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Monthly Installment</span>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0 0 0' }}>
                    ₹{emiCalculated.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ month</span>
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>Down Payment ({downPaymentPercent}%)</span>
                      <strong style={{ color: '#10b981' }}>₹{Math.round(plot.totalPrice * (downPaymentPercent / 100)).toLocaleString('en-IN')}</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>Bank Interest Rate</span>
                      <strong style={{ color: '#38bdf8' }}>{interestRate}% p.a.</strong>
                    </div>
                    <input
                      type="range"
                      min="6.5"
                      max="12.5"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>Loan Tenure</span>
                      <strong style={{ color: '#f59e0b' }}>{loanTenureYears} Years</strong>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      step="1"
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#f59e0b" /> Booking & Registry Timeline
                </h4>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { title: 'Plot Created in Layout Blueprint', date: '15 Jan 2026', done: true },
                    { title: 'Token Amount (₹50,000) Received', date: '02 Aug 2026', done: isBookedOrSold },
                    { title: 'Agreement Bond Signed', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                    { title: 'Sub-Registrar Registry Execution', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                    { title: 'Plot Possession Handover', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step.done ? '#10b981' : '#1e293b', color: step.done ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                        {step.done ? <CheckCircle size={12} /> : idx + 1}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: step.done ? '#ffffff' : '#94a3b8', display: 'block' }}>{step.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#a855f7" /> Documents & Master Title Deeds
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {[
                    { name: 'Master Layout Blueprint PDF', size: '2.4 MB', type: 'PDF' },
                    { name: 'Plot Payment Receipt', size: '180 KB', type: 'PDF' },
                    { name: 'Agreement Bond Certificate', size: '420 KB', type: 'DOC' },
                    { name: 'Sub-Registrar Title Deed', size: '1.1 MB', type: 'PDF' },
                  ].map((doc, idx) => (
                    <div key={idx} style={{ background: '#0f172a', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileCheck size={20} color="#a855f7" />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>{doc.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.type} • {doc.size}</span>
                        </div>
                      </div>
                      <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Download size={12} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STICKY BOTTOM ACTION BAR */}
          <div className="drawer-sticky-bottom-action-bar">
            {plot.enhancedStatus === 'available' ? (
              <button
                onClick={() => onBookPlot(plot)}
                className="drawer-sticky-action-btn primary"
              >
                <Sparkles size={16} /> Book Plot Now
              </button>
            ) : (
              <button
                onClick={handleWhatsApp}
                className="drawer-sticky-action-btn primary"
              >
                <PhoneCall size={16} /> Contact Sales
              </button>
            )}

            <button
              onClick={handleShare}
              className="drawer-sticky-action-btn secondary"
            >
              <Share2 size={16} /> Share Plot
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

PlotDrawer.displayName = 'PlotDrawer';
