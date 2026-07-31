import React, { memo } from 'react';

interface ExpresswayFeature {
  id: string;
  name: string;
  widthFt: number;
  surfaceType: string;
  centerLine: [number, number][];
  polygon: [number, number][];
  bbox: [number, number, number, number];
}

interface ExpresswayLayerProps {
  features: ExpresswayFeature[];
  visible: boolean;
}

export const ExpresswayLayer: React.FC<ExpresswayLayerProps> = memo(({ features, visible }) => {
  if (!visible || !features.length) return null;

  return (
    <g className="gis-expressway-layer" style={{ pointerEvents: 'none' }}>
      {features.map((feat) => {
        const polyStr = feat.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const clStr = feat.centerLine.map(([x, y]) => `${x},${y}`).join(' ');
        const [cx, cy] = [
          (feat.centerLine[0][0] + feat.centerLine[1][0]) / 2,
          (feat.centerLine[0][1] + feat.centerLine[1][1]) / 2,
        ];

        return (
          <g key={feat.id}>
            {/* Expressway shoulder */}
            <polygon
              points={polyStr}
              fill="rgba(100, 116, 139, 0.45)"
              stroke="#334155"
              strokeWidth={2.5}
              opacity={0.95}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5))' }}
            />
            {/* Asphalt surface */}
            <polygon
              points={feat.polygon.map(([x, y]) => {
                const midY = (feat.polygon[0][1] + feat.polygon[2][1]) / 2;
                const shrink = (y < midY) ? 5 : -5;
                return `${x},${y + shrink}`;
              }).join(' ')}
              fill="rgba(51, 65, 85, 0.7)"
              stroke="none"
            />
            {/* Centerline divider — white dashed */}
            <polyline
              points={clStr}
              fill="none"
              stroke="#f8fafc"
              strokeWidth={2}
              strokeDasharray="12 8"
              opacity={0.8}
            />
            {/* Lane markings */}
            <polyline
              points={feat.centerLine.map(([x, y]) => `${x},${y - 15}`).join(' ')}
              fill="none"
              stroke="rgba(248, 250, 252, 0.3)"
              strokeWidth={1}
              strokeDasharray="8 6"
            />
            <polyline
              points={feat.centerLine.map(([x, y]) => `${x},${y + 15}`).join(' ')}
              fill="none"
              stroke="rgba(248, 250, 252, 0.3)"
              strokeWidth={1}
              strokeDasharray="8 6"
            />
            {/* Expressway label */}
            <text
              x={cx}
              y={cy - 2}
              fill="#f8fafc"
              fontSize="12px"
              fontWeight={800}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              ← {feat.name} →
            </text>
            <text
              x={cx}
              y={cy + 12}
              fill="#94a3b8"
              fontSize="8px"
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {feat.widthFt}' WIDE • {feat.surfaceType}
            </text>
          </g>
        );
      })}
    </g>
  );
});

ExpresswayLayer.displayName = 'ExpresswayLayer';
