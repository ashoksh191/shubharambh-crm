import React, { memo } from 'react';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  onSelect: (plot: EnhancedPlot) => void;
  onHover: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

const STATUS_COLORS: Record<EnhancedPlotStatus, { fill: string; stroke: string; label: string }> = {
  available: { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981', label: 'Available' },
  reserved: { fill: 'rgba(245, 158, 11, 0.35)', stroke: '#f59e0b', label: 'Reserved' },
  booked: { fill: 'rgba(59, 130, 246, 0.35)', stroke: '#3b82f6', label: 'Booked' },
  sold: { fill: 'rgba(239, 68, 68, 0.35)', stroke: '#ef4444', label: 'Sold' },
  unreleased: { fill: 'rgba(100, 116, 139, 0.35)', stroke: '#64748b', label: 'Not Released' },
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
      className={`plot-polygon-group ${isSelected ? 'selected' : ''} ${isSearched ? 'searched-pulse' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(plot);
      }}
      onMouseEnter={(e) => onHover(plot, e)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Background Polygon */}
      <polygon
        points={plot.svgPathPoints}
        fill={color.fill}
        stroke={isSelected ? '#38bdf8' : isSearched ? '#f59e0b' : color.stroke}
        strokeWidth={isSelected ? 3.5 : isSearched ? 3 : 1.5}
        rx="4"
        style={{
          transition: 'all 0.2s ease',
          filter: isSelected ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' : isSearched ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))' : 'none',
        }}
      />

      {/* Plot Badge / Number */}
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

      {/* Area / Size Subtext */}
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

      {/* Pulsing Highlight Ring for Searched or Selected Plot */}
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
          className="plot-pulse-ring"
        />
      )}
    </g>
  );
});

PlotPolygon.displayName = 'PlotPolygon';
