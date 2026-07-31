import React, { memo } from 'react';
import type { ParkFeature } from '../types/gis';

interface ParkLayerProps {
  parks: ParkFeature[];
  visible: boolean;
}

export const ParkLayer: React.FC<ParkLayerProps> = memo(({ parks, visible }) => {
  if (!visible || !parks.length) return null;

  return (
    <g className="gis-parks-layer" style={{ pointerEvents: 'none' }}>
      {parks.map((park) => {
        const pointsStr = park.polygon.map(([x, y]) => `${x},${y}`).join(' ');

        return (
          <g key={park.id} className="park-group">
            <polygon
              points={pointsStr}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth={1.8}
              opacity={0.88}
            />
          </g>
        );
      })}
    </g>
  );
});

ParkLayer.displayName = 'ParkLayer';
