import React, { useState, useEffect, useMemo, memo } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  UserCheck,
  Edit3,
  Compass,
  CheckCircle2,
  Maximize2,
  Navigation,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Building,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/Map.css';

interface PlotDrawerProps {
  plot: EnhancedPlot | null;
  onClose: () => void;
  onBookPlot: (plot: EnhancedPlot) => void;
  onUpdateStatus?: (plotId: string, newStatus: any) => void;
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
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

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

  // Close overflow menu when plot changes
  useEffect(() => {
    setShowOverflowMenu(false);
  }, [plot]);

  // Standard EMI Estimate (20% Down, 8.5% Interest, 10 Years)
  const emiCalculated = useMemo(() => {
    if (!plot) return 0;
    const loanAmount = plot.totalPrice * 0.8;
    const monthlyRate = 8.5 / 12 / 100;
    const totalMonths = 120;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  }, [plot]);

  if (!plot) return null;

  const isBookedOrSold =
    plot.enhancedStatus === 'booked' ||
    plot.enhancedStatus === 'sold' ||
    plot.enhancedStatus === 'reserved' ||
    !!plot.owner;

  const tokenAmount = Math.min(50000, Math.round(plot.totalPrice * 0.05));

  const handleShare = () => {
    setShowOverflowMenu(false);
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

  const handleGoogleMaps = () => {
    setShowOverflowMenu(false);
    window.open('https://maps.google.com/?q=26.8467,80.9462', '_blank');
  };

  const handleReserve = () => {
    alert(`Plot ${plot.plotNo} placed on 24-Hour Token Hold for customer registration.`);
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
        {/* Dark Glass Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Sliding Premium Real Estate CRM Drawer (500px Width) */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Plot Details for Unit ${plot.plotNo}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="property-intelligence-drawer-container"
          style={{
            width: '500px',
            maxWidth: '100vw',
            height: '100vh',
            background: 'rgba(11, 16, 28, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.85)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
            position: 'relative',
          }}
        >
          {/* Subtle Background Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* COMPACT DRAWER HEADER */}
          <div
            style={{
              padding: '18px 20px 14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Top Bar: Plot No, Status Badge & Action Menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Plot {plot.plotNo}
                </h2>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background:
                      plot.enhancedStatus === 'available'
                        ? 'rgba(52, 211, 153, 0.15)'
                        : plot.enhancedStatus === 'booked'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : plot.enhancedStatus === 'reserved'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(148, 163, 184, 0.15)',
                    color:
                      plot.enhancedStatus === 'available'
                        ? '#34d399'
                        : plot.enhancedStatus === 'booked'
                        ? '#38bdf8'
                        : plot.enhancedStatus === 'reserved'
                        ? '#f59e0b'
                        : '#94a3b8',
                    border: `1px solid ${
                      plot.enhancedStatus === 'available'
                        ? 'rgba(52, 211, 153, 0.35)'
                        : plot.enhancedStatus === 'booked'
                        ? 'rgba(56, 189, 248, 0.35)'
                        : plot.enhancedStatus === 'reserved'
                        ? 'rgba(245, 158, 11, 0.35)'
                        : 'rgba(148, 163, 184, 0.35)'
                    }`,
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                  {plot.enhancedStatus}
                </span>
              </div>

              {/* Header Right Action Group: Three-Dot Overflow & Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <button
                  onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="More Options"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Three-Dot Overflow Menu Popup */}
                {showOverflowMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '42px',
                      right: '40px',
                      width: '180px',
                      background: 'rgba(15, 23, 42, 0.96)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      padding: '6px',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {(authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN') && onOpenAdminEditor && (
                      <button
                        onClick={() => {
                          setShowOverflowMenu(false);
                          onOpenAdminEditor(plot);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'none',
                          border: 'none',
                          color: '#f59e0b',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                        }}
                      >
                        <Edit3 size={14} /> Edit Plot Specs
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                      }}
                    >
                      <Share2 size={14} /> Share Plot Details
                    </button>
                    <button
                      onClick={handleGoogleMaps}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                      }}
                    >
                      <Navigation size={14} /> GIS Coordinates
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Plot Hero Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.02em' }}>
                ₹{plot.totalPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                (₹{plot.ratePerSqFt.toLocaleString('en-IN')}/sq.ft)
              </span>
            </div>

            {/* Compact Single Metadata Line */}
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{plot.roadWidth} Road</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span>{plot.facing} Facing</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span>{plot.totalArea.toLocaleString()} Sq.Ft</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#94a3b8' }}>{plot.block}</span>
            </div>
          </div>

          {/* SCROLLABLE DRAWER BODY (35% REDUCED VERTICAL SPACING) */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 1 }}>
            {/* 1. COMPACT BOOKING STATUS CARD */}
            <div
              style={{
                background:
                  plot.enhancedStatus === 'available'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: `1px solid ${plot.enhancedStatus === 'available' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: plot.enhancedStatus === 'available' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: plot.enhancedStatus === 'available' ? '#34d399' : '#38bdf8',
                    flexShrink: 0,
                  }}
                >
                  {plot.enhancedStatus === 'available' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                    {plot.enhancedStatus === 'available' ? 'Ready for Instant Booking' : `Status: ${plot.enhancedStatus.toUpperCase()}`}
                  </h4>
                  <p style={{ margin: '1px 0 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
                    {plot.enhancedStatus === 'available'
                      ? 'Clear Gram Panchayat title deed. Secure with instant token.'
                      : 'Active record in township allocation ledger.'}
                  </p>
                </div>
              </div>

              {plot.enhancedStatus === 'available' && (
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '4px 8px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                  RERA Verified
                </span>
              )}
            </div>

            {/* 2. FOUR PREMIUM COMPACT INFO CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Info Card 1: Area */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <Maximize2 size={13} color="#34d399" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Plot Area</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {plot.totalArea.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>Sq.Ft</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Dim: {plot.dimensions}</div>
              </div>

              {/* Info Card 2: Facing */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Compass size={13} color="#38bdf8" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Orientation</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                  {plot.facing} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>Facing</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Vastu Compliant</div>
              </div>

              {/* Info Card 3: Road Width */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <MapPin size={13} color="#f59e0b" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Road Access</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
                  {plot.roadWidth} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>Wide</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Asphalt Boulevard</div>
              </div>

              {/* Info Card 4: Status */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Building size={13} color="#a855f7" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Sector Status</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {plot.block}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Master Layout</div>
              </div>
            </div>

            {/* 3. DEDICATED PRICING CARD */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PRICING & FINANCING
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Rate: ₹{plot.ratePerSqFt}/sq.ft</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Total Price</span>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>₹{(plot.totalPrice / 100000).toFixed(2)}L</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Booking Token</span>
                  <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>₹{tokenAmount.toLocaleString()}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>EMI Estimate</span>
                  <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>₹{emiCalculated.toLocaleString()}/mo</strong>
                </div>
              </div>
            </div>

            {/* 4. CUSTOMER SECTION (ONLY APPEARS WHEN PLOT IS BOOKED/SOLD/RESERVED) */}
            {isBookedOrSold && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      Allottee & Customer Info
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    Booked
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Buyer Name:</span>
                    <strong style={{ color: '#ffffff', display: 'block' }}>{plot.owner || 'Ramesh Kumar'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Contact:</span>
                    <strong style={{ color: '#ffffff', display: 'block' }}>+91 98260 12345</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Booking Token Paid:</span>
                    <strong style={{ color: '#34d399', display: 'block' }}>₹{tokenAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Booking ID:</span>
                    <strong style={{ color: '#38bdf8', display: 'block' }}>SGC-BK-2026-0104</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COLLAPSIBLE TIMELINE ACCORDION */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="#f59e0b" />
                  <span>Booking & Registry Timeline</span>
                </div>
                {isTimelineOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
              </button>

              {isTimelineOpen && (
                <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                  {[
                    { title: 'Master Blueprint Allocation', date: '15 Jan 2026', done: true },
                    { title: 'Token Advance Received', date: '02 Aug 2026', done: isBookedOrSold },
                    { title: 'Agreement Bond Execution', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                    { title: 'Sub-Registrar Deed Signed', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step.done ? '#10b981' : '#1e293b', color: step.done ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ color: step.done ? '#ffffff' : '#94a3b8', flex: 1 }}>{step.title}</span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{step.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STICKY BOTTOM ACTION FOOTER (FOCUSED CTAs) */}
          <div
            style={{
              padding: '14px 20px',
              background: 'rgba(11, 16, 28, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 2,
            }}
          >
            {/* Primary CTA: Book Plot */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBookPlot(plot)}
              disabled={plot.enhancedStatus === 'sold'}
              style={{
                flex: 2,
                height: '46px',
                borderRadius: '12px',
                background: plot.enhancedStatus === 'sold'
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: 'none',
                cursor: plot.enhancedStatus === 'sold' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: plot.enhancedStatus === 'sold' ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sparkles size={17} /> {plot.enhancedStatus === 'sold' ? 'Plot Sold Out' : 'Book Plot'}
            </motion.button>

            {/* Secondary CTA: Reserve Plot */}
            {plot.enhancedStatus === 'available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReserve}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <BookmarkPlus size={16} color="#f59e0b" /> Reserve
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

PlotDrawer.displayName = 'PlotDrawer';
