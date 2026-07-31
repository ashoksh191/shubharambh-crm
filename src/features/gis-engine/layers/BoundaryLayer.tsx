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
              fill={isOuter ? 'rgba(15, 23, 42, 0.35)' : 'rgba(56, 189, 248, 0.05)'}
              stroke={isOuter ? '#ef4444' : '#f59e0b'}
              strokeWidth={isOuter ? 4 : 2}
              strokeDasharray={isOuter ? 'none' : '8 4'}
              opacity={0.95}
              style={{
                filter: isOuter ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))' : 'none',
              }}
            />
          </g>
        );
      })}
    </g>
  );
});

BoundaryLayer.displayName = 'BoundaryLayer';
