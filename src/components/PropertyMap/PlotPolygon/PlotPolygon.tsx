import React, { memo } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';

interface PlotPolygonProps {
  plot: EnhancedPlot;
  isSelected: boolean;
  isSearched: boolean;
  isHovered?: boolean;
  showLabels?: boolean;
  zoomScale?: number;
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
  zoomScale = 1,
  onSelect,
  onHover,
}) => {
  const statusColor = STATUS_COLORS[plot.enhancedStatus] || '#10b981';
  const centerX = plot.x + plot.w / 2;
  const centerY = plot.y + plot.h / 2;

  // Determine fill, stroke, and glow filter based on state
  let fill = 'transparent';
  let stroke = 'transparent';
  let strokeWidth = 1.5;
  let filter = 'none';

  if (isSelected) {
    fill = 'rgba(56, 189, 248, 0.4)';
    stroke = '#38bdf8';
    strokeWidth = 3.5;
    filter = 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.95))';
  } else if (isSearched) {
    fill = 'rgba(245, 158, 11, 0.45)';
    stroke = '#f59e0b';
    strokeWidth = 3.5;
    filter = 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.95))';
  } else if (isHovered) {
    fill = `${statusColor}33`; // 20% opacity translucent fill
    stroke = statusColor;
    strokeWidth = 2.5;
    filter = `drop-shadow(0 0 10px ${statusColor})`;
  }

  const shouldRenderLabel = showLabels || zoomScale >= 1.4;

  return (
    <g
      className={`plot-polygon-group ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
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
      tabIndex={0}
      role="button"
      aria-label={`Plot ${plot.plotNo}, Block ${plot.block}, Status ${plot.enhancedStatus}, Dimensions ${plot.dimensions}, Price ₹${plot.totalPrice.toLocaleString('en-IN')}`}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* Dynamic Trigger Polygon over 4K Map */}
      <polygon
        points={plot.svgPathPoints}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{
          transition: 'fill 0.15s ease, stroke 0.15s ease, stroke-width 0.15s ease',
          filter,
        }}
      />

      {/* Searched or Selected Dashed Focus Ring */}
      {(isSelected || isSearched) && (
        <rect
          x={plot.x - 3}
          y={plot.y - 3}
          width={plot.w + 6}
          height={plot.h + 6}
          rx="5"
          fill="none"
          stroke={isSelected ? '#38bdf8' : '#f59e0b'}
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />
      )}

      {/* Status Center Pulse Marker Dot */}
      {(isHovered || isSelected || isSearched) && (
        <circle
          cx={centerX}
          cy={centerY}
          r={isSelected ? 6 : 4}
          fill={statusColor}
          stroke="#ffffff"
          strokeWidth="1.5"
          style={{
            pointerEvents: 'none',
            filter: `drop-shadow(0 0 6px ${statusColor})`,
          }}
        />
      )}

      {/* Optional or Dynamic Zoom Plot Number Label */}
      {shouldRenderLabel && (
        <text
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={zoomScale >= 2.5 ? '13' : '11'}
          fontWeight="800"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px #000000',
            letterSpacing: '-0.02em',
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
    prevProps.zoomScale === nextProps.zoomScale
  );
});

PlotPolygon.displayName = 'PlotPolygon';
