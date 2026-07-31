import React, { memo } from 'react';
import type { CommercialFeature } from '../types/gis';

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
              fill="rgba(139, 92, 246, 0.45)"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="6 3"
              opacity={0.95}
            />
          </g>
        );
      })}
    </g>
  );
});

CommercialLayer.displayName = 'CommercialLayer';
