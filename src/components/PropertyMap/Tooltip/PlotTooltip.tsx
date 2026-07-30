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

  // Ensure tooltip stays within viewport bounds
  const tooltipX = Math.min(position.x + 15, window.innerWidth - 240);
  const tooltipY = Math.min(position.y + 15, window.innerHeight - 180);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${tooltipX}px`,
        top: `${tooltipY}px`,
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1.5px solid ${statusColor}`,
        borderRadius: '14px',
        padding: '12px 16px',
        boxShadow: `0 15px 35px rgba(0, 0, 0, 0.6), 0 0 15px ${statusColor}33`,
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        minWidth: '210px',
        animation: 'tooltipFade 0.15s ease-out',
      }}
    >
      {/* Plot Number & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
          <strong style={{ fontSize: '1.05rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
            Plot {plot.plotNo}
          </strong>
        </div>
        <span
          style={{
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}66`,
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {plot.enhancedStatus}
        </span>
      </div>

      {/* Property Specifications */}
      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>📐 <strong>Area:</strong> {plot.dimensions} ({plot.totalArea} sq.ft)</div>
        <div>🧭 <strong>Facing:</strong> {plot.facing} • {plot.category}</div>
        <div>💰 <strong>Price:</strong> <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>₹{plot.totalPrice.toLocaleString('en-IN')}</span> <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(₹{plot.ratePerSqFt}/sq.ft)</span></div>
        {plot.plcRate ? <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>⭐ PLC: +{plot.plcRate}% ({plot.category})</div> : null}
      </div>

      {/* Action Prompt */}
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Click to open full details</span>
        <span>→</span>
      </div>
    </div>
  );
};
