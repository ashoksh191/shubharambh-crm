import React, { memo } from 'react';
import type { PlotFeature, PlotStatus } from '../types/gis';
import { GIS_COLORS } from '../constants/gisConstants';
import { formatAreaSqFt } from '../utils/geometryHelpers';

interface PlotTooltipProps {
  plot: PlotFeature | null;
  position: { x: number; y: number } | null;
}

export const PlotTooltip: React.FC<PlotTooltipProps> = memo(({ plot, position }) => {
  if (!plot || !position) return null;

  const status: PlotStatus = plot.status || 'available';
  const statusColor = GIS_COLORS[status] || GIS_COLORS.available;
  const area = plot.areaSqFt ? formatAreaSqFt(plot.areaSqFt) : '1,000 Sq Ft';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x + 14}px`,
        top: `${position.y + 14}px`,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${statusColor}`,
        borderRadius: '12px',
        padding: '10px 14px',
        color: '#ffffff',
        pointerEvents: 'none',
        boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
        fontSize: '0.82rem',
        minWidth: '180px',
        transition: 'opacity 0.1s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
          Plot {plot.plotNo || plot.id}
        </span>
        <span
          style={{
            background: `${statusColor}22`,
            border: `1px solid ${statusColor}`,
            color: statusColor,
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#cbd5e1', fontSize: '0.78rem' }}>
        <div><strong style={{ color: '#94a3b8' }}>Block:</strong> {plot.block || 'Block A'}</div>
        <div><strong style={{ color: '#94a3b8' }}>Area:</strong> {area}</div>
        <div><strong style={{ color: '#94a3b8' }}>Facing:</strong> {plot.nearbyPark ? 'Park Facing' : 'East'}</div>
      </div>
    </div>
  );
});

PlotTooltip.displayName = 'PlotTooltip';
