import React, { memo } from 'react';
import type { CommercialFeature } from '../types/gis';
import { GIS_FILL_OPACITY, GIS_COLORS } from '../constants/gisConstants';

interface CommercialLayerProps {
  commercialAreas: CommercialFeature[];
  visible: boolean;
}

export const CommercialLayer: React.FC<CommercialLayerProps> = memo(({ commercialAreas, visible }) => {
  if (!visible || !commercialAreas.length) return null;

  return (
    <g className="gis-commercial-layer" style={{ pointerEvents: 'none' }}>
      {commercialAreas.map((comm) => {
        const pointsStr = comm.polygon.map(([x, y]) => `${x},${y}`).join(' ');

        return (
          <g key={comm.id} className="commercial-group">
            <polygon
              points={pointsStr}
              fill={GIS_FILL_OPACITY.commercial}
              stroke={GIS_COLORS.commercial}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              opacity={0.88}
            />
          </g>
        );
      })}
    </g>
  );
});

CommercialLayer.displayName = 'CommercialLayer';
