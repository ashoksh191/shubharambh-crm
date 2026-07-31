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
        const is50Ft = road.widthFt >= 50;
        const is40Ft = road.widthFt >= 40 && road.widthFt < 50;

        let fill = 'rgba(241, 245, 249, 0.85)';
        let stroke = '#cbd5e1';
        let strokeWidth = 1.0;
        let dividerColor = '#94a3b8';

        if (is50Ft) {
          fill = 'rgba(248, 250, 252, 0.95)';
          stroke = '#38bdf8';
          strokeWidth = 1.6;
          dividerColor = '#f59e0b';
        } else if (is40Ft) {
          fill = 'rgba(241, 245, 249, 0.9)';
          stroke = '#94a3b8';
          strokeWidth = 1.2;
          dividerColor = '#e2e8f0';
        }

        return (
          <g key={road.id} className="road-group">
            {/* Road Corridor Polygon Surface */}
            <polygon
              points={polyPointsStr}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.92}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))',
              }}
            />

            {/* Centerline Divider Marking */}
            <polyline
              points={centerLinePointsStr}
              fill="none"
              stroke={dividerColor}
              strokeWidth={is50Ft ? 1.5 : 1.0}
              strokeDasharray={is50Ft ? '6 4' : '4 4'}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.8}
            />
          </g>
        );
      })}
    </g>
  );
});

RoadLayer.displayName = 'RoadLayer';
