import React, { memo } from 'react';
import type { RoadFeature, ParkFeature, CommercialFeature, BoundaryFeature, LayerVisibilityState, GisRenderMode } from '../types/gis';
import type { EnhancedPlot } from '../../../types/propertyMap';
import { BoundaryLayer } from '../layers/BoundaryLayer';
import { RoadLayer } from '../layers/RoadLayer';
import { CommercialLayer } from '../layers/CommercialLayer';
import { ParkLayer } from '../layers/ParkLayer';
import { PlotLayer } from '../layers/PlotLayer';
import { LabelLayer } from '../layers/LabelLayer';
import { PlotPolygon } from '../../../components/PropertyMap/PlotPolygon/PlotPolygon';

import defaultRoadsData from '../data/roads.json';
import defaultParksData from '../data/parks.json';
import defaultCommercialData from '../data/commercial.json';
import defaultBoundariesData from '../data/boundaries.json';

export interface SvgCanvasProps {
  mode?: GisRenderMode;
  roads?: RoadFeature[];
  parks?: ParkFeature[];
  commercialAreas?: CommercialFeature[];
  boundaries?: BoundaryFeature[];
  layers?: LayerVisibilityState;
  scale?: number;
  showBlueprintImage?: boolean;
  plots?: EnhancedPlot[];
  selectedPlot?: EnhancedPlot | null;
  searchedPlot?: EnhancedPlot | null;
  hoveredPlot?: EnhancedPlot | null;
  showLabels?: boolean;
  isZoomedIn?: boolean;
  onSelectPlot?: (plot: EnhancedPlot) => void;
  onHoverPlot?: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

export const SvgCanvas: React.FC<SvgCanvasProps> = memo(({
  mode = 'production',
  roads = defaultRoadsData as unknown as RoadFeature[],
  parks = defaultParksData as unknown as ParkFeature[],
  commercialAreas = defaultCommercialData as unknown as CommercialFeature[],
  boundaries = defaultBoundariesData as unknown as BoundaryFeature[],
  layers = { boundary: true, roads: true, commercial: true, parks: true, plots: true },
  scale = 1.0,
  showBlueprintImage = true,
  plots = [],
  selectedPlot = null,
  searchedPlot = null,
  hoveredPlot = null,
  showLabels = false,
  isZoomedIn = false,
  onSelectPlot = () => {},
  onHoverPlot = () => {},
}) => {
  const baseAssetUrl = (import.meta.env.BASE_URL || './').replace(/\/+$/, '');
  const svgBlueprintUrl = `${baseAssetUrl}/assets/layout_plan_master.svg`;
  const pngBlueprintUrl = `${baseAssetUrl}/assets/layout_map_hd.png`;

  return (
    <svg
      viewBox="0 0 2384 1684"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        shapeRendering: 'geometricPrecision',
        background: '#0b0f19',
      }}
    >
      {/* Base Canvas & Background Grid */}
      <rect x="0" y="0" width="2384" height="1684" fill="#0b0f19" style={{ pointerEvents: 'none' }} />
      <defs>
        <pattern id="gis-grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="2384" height="1684" fill="url(#gis-grid-pattern)" style={{ pointerEvents: 'none' }} />

      {/* ═══ PRODUCTION MODE ═══ */}
      {mode === 'production' && (
        <>
          {/* Master Architectural Layout Blueprint Base Overlay */}
          <image
            href={svgBlueprintUrl}
            x="0"
            y="0"
            width="2384"
            height="1684"
            preserveAspectRatio="none"
            style={{ pointerEvents: 'none' }}
            opacity={showBlueprintImage ? 0.85 : 0.40}
            onError={(e) => {
              (e.currentTarget as SVGImageElement).setAttribute('href', pngBlueprintUrl);
            }}
          />

          {/* Interactive Plot Polygons Layer */}
          <g className="plots-layer">
            {plots.map((plot) => (
              <PlotPolygon
                key={plot.id}
                plot={plot}
                isSelected={selectedPlot?.id === plot.id}
                isSearched={searchedPlot?.id === plot.id}
                isHovered={hoveredPlot?.id === plot.id}
                showLabels={showLabels}
                isZoomedIn={isZoomedIn}
                onSelect={onSelectPlot}
                onHover={onHoverPlot}
              />
            ))}
          </g>

          {/* Adaptive Level-of-Detail Labels Layer */}
          <LabelLayer scale={scale} visible={true} />
        </>
      )}

      {/* ═══ DEVELOPER MODE ═══ */}
      {mode === 'developer' && (
        <>
          {/* 1. Township Outer Boundary Layer */}
          <BoundaryLayer boundaries={boundaries} visible={layers.boundary} />

          {/* 2. Central Parks & Amenity Spans Layer */}
          <ParkLayer parks={parks} visible={layers.parks} />

          {/* 3. Commercial Reserves Layer */}
          <CommercialLayer commercialAreas={commercialAreas} visible={layers.commercial} />

          {/* 4. Road Network Corridors Layer */}
          <RoadLayer roads={roads} visible={layers.roads} />

          {/* 5. Production Plot Layer */}
          {plots.length > 0 ? (
            <g className="plots-layer">
              {plots.map((plot) => (
                <PlotPolygon
                  key={plot.id}
                  plot={plot}
                  isSelected={selectedPlot?.id === plot.id}
                  isSearched={searchedPlot?.id === plot.id}
                  isHovered={hoveredPlot?.id === plot.id}
                  showLabels={showLabels}
                  isZoomedIn={isZoomedIn}
                  onSelect={onSelectPlot}
                  onHover={onHoverPlot}
                />
              ))}
            </g>
          ) : (
            <PlotLayer visible={layers.plots !== false} />
          )}

          {/* 6. Adaptive Level-of-Detail Labels Layer */}
          <LabelLayer scale={scale} visible={true} />
        </>
      )}
    </svg>
  );
});

SvgCanvas.displayName = 'SvgCanvas';
