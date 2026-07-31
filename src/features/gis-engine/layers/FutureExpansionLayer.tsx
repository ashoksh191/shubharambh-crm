import React, { memo } from 'react';

interface FutureExpansionFeature {
  id: string;
  name: string;
  polygon: [number, number][];
  bbox: [number, number, number, number];
}

interface FutureExpansionLayerProps {
  features: FutureExpansionFeature[];
  visible: boolean;
}

const getCenter = (polygon: [number, number][]): [number, number] => {
  let sx = 0, sy = 0;
  polygon.forEach(([x, y]) => { sx += x; sy += y; });
  return [sx / polygon.length, sy / polygon.length];
};

export const FutureExpansionLayer: React.FC<FutureExpansionLayerProps> = memo(({ features, visible }) => {
  if (!visible || !features.length) return null;

  return (
    <g className="gis-future-expansion-layer" style={{ pointerEvents: 'none' }}>
      <defs>
        <pattern id="future-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(100, 116, 139, 0.15)" strokeWidth="2" />
        </pattern>
      </defs>

      {features.map((feat) => {
        const pointsStr = feat.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const [cx, cy] = getCenter(feat.polygon);

        return (
          <g key={feat.id}>
            {/* Hatched zone fill */}
            <polygon
              points={pointsStr}
              fill="rgba(51, 65, 85, 0.15)"
              stroke="#475569"
              strokeWidth={1.2}
              strokeDasharray="10 5"
              opacity={0.8}
            />
            <polygon
              points={pointsStr}
              fill="url(#future-hatch)"
              stroke="none"
              opacity={0.6}
            />
            {/* Zone label */}
            <text
              x={cx}
              y={cy - 6}
              fill="#64748b"
              fontSize="10px"
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {feat.name}
            </text>
            <text
              x={cx}
              y={cy + 8}
              fill="#475569"
              fontSize="7px"
              fontWeight={500}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '1.5px', textTransform: 'uppercase' }}
            >
              FUTURE DEVELOPMENT
            </text>
          </g>
        );
      })}
    </g>
  );
});

FutureExpansionLayer.displayName = 'FutureExpansionLayer';
