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
              fill={isOuter ? 'rgba(15, 23, 42, 0.3)' : 'rgba(56, 189, 248, 0.04)'}
              stroke={isOuter ? '#38bdf8' : 'rgba(245, 158, 11, 0.6)'}
              strokeWidth={isOuter ? 2.5 : 1.2}
              strokeDasharray={isOuter ? 'none' : '8 4'}
              opacity={0.85}
              style={{
                filter: isOuter ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.25))' : 'none',
              }}
            />
          </g>
        );
      })}
    </g>
  );
});

BoundaryLayer.displayName = 'BoundaryLayer';
