import React, { memo } from 'react';

interface WaterBodyFeature {
  id: string;
  name: string;
  type: string;
  polygon: [number, number][];
  bbox: [number, number, number, number];
}

interface WaterBodyLayerProps {
  features: WaterBodyFeature[];
  visible: boolean;
}

const getCenter = (polygon: [number, number][]): [number, number] => {
  let sx = 0, sy = 0;
  polygon.forEach(([x, y]) => { sx += x; sy += y; });
  return [sx / polygon.length, sy / polygon.length];
};

export const WaterBodyLayer: React.FC<WaterBodyLayerProps> = memo(({ features, visible }) => {
  if (!visible || !features.length) return null;

  return (
    <g className="gis-water-body-layer" style={{ pointerEvents: 'none' }}>
      <defs>
        <pattern id="water-ripple" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0 10 Q 5 8, 10 10 Q 15 12, 20 10" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {features.map((feat) => {
        const pointsStr = feat.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const [cx, cy] = getCenter(feat.polygon);

        return (
          <g key={feat.id}>
            {/* Water body base fill */}
            <polygon
              points={pointsStr}
              fill="rgba(14, 116, 144, 0.25)"
              stroke="#0891b2"
              strokeWidth={1.5}
              opacity={0.9}
              style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.2))' }}
            />
            {/* Ripple texture overlay */}
            <polygon
              points={pointsStr}
              fill="url(#water-ripple)"
              stroke="none"
              opacity={0.6}
            />
            {/* Water body label */}
            <text
              x={cx}
              y={cy - 6}
              fill="#22d3ee"
              fontSize="9px"
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {feat.name}
            </text>
            <text
              x={cx}
              y={cy + 6}
              fill="#67e8f9"
              fontSize="7px"
              fontWeight={500}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {feat.type}
            </text>
          </g>
        );
      })}
    </g>
  );
});

WaterBodyLayer.displayName = 'WaterBodyLayer';
