import React, { useState, useEffect, useMemo } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  ShieldCheck,
  MapPin,
  Download,
  Share2,
  PhoneCall,
  FileText,
  Sparkles,
  User,
  Settings,
  ExternalLink,
  Calendar,
  MessageSquare,
  Edit3,
  Calculator,
  Compass,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
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

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  plot,
  onClose,
  onBookPlot,
  onUpdateStatus,
  onOpenAdminEditor,
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'gallery' | 'amenities' | 'history' | 'documents' | 'admin'>('overview');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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

  const STATUS_COLORS: Record<EnhancedPlotStatus, string> = {
    available: '#10b981',
    reserved: '#f59e0b',
    booked: '#3b82f6',
    sold: '#ef4444',
    unreleased: '#64748b',
  };

  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';

  const galleryImages = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  ];

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

        {/* Sliding Side Property Inspector Drawer */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Property Inspector for Plot ${plot.plotNo}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '560px',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(24px)',
            borderLeft: `2px solid ${statusColor}`,
            boxShadow: '-25px 0 70px rgba(0, 0, 0, 0.8)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
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
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Plot {plot.plotNo}
                </h2>
                <span
                  style={{
                    background: `${statusColor}22`,
                    color: statusColor,
                    border: `1px solid ${statusColor}`,
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {plot.enhancedStatus}
                </span>

                {plot.category === 'Corner' && (
                  <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                    ⭐ Corner Plot
                  </span>
                )}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                {plot.block} Sector • {plot.facing} Facing • {plot.roadWidth} Main Boulevard
              </p>
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
              >
                <X size={18} />
              </button>
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
            {(['overview', 'finance', 'gallery', 'amenities', 'history', 'documents', 'admin'] as const).map((tab) => {
              if (tab === 'admin' && authUser?.role !== 'SUPER_ADMIN' && authUser?.role !== 'ADMIN') return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? `2px solid ${statusColor}` : '2px solid transparent',
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
                  {tab === 'finance' && <Calculator size={14} />}
                  {tab === 'gallery' && <ExternalLink size={14} />}
                  {tab === 'amenities' && <MapPin size={14} />}
                  {tab === 'history' && <Clock size={14} />}
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

                {/* Booking Lifecycle Stage Tracker Bar */}
                <div style={{ background: '#0f172a', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ color: '#ffffff', margin: '0 0 14px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={16} color="#0284c7" /> Booking & Ownership Stage
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {['Token (₹50k)', 'UTR Approval', 'Agreement Bond', 'Sub-Registrar'].map((step, idx) => {
                      const isCompleted =
                        plot.enhancedStatus === 'sold' ||
                        (plot.enhancedStatus === 'booked' && idx <= 1) ||
                        (plot.enhancedStatus === 'reserved' && idx === 0);
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: isCompleted ? '#10b981' : '#1e293b',
                              color: isCompleted ? '#ffffff' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: isCompleted ? '#ffffff' : '#64748b', fontWeight: 600 }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ownership & Legal Compliance */}
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#10b981" /> RERA & Gram Panchayat Compliance
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                    {plot.description} Gram Panchayat approved clear title plot with immediate registry assurance.
                  </p>
                </div>

                {/* Owner Info Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <User size={22} color="#f59e0b" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Owner / Allottee</span>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#ffffff' }}>{plot.owner || 'Shubharambh Green City'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* EMI CALCULATOR TAB */}
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

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Site Photo Gallery</h4>
                <div style={{ width: '100%', height: '260px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img
                    src={galleryImages[activeImageIdx]}
                    alt={`Plot ${plot.plotNo} View`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      style={{
                        width: '70px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: activeImageIdx === idx ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <img src={img} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === 'amenities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Nearby Infrastructure & Distances</h4>
                {plot.amenities.map((am, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#0f172a',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{am.icon}</span>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#ffffff', display: 'block' }}>{am.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Category: {am.category}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {am.distance}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Plot Audit History & Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plot.history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#0f172a',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        borderLeft: `3px solid ${statusColor}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{item.stage}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.timestamp}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 4px 0' }}>{item.description}</p>
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>By: {item.performedBy}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Official Verification Documents</h4>
                {plot.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#0f172a',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={20} color="#38bdf8" />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#ffffff', display: 'block' }}>{doc.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.type} • Updated: {doc.updatedAt}</span>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      download
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid #10b981',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={14} /> PDF
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* ADMIN ACTIONS TAB */}
            {activeTab === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Admin Inventory Management</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(plot.id, 'available')}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟢 Mark Available
                  </button>
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(plot.id, 'reserved')}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟡 Reserve Plot (48-Hour Hold)
                  </button>
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(plot.id, 'booked')}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🔵 Mark Booked
                  </button>
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(plot.id, 'sold')}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🔴 Mark Sold Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Action Footer */}
          <div
            style={{
              padding: '20px 24px',
              background: '#0a1322',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {plot.enhancedStatus === 'available' || plot.enhancedStatus === 'reserved' ? (
              <button
                onClick={() => onBookPlot(plot)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={18} /> Book Plot Now (₹50,000 Advance)
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '0.85rem', background: '#0f172a', borderRadius: '12px' }}>
                🔒 This plot is currently {plot.enhancedStatus.toUpperCase()}
              </div>
            )}

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={handleWhatsApp}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Chat on WhatsApp"
              >
                <MessageSquare size={16} /> WhatsApp
              </button>

              <a
                href="tel:+919876543210"
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                }}
                title="Call Sales Desk"
              >
                <PhoneCall size={16} /> Call Us
              </a>

              <button
                onClick={handleGoogleMaps}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Schedule Physical Site Visit"
              >
                <Calendar size={16} /> Site Visit
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Share Plot Details"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
