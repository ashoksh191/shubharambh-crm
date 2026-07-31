import React, { memo } from 'react';
import type { RoadFeature, ParkFeature, CommercialFeature, BoundaryFeature, LayerVisibilityState } from '../types/gis';
import { BoundaryLayer } from '../layers/BoundaryLayer';
import { RoadLayer } from '../layers/RoadLayer';
import { CommercialLayer } from '../layers/CommercialLayer';
import { ParkLayer } from '../layers/ParkLayer';
import { PlotLayer } from '../layers/PlotLayer';
import { LabelLayer } from '../layers/LabelLayer';

interface SvgCanvasProps {
  roads: RoadFeature[];
  parks: ParkFeature[];
  commercialAreas: CommercialFeature[];
  boundaries: BoundaryFeature[];
  layers: LayerVisibilityState;
  scale?: number;
}

export const SvgCanvas: React.FC<SvgCanvasProps> = memo(({
  roads,
  parks,
  commercialAreas,
  boundaries,
  layers,
  scale = 1.0,
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
      {/* Base Canvas & Subtle Background Grid */}
      <rect x="0" y="0" width="2384" height="1684" fill="#0b0f19" style={{ pointerEvents: 'none' }} />
      <defs>
        <pattern id="gis-grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="2384" height="1684" fill="url(#gis-grid-pattern)" style={{ pointerEvents: 'none' }} />

      {/* 0. CAD Vector Master Architectural Blueprint Base Drawing */}
      <image
        href={svgBlueprintUrl}
        x="0"
        y="0"
        width="2384"
        height="1684"
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none' }}
        opacity="0.45"
        onError={(e) => {
          (e.currentTarget as SVGImageElement).setAttribute('href', pngBlueprintUrl);
        }}
      />

      {/* FAITHFUL ARCHITECTURAL VECTOR LAYERS (EXACTLY AS IN BLUEPRINT PDF) */}

      {/* 1. Township Perimeter Boundary */}
      <BoundaryLayer boundaries={boundaries} visible={layers.boundary} />

      {/* 2. Central Parks & Amenity Reserves */}
      <ParkLayer parks={parks} visible={layers.parks} />

      {/* 3. Commercial Reserves */}
      <CommercialLayer commercialAreas={commercialAreas} visible={layers.commercial} />

      {/* 4. Road Network Corridors */}
      <RoadLayer roads={roads} visible={layers.roads} />

      {/* 5. Production Plot Polygons */}
      <PlotLayer visible={layers.plots !== false} />

      {/* 6. Adaptive Level-of-Detail Vector Labels */}
      <LabelLayer scale={scale} visible={true} />
    </svg>
  );
});

SvgCanvas.displayName = 'SvgCanvas';
