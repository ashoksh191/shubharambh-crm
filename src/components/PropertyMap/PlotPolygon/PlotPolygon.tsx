import React, { memo } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  onSelect: (plot: EnhancedPlot) => void;
  onHover: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

export const PlotPolygon: React.FC<PlotPolygonProps> = memo(({
  plot,
  isSelected,
  isSearched,
  onSelect,
  onHover,
}) => {
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
      {/* Completely Invisible Trigger Polygon over 4K Map; Lights up ONLY on Hover or Selection */}
      <polygon
        points={plot.svgPathPoints}
        fill={isSelected ? 'rgba(56, 189, 248, 0.35)' : isSearched ? 'rgba(245, 158, 11, 0.4)' : 'transparent'}
        stroke={isSelected ? '#38bdf8' : isSearched ? '#f59e0b' : 'transparent'}
        strokeWidth={isSelected || isSearched ? 3 : 1.5}
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
