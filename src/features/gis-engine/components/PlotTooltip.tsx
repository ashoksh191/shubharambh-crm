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
        left: `${position.x + 16}px`,
        top: `${position.y + 16}px`,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#ffffff',
        pointerEvents: 'none',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
        fontSize: '0.78rem',
        minWidth: '170px',
        maxWidth: '220px',
        transition: 'opacity 150ms ease',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>
          Plot {plot.plotNo || plot.id}
        </span>
        <span
          style={{
            background: `${statusColor}18`,
            border: `1px solid ${statusColor}60`,
            color: statusColor,
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.62rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {status}
        </span>
      </div>

      {/* Detail Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: '#cbd5e1', fontSize: '0.72rem' }}>
        <div><span style={{ color: '#64748b', fontWeight: 600 }}>Block </span>{plot.block || 'Block A'}</div>
        <div><span style={{ color: '#64748b', fontWeight: 600 }}>Area </span>{area}</div>
        <div><span style={{ color: '#64748b', fontWeight: 600 }}>Facing </span>{plot.nearbyPark ? 'Park Facing' : 'East'}</div>
      </div>
    </div>
  );
});

PlotTooltip.displayName = 'PlotTooltip';
