import React, { memo } from 'react';
import type { PlotFeature } from '../types/gis';
import { GIS_LOD_THRESHOLDS } from '../constants/gisConstants';
import { getPolygonCenter } from '../geometry/geometry';
import defaultPlotData from '../../../data/plots.generated.json';
import roadsData from '../data/roads.json';
import parksData from '../data/parks.json';
import commercialData from '../data/commercial.json';

interface LabelLayerProps {
  scale?: number;
  visible?: boolean;
  plots?: Record<string, PlotFeature> | PlotFeature[];
}

export const LabelLayer: React.FC<LabelLayerProps> = memo(({
  scale = 1.0,
  visible = true,
  plots,
}) => {
  if (!visible) return null;

  const showRoadsAndBlocks = scale >= 0.5;
  const showImportantPlotNumbers = scale >= GIS_LOD_THRESHOLDS.LOW_ZOOM_MAX;
  const showAllPlotNumbers = scale >= GIS_LOD_THRESHOLDS.MEDIUM_ZOOM_MAX;
  const showDetailedAttributes = scale >= GIS_LOD_THRESHOLDS.HIGH_ZOOM_MIN;

  const plotDataset = plots || (defaultPlotData as unknown as Record<string, PlotFeature>);
  const plotEntries: [string, PlotFeature][] = Array.isArray(plotDataset)
    ? plotDataset.map((p) => [p.id, p])
    : Object.entries(plotDataset);

  return (
    <g className="gis-label-layer" style={{ pointerEvents: 'none', userSelect: 'none' }}>
      {/* 1. Road Corridors & Boulevard Names (Scale >= 0.5) */}
      {showRoadsAndBlocks &&
        (roadsData as any[]).map((road) => {
          if (!road.name || !road.centerLine || road.centerLine.length < 2) return null;
          const midIdx = Math.floor(road.centerLine.length / 2);
          const [cx, cy] = road.centerLine[midIdx];
          const isMain = road.widthFt >= 50;

          return (
            <text
              key={`road-lbl-${road.id}`}
              x={cx}
              y={cy}
              fill="rgba(148, 163, 184, 0.85)"
              fontSize={isMain ? '12px' : '9px'}
              fontWeight={700}
              letterSpacing="1px"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}
            >
              {road.name} ({road.widthFt}')
            </text>
          );
        })}

      {/* 2. Central Park & Amenity Labels */}
      {showRoadsAndBlocks &&
        (parksData as any[]).map((park) => {
          if (!park.polygon) return null;
          const [cx, cy] = getPolygonCenter(park.polygon);
          return (
            <text
              key={`park-lbl-${park.id}`}
              x={cx}
              y={cy}
              fill="#059669"
              fontSize="11px"
              fontWeight={700}
              letterSpacing="0.8px"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {park.name || 'Central Park'}
            </text>
          );
        })}

      {/* 3. Commercial Zone Labels */}
      {showRoadsAndBlocks &&
        (commercialData as any[]).map((comm) => {
          if (!comm.polygon) return null;
          const [cx, cy] = getPolygonCenter(comm.polygon);
          return (
            <text
              key={`comm-lbl-${comm.id}`}
              x={cx}
              y={cy}
              fill="#7c3aed"
              fontSize="12px"
              fontWeight={800}
              letterSpacing="1px"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {comm.name || 'Commercial Hub'}
            </text>
          );
        })}

      {/* 4. Adaptive Plot Labels (Plot Numbers & Details) */}
      {(showImportantPlotNumbers || showAllPlotNumbers) &&
        plotEntries.map(([id, p], index) => {
          // Decimate labels at low zoom levels to prevent label overlap
          if (!showAllPlotNumbers && index % 4 !== 0) return null;

          const [cx, cy] = p.center || getPolygonCenter(p.polygon);
          const labelText = p.plotNo || id;

          return (
            <g key={`plot-lbl-group-${id}`}>
              <text
                x={cx}
                y={showDetailedAttributes ? cy - 6 : cy}
                fill="#cbd5e1"
                fontSize={showDetailedAttributes ? '9px' : '8px'}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {labelText}
              </text>

              {/* High-Zoom Detailed Attributes (Scale > 5.0) */}
              {showDetailedAttributes && (
                <text
                  x={cx}
                  y={cy + 6}
                  fill="#94a3b8"
                  fontSize="7px"
                  fontWeight={500}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {p.areaSqFt || 1000} sqft
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
});

LabelLayer.displayName = 'LabelLayer';
