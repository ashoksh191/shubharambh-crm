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

        let fill = 'rgba(254, 240, 138, 0.9)'; // Bright road fill
        let stroke = '#f59e0b';
        let strokeWidth = 1.2;
        let dividerColor = '#d97706';

        if (is50Ft) {
          fill = 'rgba(254, 240, 138, 0.98)';
          stroke = '#f59e0b';
          strokeWidth = 2.0;
          dividerColor = '#ef4444';
        } else if (is40Ft) {
          fill = 'rgba(254, 243, 199, 0.92)';
          stroke = '#d97706';
          strokeWidth = 1.5;
          dividerColor = '#b45309';
        }

        return (
          <g key={road.id} className="road-group">
            {/* Road Corridor Surface Polygon */}
            <polygon
              points={polyPointsStr}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.95}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
              }}
            />

            {/* Centerline Marking */}
            <polyline
              points={centerLinePointsStr}
              fill="none"
              stroke={dividerColor}
              strokeWidth={is50Ft ? 1.8 : 1.2}
              strokeDasharray={is50Ft ? '6 4' : '4 4'}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          </g>
        );
      })}
    </g>
  );
});

RoadLayer.displayName = 'RoadLayer';
