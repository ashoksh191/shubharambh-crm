import React, { memo } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  isHovered?: boolean;
  showLabels?: boolean;
  isZoomedIn?: boolean;
  onSelect: (plot: EnhancedPlot) => void;
  onHover: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

const STATUS_COLORS: Record<string, string> = {
  available: '#10b981',
  reserved: '#f59e0b',
  booked: '#3b82f6',
  sold: '#ef4444',
  unreleased: '#64748b',
};

export const PlotPolygon: React.FC<PlotPolygonProps> = memo(({
  plot,
  isSelected,
  isSearched,
  isHovered = false,
  showLabels = false,
  isZoomedIn = false,
  onSelect,
  onHover,
}) => {
  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';
  const centerX = plot.x + plot.w / 2;
  const centerY = plot.y + plot.h / 2;

  // Determine fill, stroke, and glow filter based on interaction state
  let fill = 'rgba(16, 185, 129, 0.12)';
  let stroke = 'rgba(16, 185, 129, 0.4)';
  let strokeWidth = 1.2;
  let filter = 'none';

  if (isSelected) {
    fill = 'rgba(56, 189, 248, 0.45)';
    stroke = '#38bdf8';
    strokeWidth = 3.0;
    filter = 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.95))';
  } else if (isSearched) {
    fill = 'rgba(245, 158, 11, 0.5)';
    stroke = '#f59e0b';
    strokeWidth = 3.0;
    filter = 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.95))';
  } else if (isHovered) {
    fill = `${statusColor}44`;
    stroke = statusColor;
    strokeWidth = 2.5;
    filter = `drop-shadow(0 0 10px ${statusColor})`;
  } else {
    if (plot.enhancedStatus === 'reserved') {
      fill = 'rgba(245, 158, 11, 0.15)';
      stroke = 'rgba(245, 158, 11, 0.5)';
    } else if (plot.enhancedStatus === 'booked') {
      fill = 'rgba(59, 130, 246, 0.18)';
      stroke = 'rgba(59, 130, 246, 0.5)';
    } else if (plot.enhancedStatus === 'sold') {
      fill = 'rgba(239, 68, 68, 0.2)';
      stroke = 'rgba(239, 68, 68, 0.5)';
    }
  }

  const shouldRenderLabel = showLabels || isZoomedIn;

  return (
    <g
      className={`plot-polygon-group ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Plot ${plot.plotNo}, Block ${plot.block}, Status ${plot.enhancedStatus}`}
      style={{ outline: 'none' }}
    >
      {/* Dynamic SVG Vector Polygon element for Plot geometry */}
      <polygon
        points={plot.svgPathPoints}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(plot);
        }}
        onMouseEnter={(e) => onHover(plot, e)}
        onMouseLeave={() => onHover(null)}
        onFocus={(e) => onHover(plot, e as any)}
        onBlur={() => onHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(plot);
          }
        }}
        style={{
          cursor: 'pointer',
          transition: 'fill 0.15s ease, stroke 0.15s ease, stroke-width 0.15s ease',
          filter,
          pointerEvents: 'visiblePainted',
        }}
      />

      {/* Searched or Selected Focus Ring */}
      {(isSelected || isSearched) && (
        <polygon
          points={plot.svgPathPoints}
          fill="none"
          stroke={isSelected ? '#38bdf8' : '#f59e0b'}
          strokeWidth="2.5"
          strokeDasharray="4 4"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Status Center Marker Dot */}
      {(isHovered || isSelected || isSearched) && (
        <circle
          cx={centerX}
          cy={centerY}
          r={isSelected ? 5 : 3.5}
          fill={statusColor}
          stroke="#ffffff"
          strokeWidth="1.2"
          style={{
            pointerEvents: 'none',
            filter: `drop-shadow(0 0 6px ${statusColor})`,
          }}
        />
      )}

      {/* Dynamic Zoom Plot Number Label */}
      {shouldRenderLabel && (
        <text
          x={centerX}
          y={centerY + 3}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="9"
          fontWeight="700"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
          }}
        >
          {plot.plotNo}
        </text>
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.plot.id === nextProps.plot.id &&
    prevProps.plot.enhancedStatus === nextProps.plot.enhancedStatus &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSearched === nextProps.isSearched &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.showLabels === nextProps.showLabels &&
    prevProps.isZoomedIn === nextProps.isZoomedIn
  );
});

PlotPolygon.displayName = 'PlotPolygon';
