import React, { useState, useEffect } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ShieldCheck, MapPin, Download, Share2, PhoneCall, FileText, Sparkles, User, Settings, ExternalLink, Calendar, MessageSquare, Edit3 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'amenities' | 'history' | 'documents' | 'admin'>('overview');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
      `Hello Shubharambh Green City Sales Team! I am interested in Plot ${plot.plotNo} (${plot.dimensions}, ${plot.totalArea} sq.ft) in ${plot.block}. Please share details.`
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
      alert('Plot link copied to clipboard!');
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
            background: 'rgba(11, 15, 25, 0.7)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Sliding Side Drawer Card */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Plot Details Drawer for Plot ${plot.plotNo}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '540px',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: `2px solid ${statusColor}`,
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                {plot.block} • {plot.category} Sector • {plot.roadWidth} Main Boulevard
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

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#0b171e',
              padding: '0 16px',
              gap: '4px',
              overflowX: 'auto',
            }}
          >
            {(['overview', 'gallery', 'amenities', 'history', 'documents', 'admin'] as const).map((tab) => {
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
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {tab === 'overview' && <Sparkles size={14} />}
                  {tab === 'gallery' && <ExternalLink size={14} />}
                  {tab === 'amenities' && <MapPin size={14} />}
                  {tab === 'history' && <Clock size={14} />}
                  {tab === 'documents' && <FileText size={14} />}
                  {tab === 'admin' && <Settings size={14} />}
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Body Content Scroll View */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Price Box Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.7) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Plot Price
                    </span>
                    <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', margin: '4px 0 0 0' }}>
                      ₹{plot.totalPrice.toLocaleString('en-IN')}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Rate: ₹{plot.ratePerSqFt.toLocaleString('en-IN')} / sq.ft • Advance Token: ₹50,000
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleMaps}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={14} /> GIS Location
                  </button>
                </div>

                {/* Plot Properties Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Dimensions</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f8fafc', marginTop: '2px' }}>{plot.dimensions}</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Carpet Area</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f8fafc', marginTop: '2px' }}>{plot.totalArea} Sq.Ft</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Facing</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#38bdf8', marginTop: '2px' }}>{plot.facing} Facing</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Road Width</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f59e0b', marginTop: '2px' }}>{plot.roadWidth} Wide Road</strong>
                  </div>
                </div>

                {/* Description & Legal Assurance */}
                <div style={{ background: '#15222b', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#10b981" /> Ownership & RERA Compliance
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                    {plot.description} Gram Panchayat & RERA compliant clear title plot. Sub-registrar registry guaranteed within 90 days of booking.
                  </p>
                </div>

                {/* Owner Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <User size={20} color="#f59e0b" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Owner / Allottee</span>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ffffff' }}>{plot.owner || 'Shubharambh Green City'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Site Photo Gallery</h4>
                <div style={{ width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                        borderRadius: '8px',
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
                      background: '#15222b',
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
                        background: '#15222b',
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
                      background: '#15222b',
                      padding: '14px',
                      borderRadius: '12px',
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

          {/* Drawer Action Footer Buttons */}
          <div
            style={{
              padding: '20px 28px',
              background: '#0b171e',
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
              <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                🔒 This plot is currently {plot.enhancedStatus.toUpperCase()}
              </div>
            )}

            {/* Communication & Site Visit Buttons */}
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
