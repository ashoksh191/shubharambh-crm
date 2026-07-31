import React, { useState, useMemo, useCallback } from 'react';
import type { RoadFeature, ParkFeature, CommercialFeature, BoundaryFeature, PlotFeature } from '../types/gis';
import { useLayerVisibility } from '../hooks/useLayerVisibility';
import { useSpatialSelection } from '../hooks/useSpatialSelection';
import { Viewport } from './Viewport';
import { LayerManager } from './LayerManager';
import { SvgCanvas } from './SvgCanvas';
import { PlotTooltip } from '../components/PlotTooltip';
import defaultPlotData from '../../../data/plots.generated.json';
import roadsData from '../data/roads.json';
import parksData from '../data/parks.json';
import commercialData from '../data/commercial.json';
import boundariesData from '../data/boundaries.json';

interface InteractiveGisCanvasProps {
  plots?: Record<string, PlotFeature>;
  roads?: RoadFeature[];
  parks?: ParkFeature[];
  commercialAreas?: CommercialFeature[];
  boundaries?: BoundaryFeature[];
  onPlotSelected?: (plot: PlotFeature | null) => void;
}

export const InteractiveGisCanvas: React.FC<InteractiveGisCanvasProps> = ({
  plots = defaultPlotData as unknown as Record<string, PlotFeature>,
  roads = roadsData as unknown as RoadFeature[],
  parks = parksData as unknown as ParkFeature[],
  commercialAreas = commercialData as unknown as CommercialFeature[],
  boundaries = boundariesData as unknown as BoundaryFeature[],
  onPlotSelected,
}) => {
  const { layers, toggleLayer } = useLayerVisibility({ plots: true });
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [viewportScale, setViewportScale] = useState<number>(1.0);

  // Memoize plot array for spatial indexing
  const plotItems = useMemo(() => {
    return Object.entries(plots).map(([id, p]) => ({
      id,
      polygon: p.polygon,
      data: p,
    }));
  }, [plots]);

  const handleSelectCallback = useCallback(
    (item: { id: string; data?: PlotFeature } | null) => {
      onPlotSelected?.(item?.data || null);
    },
    [onPlotSelected]
  );

  // Quadtree-accelerated spatial selection hook
  const {
    selectedItem: _selectedItem,
    hoveredItem,
    clearSelection,
  } = useSpatialSelection<PlotFeature>(plotItems, handleSelectCallback);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleTransformChange = useCallback((scale: number) => {
    setViewportScale(scale);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '650px', userSelect: 'none' }}
    >
      <LayerManager layers={layers} onToggleLayer={toggleLayer} />

      <Viewport onTransformChange={handleTransformChange}>
        <div style={{ width: '100%', height: '100%' }} onClick={() => clearSelection()}>
          <SvgCanvas
            roads={roads}
            parks={parks}
            commercialAreas={commercialAreas}
            boundaries={boundaries}
            layers={layers}
            scale={viewportScale}
          />
        </div>
      </Viewport>

      {/* Floating Hover Tooltip HUD */}
      <PlotTooltip
        plot={hoveredItem?.data || null}
        position={hoverPosition}
      />
    </div>
  );
};
