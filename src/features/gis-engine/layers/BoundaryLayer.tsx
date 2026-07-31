import React, { memo } from 'react';
import type { BoundaryFeature } from '../types/gis';

interface BoundaryLayerProps {
  boundaries: BoundaryFeature[];
  visible: boolean;
}

export const BoundaryLayer: React.FC<BoundaryLayerProps> = memo(({ boundaries, visible }) => {
  if (!visible || !boundaries.length) return null;

  return (
    <g className="gis-boundary-layer" style={{ pointerEvents: 'none' }}>
      {boundaries.map((b) => {
        const pointsStr = b.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const isOuter = b.boundaryType === 'Outer Township Boundary';

        return (
          <g key={b.id} className="boundary-group">
            <polygon
              points={pointsStr}
              fill={isOuter ? 'rgba(15, 23, 42, 0.4)' : 'rgba(56, 189, 248, 0.05)'}
              stroke={isOuter ? '#38bdf8' : '#f59e0b'}
              strokeWidth={isOuter ? 3 : 1.5}
              strokeDasharray={isOuter ? 'none' : '6 4'}
              opacity={0.85}
            />
          </g>
        );
      })}
    </g>
  );
});

BoundaryLayer.displayName = 'BoundaryLayer';
