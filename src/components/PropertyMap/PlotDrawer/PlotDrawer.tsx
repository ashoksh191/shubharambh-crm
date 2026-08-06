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

  // Close modal on Escape key press
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none',
        }}
      >
        {/* Dark Translucent Backdrop Overlay with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Centered Premium Enterprise Modal Dialog (780px Width, 85vh Max Height, 28px Rounded Corners) */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Plot Details for Unit ${plot.plotNo}`}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          style={{
            width: '780px',
            maxWidth: '94vw',
            maxHeight: '85vh',
            background: 'rgba(11, 16, 28, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '28px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.15)',
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
              right: '-120px',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* MODAL HEADER */}
          <div
            style={{
              padding: '22px 28px 16px 28px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Top Row: Title, Status Pill & Three-Dot Overflow Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  Plot {plot.plotNo}
                </h2>
                <span
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background:
                      plot.enhancedStatus === 'available'
                        ? 'rgba(11, 61, 46, 0.4)'
                        : plot.enhancedStatus === 'booked'
                        ? 'rgba(128, 0, 32, 0.4)'
                        : plot.enhancedStatus === 'reserved'
                        ? 'rgba(212, 175, 55, 0.4)'
                        : 'rgba(71, 85, 105, 0.4)',
                    color:
                      plot.enhancedStatus === 'available'
                        ? '#E8C96A'
                        : plot.enhancedStatus === 'booked'
                        ? '#F87171'
                        : plot.enhancedStatus === 'reserved'
                        ? '#E8C96A'
                        : '#94A3B8',
                    border: `1px solid ${
                      plot.enhancedStatus === 'available'
                        ? 'rgba(212, 175, 55, 0.4)'
                        : plot.enhancedStatus === 'booked'
                        ? 'rgba(128, 0, 32, 0.6)'
                        : plot.enhancedStatus === 'reserved'
                        ? 'rgba(212, 175, 55, 0.6)'
                        : 'rgba(71, 85, 105, 0.6)'
                    }`,
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                  {plot.enhancedStatus}
                </span>
              </div>

              {/* Overflow & Close Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <button
                  onClick={() => setShowOverflowMenu(!showOverflowMenu)}
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
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="More Options"
                >
                  <MoreVertical size={18} />
                </button>

                {/* Three-Dot Dropdown Popup */}
                {showOverflowMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '46px',
                      right: '46px',
                      width: '200px',
                      background: 'rgba(15, 23, 42, 0.98)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      padding: '8px',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    {(authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN') && onOpenAdminEditor && (
                      <button
                        onClick={() => {
                          setShowOverflowMenu(false);
                          onOpenAdminEditor(plot);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#f59e0b',
                          fontSize: '0.82rem',
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
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.82rem',
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
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                      }}
                    >
                      <Navigation size={14} /> GIS Location
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
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
                    cursor: 'pointer',
                  }}
                  title="Close Dialog (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Price Banner & Compact Attributes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.03em' }}>
                  ₹{plot.totalPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: '8px' }}>
                  (₹{plot.ratePerSqFt.toLocaleString('en-IN')} / sq.ft)
                </span>
              </div>

              {/* Single Compact Metadata String */}
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span>{plot.roadWidth} Road</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span>{plot.facing} Facing</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span>{plot.totalArea.toLocaleString()} Sq.Ft</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{plot.block}</span>
              </div>
            </div>
          </div>

          {/* SCROLLABLE MODAL BODY */}
          <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
            {/* 1. COMPACT BOOKING STATUS CARD */}
            <div
              style={{
                background:
                  plot.enhancedStatus === 'available'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: `1px solid ${plot.enhancedStatus === 'available' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                borderRadius: '18px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: plot.enhancedStatus === 'available' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: plot.enhancedStatus === 'available' ? '#34d399' : '#38bdf8',
                    flexShrink: 0,
                  }}
                >
                  {plot.enhancedStatus === 'available' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    {plot.enhancedStatus === 'available' ? 'Ready for Instant Booking' : `Status: ${plot.enhancedStatus.toUpperCase()}`}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {plot.enhancedStatus === 'available'
                      ? 'Clear Gram Panchayat title deed. Secure with instant online token.'
                      : 'Active record in township allocation ledger.'}
                  </p>
                </div>
              </div>

              {plot.enhancedStatus === 'available' && (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                  RERA Approved
                </span>
              )}
            </div>

            {/* 2. FOUR PREMIUM QUICK INFO CARDS (2x2 GRID) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Card 1: Area */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <Maximize2 size={14} color="#34d399" />
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Plot Area</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  {plot.totalArea.toLocaleString()} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>Sq.Ft</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Dimensions: {plot.dimensions}</div>
              </div>

              {/* Card 2: Facing */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <Compass size={14} color="#38bdf8" />
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Orientation</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                  {plot.facing} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>Facing</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Vastu Compliant Layout</div>
              </div>

              {/* Card 3: Road Width */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <MapPin size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Road Width</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  {plot.roadWidth} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>Boulevard</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Wide Asphalt Access</div>
              </div>

              {/* Card 4: Status / Sector */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <Building size={14} color="#a855f7" />
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Sector & Block</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  {plot.block}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>60-Bigha Masterplan</div>
              </div>
            </div>

            {/* 3. DEDICATED PRICING CARD */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.65) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PRICING & FINANCING BREAKDOWN
                </span>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Contract Rate: ₹{plot.ratePerSqFt}/sq.ft</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Total Investment</span>
                  <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>₹{(plot.totalPrice / 100000).toFixed(2)} Lakh</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Booking Token</span>
                  <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>₹{tokenAmount.toLocaleString()}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>EMI Estimate</span>
                  <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>₹{emiCalculated.toLocaleString()} / mo</strong>
                </div>
              </div>
            </div>

            {/* 4. CUSTOMER SECTION (ONLY APPEARS WHEN BOOKED/SOLD/RESERVED) */}
            {isBookedOrSold && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={18} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                      Allottee & Customer Intelligence
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: '8px', fontWeight: 800 }}>
                    Booked Record
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Allottee Name:</span>
                    <strong style={{ color: '#ffffff', display: 'block' }}>{plot.owner || 'Ramesh Kumar'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Primary Phone:</span>
                    <strong style={{ color: '#ffffff', display: 'block' }}>+91 98260 12345</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Token Received:</span>
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
                borderRadius: '18px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#f59e0b" />
                  <span>Booking & Registry Timeline</span>
                </div>
                {isTimelineOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
              </button>

              {isTimelineOpen && (
                <div style={{ padding: '0 18px 16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                  {[
                    { title: 'Master Layout Allocation', date: '15 Jan 2026', done: true },
                    { title: 'Token Advance Received', date: '02 Aug 2026', done: isBookedOrSold },
                    { title: 'Agreement Bond Execution', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                    { title: 'Sub-Registrar Deed Signed', date: 'Pending', done: plot.enhancedStatus === 'sold' },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: step.done ? '#10b981' : '#1e293b', color: step.done ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ color: step.done ? '#ffffff' : '#94a3b8', flex: 1 }}>{step.title}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{step.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STICKY BOTTOM ACTION FOOTER */}
          <div
            style={{
              padding: '16px 28px',
              background: 'rgba(11, 16, 28, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              zIndex: 2,
            }}
          >
            {/* Primary CTA: Book Plot (Dark Green Primary) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBookPlot(plot)}
              disabled={plot.enhancedStatus === 'sold'}
              style={{
                flex: 2,
                height: '48px',
                borderRadius: '12px',
                background: plot.enhancedStatus === 'sold'
                  ? 'rgba(71, 85, 105, 0.4)'
                  : '#07291F',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: '1px solid #D4AF37',
                cursor: plot.enhancedStatus === 'sold' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(7, 41, 31, 0.3)',
              }}
            >
              <Sparkles size={18} color="#D4AF37" /> {plot.enhancedStatus === 'sold' ? 'Plot Sold Out' : 'Book Plot'}
            </motion.button>

            {/* Secondary CTA: Reserve Plot (White with Gold Border) */}
            {plot.enhancedStatus === 'available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReserve}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #D4AF37',
                  color: '#07291F',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <BookmarkPlus size={17} color="#D4AF37" /> Reserve Plot
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

PlotDrawer.displayName = 'PlotDrawer';
