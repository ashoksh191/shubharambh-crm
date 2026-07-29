import React, { memo } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  onSelect: (plot: EnhancedPlot) => void;
  onHover: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

const STATUS_STROKES: Record<EnhancedPlotStatus, string> = {
  available: '#10b981',
  reserved: '#f59e0b',
  booked: '#3b82f6',
  sold: '#ef4444',
  unreleased: '#64748b',
};

const STATUS_FILLS: Record<EnhancedPlotStatus, string> = {
  available: 'rgba(16, 185, 129, 0.18)',
  reserved: 'rgba(245, 158, 11, 0.25)',
  booked: 'rgba(59, 130, 246, 0.25)',
  sold: 'rgba(239, 68, 68, 0.25)',
  unreleased: 'rgba(100, 116, 139, 0.25)',
};

export const PlotPolygon: React.FC<PlotPolygonProps> = memo(({
  plot,
  isSelected,
  isSearched,
  onSelect,
  onHover,
}) => {
  const strokeColor = STATUS_STROKES[plot.enhancedStatus] || STATUS_STROKES.available;
  const fillColor = STATUS_FILLS[plot.enhancedStatus] || STATUS_FILLS.available;

  return (
    <g
      className={`plot-polygon-group ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(plot);
      }}
      onMouseEnter={(e) => onHover(plot, e)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      {/* Clickable Vector Polygon Overlaid on 4K PDF Map */}
      <polygon
        points={plot.svgPathPoints}
        fill={isSelected ? 'rgba(56, 189, 248, 0.35)' : isSearched ? 'rgba(245, 158, 11, 0.4)' : fillColor}
        stroke={isSelected ? '#38bdf8' : isSearched ? '#f59e0b' : strokeColor}
        strokeWidth={isSelected ? 3 : isSearched ? 3 : 1.2}
        style={{
          transition: 'all 0.15s ease',
          filter: isSelected
            ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))'
            : isSearched
            ? 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.9))'
            : 'none',
        }}
      />

      {/* Searched or Selected Highlight Box Ring */}
      {(isSelected || isSearched) && (
        <rect
          x={plot.x - 2}
          y={plot.y - 2}
          width={plot.w + 4}
          height={plot.h + 4}
          rx="4"
          fill="none"
          stroke={isSelected ? '#38bdf8' : '#f59e0b'}
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.plot.id === nextProps.plot.id &&
    prevProps.plot.enhancedStatus === nextProps.plot.enhancedStatus &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSearched === nextProps.isSearched
  );
});

PlotPolygon.displayName = 'PlotPolygon';
