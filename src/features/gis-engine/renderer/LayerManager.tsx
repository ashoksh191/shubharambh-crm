import React, { memo } from 'react';
import type { LayerVisibilityState } from '../types/gis';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface LayerManagerProps {
  layers: LayerVisibilityState;
  onToggleLayer: (layerKey: keyof LayerVisibilityState) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = memo(({ layers, onToggleLayer }) => {
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <Layers size={15} color="#38bdf8" />
        <span>GIS Vector Layers</span>
      </div>

      <div style={listStyle}>
        <button
          onClick={() => onToggleLayer('boundary')}
          style={{ ...btnStyle, opacity: layers.boundary ? 1 : 0.55 }}
        >
          {layers.boundary ? <Eye size={14} color="#38bdf8" /> : <EyeOff size={14} color="#64748b" />}
          <span>Township Boundary</span>
        </button>

        <button
          onClick={() => onToggleLayer('roads')}
          style={{ ...btnStyle, opacity: layers.roads ? 1 : 0.55 }}
        >
          {layers.roads ? <Eye size={14} color="#f59e0b" /> : <EyeOff size={14} color="#64748b" />}
          <span>Road Network</span>
        </button>

        <button
          onClick={() => onToggleLayer('commercial')}
          style={{ ...btnStyle, opacity: layers.commercial ? 1 : 0.55 }}
        >
          {layers.commercial ? <Eye size={14} color="#8b5cf6" /> : <EyeOff size={14} color="#64748b" />}
          <span>Commercial Zones</span>
        </button>

        <button
          onClick={() => onToggleLayer('parks')}
          style={{ ...btnStyle, opacity: layers.parks ? 1 : 0.55 }}
        >
          {layers.parks ? <Eye size={14} color="#10b981" /> : <EyeOff size={14} color="#64748b" />}
          <span>Parks & Amenities</span>
        </button>
      </div>
    </div>
  );
});

LayerManager.displayName = 'LayerManager';

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 30,
  background: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '14px',
  padding: '12px 14px',
  color: '#ffffff',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
};

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  fontWeight: 700,
  marginBottom: '10px',
  color: '#cbd5e1',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '6px 10px',
  color: '#ffffff',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
