import React, { memo } from 'react';
import type { RoadFeature } from '../types/gis';

interface RoadLayerProps {
  roads: RoadFeature[];
  visible: boolean;
}

export const RoadLayer: React.FC<RoadLayerProps> = memo(({ roads, visible }) => {
  if (!visible || !roads.length) return null;

  return (
    <g className="gis-roads-layer" style={{ pointerEvents: 'none' }}>
      {roads.map((road) => {
        const polyPointsStr = road.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const centerLinePointsStr = road.centerLine.map(([x, y]) => `${x},${y}`).join(' ');
        const isMainBoulevard = road.widthFt >= 50;

        return (
          <g key={road.id} className="road-group">
            {/* Road Corridor Polygon Surface */}
            <polygon
              points={polyPointsStr}
              fill={isMainBoulevard ? 'rgba(30, 41, 59, 0.9)' : 'rgba(51, 65, 85, 0.75)'}
              stroke={isMainBoulevard ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isMainBoulevard ? 1.5 : 1.0}
              opacity={0.9}
            />

            {/* Centerline Divider Marking */}
            <polyline
              points={centerLinePointsStr}
              fill="none"
              stroke={isMainBoulevard ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.7}
            />
          </g>
        );
      })}
    </g>
  );
});

RoadLayer.displayName = 'RoadLayer';
