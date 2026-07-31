import React, { memo, useCallback } from 'react';
import type { PlotFeature, PlotStatus } from '../types/gis';
import { formatSvgPoints } from '../utils/polygon';
import defaultPlotData from '../../../data/plots.generated.json';

interface PlotLayerProps {
  plots?: Record<string, PlotFeature> | PlotFeature[];
  selectedPlotId?: string | null;
  hoveredPlotId?: string | null;
  visible?: boolean;
  onSelectPlot?: (plotId: string, plot: PlotFeature) => void;
  onHoverPlot?: (plotId: string | null, e?: React.MouseEvent) => void;
}

const STATUS_COLORS: Record<PlotStatus, string> = {
  available: '#10b981',
  reserved: '#f59e0b',
  booked: '#3b82f6',
  sold: '#ef4444',
  unreleased: '#64748b',
};

const SinglePlotItem = memo(({
  plotId,
  plot,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  plotId: string;
  plot: PlotFeature;
  isSelected: boolean;
  isHovered: boolean;
  onSelect?: (plotId: string, plot: PlotFeature) => void;
  onHover?: (plotId: string | null, e?: React.MouseEvent) => void;
}) => {
  const status: PlotStatus = (plot.status as PlotStatus) || 'available';
  const statusColor = STATUS_COLORS[status] || '#10b981';

  let fill = 'rgba(16, 185, 129, 0.14)';
  let stroke = 'rgba(16, 185, 129, 0.45)';
  let strokeWidth = 1.2;
  let filter = 'none';

  if (isSelected) {
    fill = 'rgba(56, 189, 248, 0.45)';
    stroke = '#38bdf8';
    strokeWidth = 3.0;
    filter = 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.95))';
  } else if (isHovered) {
    fill = `${statusColor}44`;
    stroke = statusColor;
    strokeWidth = 2.5;
    filter = `drop-shadow(0 0 10px ${statusColor})`;
  } else {
    if (status === 'reserved') {
      fill = 'rgba(245, 158, 11, 0.15)';
      stroke = 'rgba(245, 158, 11, 0.5)';
    } else if (status === 'booked') {
      fill = 'rgba(59, 130, 246, 0.18)';
      stroke = 'rgba(59, 130, 246, 0.5)';
    } else if (status === 'sold') {
      fill = 'rgba(239, 68, 68, 0.2)';
      stroke = 'rgba(239, 68, 68, 0.5)';
    } else if (status === 'unreleased') {
      fill = 'rgba(100, 116, 139, 0.15)';
      stroke = 'rgba(100, 116, 139, 0.4)';
    }
  }

  const pointsStr = formatSvgPoints(plot.polygon);
  if (!pointsStr) return null;

  return (
    <g
      className={`gis-plot-group ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Plot ${plot.plotNo || plotId}, Status ${status}`}
      style={{ outline: 'none' }}
    >
      <polygon
        points={pointsStr}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(plotId, plot);
        }}
        onMouseEnter={(e) => onHover?.(plotId, e)}
        onMouseLeave={() => onHover?.(null)}
        onTouchStart={(e) => {
          onHover?.(plotId, e as any);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSelect?.(plotId, plot);
        }}
        onFocus={(e) => onHover?.(plotId, e as any)}
        onBlur={() => onHover?.(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(plotId, plot);
          }
        }}
        style={{
          cursor: 'pointer',
          transition: 'fill 0.15s ease, stroke 0.15s ease, stroke-width 0.15s ease',
          filter,
          pointerEvents: 'visiblePainted',
        }}
      />

      {/* Selected Focus Indicator Ring */}
      {isSelected && (
        <polygon
          points={pointsStr}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
});

SinglePlotItem.displayName = 'SinglePlotItem';

export const PlotLayer: React.FC<PlotLayerProps> = memo(({
  plots,
  selectedPlotId = null,
  hoveredPlotId = null,
  visible = true,
  onSelectPlot,
  onHoverPlot,
}) => {
  const plotDataset = plots || (defaultPlotData as unknown as Record<string, PlotFeature>);

  const handleSelect = useCallback((id: string, plot: PlotFeature) => {
    onSelectPlot?.(id, plot);
  }, [onSelectPlot]);

  const handleHover = useCallback((id: string | null, e?: React.MouseEvent) => {
    onHoverPlot?.(id, e);
  }, [onHoverPlot]);

  if (!visible || !plotDataset) return null;

  const entries: [string, PlotFeature][] = Array.isArray(plotDataset)
    ? plotDataset.map((p) => [p.id, p])
    : Object.entries(plotDataset);

  return (
    <g className="gis-plots-layer">
      {entries.map(([id, plot]) => (
        <SinglePlotItem
          key={id}
          plotId={id}
          plot={plot}
          isSelected={selectedPlotId === id}
          isHovered={hoveredPlotId === id}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      ))}
    </g>
  );
});

PlotLayer.displayName = 'PlotLayer';
