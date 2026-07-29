import React, { memo } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  onSelect: (plot: EnhancedPlot) => void;
  onHover: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

const STATUS_COLORS: Record<EnhancedPlotStatus, { fill: string; stroke: string }> = {
  available: { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981' },
  reserved: { fill: 'rgba(245, 158, 11, 0.35)', stroke: '#f59e0b' },
  booked: { fill: 'rgba(59, 130, 246, 0.35)', stroke: '#3b82f6' },
  sold: { fill: 'rgba(239, 68, 68, 0.35)', stroke: '#ef4444' },
  unreleased: { fill: 'rgba(100, 116, 139, 0.35)', stroke: '#64748b' },
};

export const PlotPolygon: React.FC<PlotPolygonProps> = memo(({
  plot,
  isSelected,
  isSearched,
  onSelect,
  onHover,
}) => {
  const color = STATUS_COLORS[plot.enhancedStatus] || STATUS_COLORS.available;

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
      {/* Background Polygon */}
      <polygon
        points={plot.svgPathPoints}
        fill={color.fill}
        stroke={isSelected ? '#38bdf8' : isSearched ? '#f59e0b' : color.stroke}
        strokeWidth={isSelected ? 3.5 : isSearched ? 3 : 1.5}
        rx="4"
        style={{
          filter: isSelected
            ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))'
            : isSearched
            ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))'
            : 'none',
        }}
      />

      {/* Plot Number */}
      <text
        x={plot.x + plot.w / 2}
        y={plot.y + plot.h / 2 - 3}
        fill="#ffffff"
        fontSize="11"
        fontWeight="800"
        textAnchor="middle"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {plot.plotNo}
      </text>

      {/* Dimensions Subtext */}
      <text
        x={plot.x + plot.w / 2}
        y={plot.y + plot.h / 2 + 10}
        fill={isSelected ? '#38bdf8' : '#94a3b8'}
        fontSize="8.5"
        fontWeight="600"
        textAnchor="middle"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {plot.dimensions}
      </text>

      {/* Searched or Selected Highlight Ring */}
      {(isSelected || isSearched) && (
        <rect
          x={plot.x - 3}
          y={plot.y - 3}
          width={plot.w + 6}
          height={plot.h + 6}
          rx="8"
          fill="none"
          stroke={isSelected ? '#38bdf8' : '#f59e0b'}
          strokeWidth="2"
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
