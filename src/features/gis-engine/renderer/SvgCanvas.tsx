import React, { memo } from 'react';
import type { RoadFeature, ParkFeature, CommercialFeature, BoundaryFeature, LayerVisibilityState } from '../types/gis';
import { BoundaryLayer } from '../layers/BoundaryLayer';
import { FutureExpansionLayer } from '../layers/FutureExpansionLayer';
import { ExpresswayLayer } from '../layers/ExpresswayLayer';
import { RoadLayer } from '../layers/RoadLayer';
import { ParkLayer } from '../layers/ParkLayer';
import { CommercialLayer } from '../layers/CommercialLayer';
import { MixedLandUseLayer } from '../layers/MixedLandUseLayer';
import { WaterBodyLayer } from '../layers/WaterBodyLayer';
import { PlotLayer } from '../layers/PlotLayer';
import { LabelLayer } from '../layers/LabelLayer';

import futureExpansionData from '../data/futureExpansion.json';
import expresswayData from '../data/expressway.json';
import mixedLandUseData from '../data/mixedLandUse.json';
import waterBodiesData from '../data/waterBodies.json';

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
      {/* Layer 0: Base Canvas & Subtle Grid */}
      <rect x="0" y="0" width="2384" height="1684" fill="#0b0f19" style={{ pointerEvents: 'none' }} />
      <defs>
        <pattern id="gis-grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="2384" height="1684" fill="url(#gis-grid-pattern)" style={{ pointerEvents: 'none' }} />

      {/* ═══ PRODUCTION VECTOR BASE MAP HIERARCHY ═══ */}

      {/* 1. Township Outer Boundary */}
      <BoundaryLayer boundaries={boundaries} visible={layers.boundary} />

      {/* 2. Future Expansion Zones (hatched background context) */}
      <FutureExpansionLayer features={futureExpansionData as any[]} visible={layers.boundary} />

      {/* 3. Purvanchal Expressway */}
      <ExpresswayLayer features={expresswayData as any[]} visible={layers.roads} />

      {/* 4. Road Network Corridors */}
      <RoadLayer roads={roads} visible={layers.roads} />

      {/* 5. Central Parks & Amenity Spans */}
      <ParkLayer parks={parks} visible={layers.parks} />

      {/* 6. Commercial Hub & Retail Reserves */}
      <CommercialLayer commercialAreas={commercialAreas} visible={layers.commercial} />

      {/* 7. Mixed Land Use — Community, Education, Healthcare, Sports */}
      <MixedLandUseLayer features={mixedLandUseData as any[]} visible={layers.commercial} />

      {/* 8. Water Bodies — Lakes & Reservoirs */}
      <WaterBodyLayer features={waterBodiesData as any[]} visible={layers.parks} />

      {/* 9. Production Plot Polygons */}
      <PlotLayer visible={layers.plots !== false} />

      {/* 10. Adaptive Level-of-Detail Labels */}
      <LabelLayer scale={scale} visible={true} />

      {/* 11. Township Title Cartouche */}
      <g className="gis-township-title" style={{ pointerEvents: 'none' }}>
        <text
          x="1192"
          y="1665"
          fill="#94a3b8"
          fontSize="10px"
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '3px', textTransform: 'uppercase' }}
        >
          SHUBHARAMBH GREEN CITY — TOWNSHIP MASTER PLAN
        </text>
      </g>
    </svg>
  );
});

SvgCanvas.displayName = 'SvgCanvas';
