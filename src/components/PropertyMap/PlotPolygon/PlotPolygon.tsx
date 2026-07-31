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
  onSelect,
  onHover,
}) => {
  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';
  const centerX = plot.x + plot.w / 2;
  const centerY = plot.y + plot.h / 2;

  // Determine fill, stroke, and glow filter based on interaction state
  let fill = 'rgba(16, 185, 129, 0.25)';
  let stroke = '#059669';
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
    fill = `${statusColor}55`;
    stroke = statusColor;
    strokeWidth = 2.5;
    filter = `drop-shadow(0 0 10px ${statusColor})`;
  } else {
    if (plot.enhancedStatus === 'reserved') {
      fill = 'rgba(245, 158, 11, 0.25)';
      stroke = '#d97706';
    } else if (plot.enhancedStatus === 'booked') {
      fill = 'rgba(59, 130, 246, 0.25)';
      stroke = '#2563eb';
    } else if (plot.enhancedStatus === 'sold') {
      fill = 'rgba(239, 68, 68, 0.25)';
      stroke = '#dc2626';
    }
  }

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
        onTouchStart={(e) => onHover(plot, e as any)}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSelect(plot);
        }}
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

      {/* Ultra-Sharp SVG Vector Plot Number Label (ALWAYS RENDERED WITH CRISP VECTOR CONTRAST) */}
      <text
        x={centerX}
        y={centerY + 3}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="8.5px"
        fontWeight="700"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.3px',
          paintOrder: 'stroke fill',
          stroke: '#0b0f19',
          strokeWidth: '2.5px',
          strokeLinejoin: 'round',
        }}
      >
        {plot.plotNo}
      </text>
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
