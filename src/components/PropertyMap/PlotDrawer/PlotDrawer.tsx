import React, { useState } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ShieldCheck, MapPin, Download, Share2, PhoneCall, FileText, Sparkles, User, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface PlotDrawerProps {
  plot: EnhancedPlot | null;
  onClose: () => void;
  onBookPlot: (plot: EnhancedPlot) => void;
  onUpdateStatus?: (plotId: string, newStatus: EnhancedPlotStatus) => void;
  onUpdatePrice?: (plotId: string, newPrice: number) => void;
}

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  plot,
  onClose,
  onBookPlot,
  onUpdateStatus,
  onUpdatePrice,
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'history' | 'documents' | 'admin'>('overview');
  const [editPrice, setEditPrice] = useState<number>(plot?.totalPrice || 0);
  const [showPriceEdit, setShowPriceEdit] = useState(false);

  if (!plot) return null;

  const STATUS_COLORS: Record<EnhancedPlotStatus, string> = {
    available: '#10b981',
    reserved: '#f59e0b',
    booked: '#3b82f6',
    sold: '#ef4444',
    unreleased: '#64748b',
  };

  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';

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
            background: 'rgba(11, 15, 25, 0.65)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
          }}
        />

        {/* Sliding Side Drawer Card */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '520px',
            height: '100vh',
            background: '#0f172a',
            borderLeft: `2px solid ${statusColor}`,
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.6)',
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
              background: '#15222b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Plot {plot.plotNo}
                </h2>
                <span
                  style={{
                    background: `${statusColor}22`,
                    color: statusColor,
                    border: `1px solid ${statusColor}`,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {plot.enhancedStatus}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                {plot.block} • {plot.category} Sector • {plot.roadWidth} Main Boulevard
              </p>
            </div>

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
            {(['overview', 'amenities', 'history', 'documents', 'admin'] as const).map((tab) => {
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
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total All-Inclusive Plot Price
                    </span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '4px 0 0 0' }}>
                      ₹{plot.totalPrice.toLocaleString('en-IN')}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Rate: ₹{plot.ratePerSqFt.toLocaleString('en-IN')} / sq.ft • Token: ₹50,000 Only
                    </div>
                  </div>

                  {authUser?.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => setShowPriceEdit(!showPriceEdit)}
                      style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit Price
                    </button>
                  )}
                </div>

                {showPriceEdit && (
                  <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff' }}
                    />
                    <button
                      onClick={() => {
                        if (onUpdatePrice) onUpdatePrice(plot.id, editPrice);
                        setShowPriceEdit(false);
                      }}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Plot Properties Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Dimensions</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f8fafc', marginTop: '2px' }}>{plot.dimensions}</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Carpet Area</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f8fafc', marginTop: '2px' }}>{plot.totalArea} Sq.Ft</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plot Facing</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#38bdf8', marginTop: '2px' }}>{plot.facing} Facing</strong>
                  </div>
                  <div style={{ background: '#15222b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category & PLC</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f59e0b', marginTop: '2px' }}>
                      {plot.category} (+{plot.plcRate || 0}%)
                    </strong>
                  </div>
                </div>

                {/* Description & Legal Assurance */}
                <div style={{ background: '#15222b', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#10b981" /> Legal Ownership & Registry Details
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                    {plot.description} Gram Panchayat & RERA compliant clear title land. Official Daakhil-Kharij sub-registrar deed guaranteed within 90 days of booking.
                  </p>
                </div>

                {/* Assigned Manager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <User size={20} color="#f59e0b" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Sales Relationship Lead</span>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ffffff' }}>{plot.assignedSalesperson || 'Vikramaditya Singh'}</strong>
                  </div>
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
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(plot.id, 'unreleased')}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: '1px solid #94a3b8', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚪ Mark Unreleased
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleShare}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Share2 size={16} /> Share Plot
              </button>

              <a
                href="tel:+919876543210"
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <PhoneCall size={16} /> Contact Sales
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
