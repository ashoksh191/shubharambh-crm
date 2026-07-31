import React, { memo } from 'react';
import type { RoadFeature, ParkFeature, CommercialFeature, BoundaryFeature, LayerVisibilityState } from '../types/gis';
import { BoundaryLayer } from '../layers/BoundaryLayer';
import { RoadLayer } from '../layers/RoadLayer';
import { CommercialLayer } from '../layers/CommercialLayer';
import { ParkLayer } from '../layers/ParkLayer';
import { PlotLayer } from '../layers/PlotLayer';

interface SvgCanvasProps {
  roads: RoadFeature[];
  parks: ParkFeature[];
  commercialAreas: CommercialFeature[];
  boundaries: BoundaryFeature[];
  layers: LayerVisibilityState;
}

export const SvgCanvas: React.FC<SvgCanvasProps> = memo(({
  roads,
  parks,
  commercialAreas,
  boundaries,
  layers,
}) => {
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
      {/* Layer 0: Base Canvas & Grid Background */}
      <rect x="0" y="0" width="2384" height="1684" fill="#0b0f19" style={{ pointerEvents: 'none' }} />
      <defs>
        <pattern id="gis-grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="2384" height="1684" fill="url(#gis-grid-pattern)" style={{ pointerEvents: 'none' }} />

      {/* STRICT Z-INDEX RENDERING ORDER */}

      {/* 1. Township & Sector Boundaries */}
      <BoundaryLayer boundaries={boundaries} visible={layers.boundary} />

      {/* 2. Road Network Corridors */}
      <RoadLayer roads={roads} visible={layers.roads} />

      {/* 3. Commercial Hub & Retail Reserves */}
      <CommercialLayer commercialAreas={commercialAreas} visible={layers.commercial} />

      {/* 4. Central Parks & Amenity Spans */}
      <ParkLayer parks={parks} visible={layers.parks} />

      {/* 5. Production Plot Layer */}
      <PlotLayer visible={layers.plots !== false} />

      {/* 6. Future Labels & HUD Slot */}
      <g className="gis-future-labels-slot" style={{ pointerEvents: 'none' }} />
    </svg>
  );
});

SvgCanvas.displayName = 'SvgCanvas';
