import React from 'react';
import type { EnhancedPlotStatus } from '../../../types/propertyMap';

interface MapLegendProps {
  counts: Record<EnhancedPlotStatus, number>;
}

export const MapLegend: React.FC<MapLegendProps> = ({ counts }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 20,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        <span>Available ({counts.available || 0})</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
        <span>Reserved ({counts.reserved || 0})</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
        <span>Booked ({counts.booked || 0})</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
        <span>Sold ({counts.sold || 0})</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#64748b' }} />
        <span>Not Released ({counts.unreleased || 0})</span>
      </div>
    </div>
  );
};
