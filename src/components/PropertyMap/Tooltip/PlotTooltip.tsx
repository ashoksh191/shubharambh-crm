import React from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';

interface PlotTooltipProps {
  plot: EnhancedPlot | null;
  position: { x: number; y: number } | null;
}

export const PlotTooltip: React.FC<PlotTooltipProps> = ({ plot, position }) => {
  if (!plot || !position) return null;

  const STATUS_COLORS: Record<string, string> = {
    available: '#10b981',
    reserved: '#f59e0b',
    booked: '#3b82f6',
    sold: '#ef4444',
    unreleased: '#64748b',
  };

  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
        zIndex: 99999,
        pointerEvents: 'none',
        background: '#0f172a',
        border: `1.5px solid ${statusColor}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        minWidth: '180px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Plot {plot.plotNo}</strong>
        <span
          style={{
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}`,
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          {plot.enhancedStatus}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div>📐 <strong>Area:</strong> {plot.dimensions} ({plot.totalArea} sq.ft)</div>
        <div>🧭 <strong>Facing:</strong> {plot.facing} • {plot.category}</div>
        <div>💰 <strong>Price:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>₹{plot.totalPrice.toLocaleString('en-IN')}</span></div>
        {plot.plcRate ? <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⭐ PLC: +{plot.plcRate}% ({plot.category})</div> : null}
      </div>
    </div>
  );
};
