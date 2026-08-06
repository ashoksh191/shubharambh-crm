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
  const [galleryInput] = useState<string>(
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
        background: 'rgba(4, 25, 19, 0.82)',
        backdropFilter: 'blur(16px)',
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
          background: 'rgba(7, 41, 31, 0.95)',
          border: '1px solid #D4AF37',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: '#07291F',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#D4AF37" size={24} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Admin Master Editor — Plot {plot.plotNo}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#E8C96A' }}>
                {plot.block} • Direct Real-Time Database Sync
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A3B1AC', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Price Editor */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                background: 'rgba(4, 25, 19, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Inventory Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnhancedPlotStatus)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#07291F',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="available">🟢 Available (Forest Green)</option>
                <option value="reserved">🟡 Reserved (Gold)</option>
                <option value="booked">🔴 Booked (Burgundy)</option>
                <option value="sold">⚪ Sold (Slate Gray)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Category Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlotCategory)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#07291F',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Corner">Corner Premium</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Road Facing Direction
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value as PlotFacing)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#07291F',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="North-East">North-East</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Legal Entity Owner
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(4, 25, 19, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#A3B1AC', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Architectural Description & Key Features
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(4, 25, 19, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: '16px 24px',
            background: '#07291F',
            borderTop: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#07291F',
              border: '1px solid #D4AF37',
              fontWeight: 800,
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
              background: '#07291F',
              color: '#ffffff',
              border: '1px solid #D4AF37',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Save size={16} color="#D4AF37" /> {isSaving ? 'Saving...' : 'Save & Live Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};
