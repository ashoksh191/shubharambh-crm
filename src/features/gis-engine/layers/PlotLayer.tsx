import React, { memo, useCallback } from 'react';
import type { PlotFeature, PlotStatus } from '../types/gis';
import { formatSvgPoints } from '../utils/polygon';
import { GIS_COLORS, GIS_FILL_OPACITY } from '../constants/gisConstants';
import defaultPlotData from '../../../data/plots.generated.json';

interface PlotLayerProps {
  plots?: Record<string, PlotFeature> | PlotFeature[];
  selectedPlotId?: string | null;
  hoveredPlotId?: string | null;
  visible?: boolean;
  onSelectPlot?: (plotId: string, plot: PlotFeature) => void;
  onHoverPlot?: (plotId: string | null, e?: React.MouseEvent) => void;
}

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
  const stroke = GIS_COLORS[status] || GIS_COLORS.available;
  let fill = GIS_FILL_OPACITY[status] || GIS_FILL_OPACITY.available;
  let strokeWidth = 1.2;
  let filter = 'none';

  if (isSelected) {
    fill = GIS_FILL_OPACITY.selected;
    strokeWidth = 2.5;
    filter = 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))';
  } else if (isHovered) {
    fill = 'rgba(56, 189, 248, 0.35)';
    strokeWidth = 2.0;
    filter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))';
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
        stroke={isSelected ? '#38bdf8' : stroke}
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
          transition: 'fill 150ms ease, stroke 150ms ease, stroke-width 150ms ease',
          filter,
          pointerEvents: 'visiblePainted',
        }}
      />

      {/* Selected Focus Ring */}
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
