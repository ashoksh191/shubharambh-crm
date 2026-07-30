import React, { useState } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus, PlotCategory, PlotFacing } from '../../../types/propertyMap';
import { updatePlotApi } from '../../../services/api';
import { X, Save, Shield } from 'lucide-react';

interface AdminPlotEditorModalProps {
  plot: EnhancedPlot | null;
  onClose: () => void;
  onSaveSuccess: (updatedPlot: EnhancedPlot) => void;
}

export const AdminPlotEditorModal: React.FC<AdminPlotEditorModalProps> = ({
  plot,
  onClose,
  onSaveSuccess,
}) => {
  const [price, setPrice] = useState<number>(plot?.totalPrice ?? 0);
  const [status, setStatus] = useState<EnhancedPlotStatus>(plot?.enhancedStatus ?? 'available');
  const [category, setCategory] = useState<PlotCategory>(plot?.category ?? 'Residential');
  const [facing, setFacing] = useState<PlotFacing>(plot?.facing ?? 'East');
  const [owner, setOwner] = useState<string>(plot?.owner || 'Shubharambh Green City');
  const [description, setDescription] = useState<string>(plot?.description || '');
  const [galleryInput, setGalleryInput] = useState<string>(
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!plot) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const updateData = {
      price,
      status,
      category,
      facing,
      owner,
      description,
      gallery: [galleryInput],
    };

    await updatePlotApi(plot.plotNo, updateData);

    const updated: EnhancedPlot = {
      ...plot,
      totalPrice: price,
      enhancedStatus: status,
      category,
      facing,
      owner,
      description,
    };

    onSaveSuccess(updated);
    setIsSaving(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#0f172a',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#f59e0b" size={24} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Admin Master Editor — Plot {plot.plotNo}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {plot.block} • Direct Real-Time Database Sync
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Price Editor */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Total Plot Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#15222b',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            />
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Inventory Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnhancedPlotStatus)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#15222b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="available">🟢 Available</option>
                <option value="reserved">🟡 Reserved</option>
                <option value="booked">🔵 Booked</option>
                <option value="sold">🔴 Sold Out</option>
                <option value="unreleased">⚪ Not Released</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlotCategory)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#15222b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="Residential">🏡 Residential</option>
                <option value="Commercial">🛍️ Commercial</option>
                <option value="Corner">⭐ Corner Plot</option>
                <option value="Park Facing">🌳 Park Facing</option>
                <option value="Road Facing">🚗 Road Facing</option>
              </select>
            </div>
          </div>

          {/* Owner & Facing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Facing Direction
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value as PlotFacing)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#15222b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="East">East Facing</option>
                <option value="West">West Facing</option>
                <option value="North">North Facing</option>
                <option value="South">South Facing</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Assigned Owner / Entity
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#15222b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Property Description & USPs
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#15222b',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Gallery Image URL */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Photo Gallery Image URL
            </label>
            <input
              type="text"
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#15222b',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            background: '#0b171e',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Live Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};
