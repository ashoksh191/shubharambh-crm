import React, { memo } from 'react';
import type { ParkFeature } from '../types/gis';
import { getPolygonCenter } from '../geometry/geometry';
import { GIS_FILL_OPACITY, GIS_COLORS } from '../constants/gisConstants';

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
        const [cx, cy] = getPolygonCenter(park.polygon);

        return (
          <g key={park.id} className="park-group">
            {/* Soft Amenity Foliage Fill */}
            <polygon
              points={pointsStr}
              fill={GIS_FILL_OPACITY.park}
              stroke={GIS_COLORS.park}
              strokeWidth={1.5}
              opacity={0.9}
            />

            {/* Vector Tree Canopy Icon at Centroid */}
            <g transform={`translate(${cx - 8}, ${cy - 12}) scale(0.7)`} opacity={0.85}>
              <path
                d="M 12 2 L 4 14 L 8 14 L 2 22 L 22 22 L 16 14 L 20 14 Z"
                fill="#059669"
                stroke="#047857"
                strokeWidth="1"
              />
              <rect x="10" y="22" width="4" height="5" fill="#78350f" />
            </g>
          </g>
        );
      })}
    </g>
  );
});

ParkLayer.displayName = 'ParkLayer';
