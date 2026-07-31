import React, { memo } from 'react';
import type { LayerVisibilityState } from '../types/gis';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface LayerManagerProps {
  layers: LayerVisibilityState;
  onToggleLayer: (layerKey: keyof LayerVisibilityState) => void;
}

const LAYER_CONFIG: Array<{
  key: keyof LayerVisibilityState;
  label: string;
  activeColor: string;
}> = [
  { key: 'boundary', label: 'Township Boundary', activeColor: '#38bdf8' },
  { key: 'parks', label: 'Parks & Amenities', activeColor: '#059669' },
  { key: 'commercial', label: 'Commercial Zones', activeColor: '#7c3aed' },
  { key: 'roads', label: 'Road Network', activeColor: '#f8fafc' },
];

export const LayerManager: React.FC<LayerManagerProps> = memo(({ layers, onToggleLayer }) => {
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <Layers size={13} color="#38bdf8" />
        <span>Layers</span>
      </div>

      <div style={listStyle}>
        {LAYER_CONFIG.map(({ key, label, activeColor }) => {
          const isActive = layers[key];
          return (
            <button
              key={key}
              onClick={() => onToggleLayer(key)}
              style={{
                ...btnStyle,
                opacity: isActive ? 1 : 0.45,
                borderColor: isActive ? `${activeColor}30` : 'rgba(255, 255, 255, 0.06)',
              }}
            >
              {isActive
                ? <Eye size={12} color={activeColor} />
                : <EyeOff size={12} color="#475569" />
              }
              <span style={{ fontSize: '0.72rem' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

LayerManager.displayName = 'LayerManager';

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 30,
  background: 'rgba(15, 23, 42, 0.82)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '10px',
  padding: '8px 10px',
  color: '#ffffff',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
  minWidth: '150px',
};

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.72rem',
  fontWeight: 700,
  marginBottom: '6px',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '6px',
  padding: '4px 8px',
  color: '#e2e8f0',
  fontSize: '0.72rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 150ms ease, opacity 150ms ease',
  fontFamily: 'Inter, system-ui, sans-serif',
};
