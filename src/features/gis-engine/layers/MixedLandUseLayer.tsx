import React, { memo } from 'react';

interface MixedLandUseFeature {
  id: string;
  name: string;
  type: string;
  polygon: [number, number][];
  bbox: [number, number, number, number];
}

interface MixedLandUseLayerProps {
  features: MixedLandUseFeature[];
  visible: boolean;
}

const TYPE_STYLES: Record<string, { fill: string; stroke: string; icon: string }> = {
  community: {
    fill: 'rgba(168, 85, 247, 0.20)',
    stroke: '#9333ea',
    icon: '🏛️',
  },
  religious: {
    fill: 'rgba(251, 191, 36, 0.18)',
    stroke: '#d97706',
    icon: '🕉️',
  },
  education: {
    fill: 'rgba(59, 130, 246, 0.18)',
    stroke: '#2563eb',
    icon: '🎓',
  },
  healthcare: {
    fill: 'rgba(239, 68, 68, 0.18)',
    stroke: '#dc2626',
    icon: '🏥',
  },
  sports: {
    fill: 'rgba(16, 185, 129, 0.18)',
    stroke: '#059669',
    icon: '🏟️',
  },
};

const getCenter = (polygon: [number, number][]): [number, number] => {
  let sx = 0, sy = 0;
  polygon.forEach(([x, y]) => { sx += x; sy += y; });
  return [sx / polygon.length, sy / polygon.length];
};

export const MixedLandUseLayer: React.FC<MixedLandUseLayerProps> = memo(({ features, visible }) => {
  if (!visible || !features.length) return null;

  return (
    <g className="gis-mixed-land-use-layer" style={{ pointerEvents: 'none' }}>
      {features.map((feat) => {
        const style = TYPE_STYLES[feat.type] || TYPE_STYLES.community;
        const pointsStr = feat.polygon.map(([x, y]) => `${x},${y}`).join(' ');
        const [cx, cy] = getCenter(feat.polygon);

        return (
          <g key={feat.id}>
            {/* Zone polygon */}
            <polygon
              points={pointsStr}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={1.2}
              strokeDasharray="8 3"
              opacity={0.9}
            />
            {/* Zone name label */}
            <text
              x={cx}
              y={cy - 8}
              fill={style.stroke}
              fontSize="9px"
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.5px' }}
            >
              {feat.name}
            </text>
            <text
              x={cx}
              y={cy + 8}
              fill="#94a3b8"
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

MixedLandUseLayer.displayName = 'MixedLandUseLayer';
