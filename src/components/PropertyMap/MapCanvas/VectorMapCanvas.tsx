import React, { useRef } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { PlotPolygon } from '../PlotPolygon/PlotPolygon';
import { MapLegend } from '../Legend/MapLegend';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VectorMapCanvasProps {
  plots: EnhancedPlot[];
  selectedPlot: EnhancedPlot | null;
  searchedPlot: EnhancedPlot | null;
  statusCounts: Record<EnhancedPlotStatus, number>;
  onSelectPlot: (plot: EnhancedPlot) => void;
  onHoverPlot: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

export const VectorMapCanvas: React.FC<VectorMapCanvasProps> = ({
  plots,
  selectedPlot,
  searchedPlot,
  statusCounts,
  onSelectPlot,
  onHoverPlot,
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const handleZoomToPlot = (plot: EnhancedPlot) => {
    if (transformRef.current) {
      const { setTransform } = transformRef.current;
      setTransform(-plot.x * 1.2 + 400, -plot.y * 1.2 + 250, 1.8, 400, 'easeOut');
    }
  };

  React.useEffect(() => {
    if (searchedPlot) {
      handleZoomToPlot(searchedPlot);
    }
  }, [searchedPlot]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '750px',
        background: '#0b0f19',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Floating Legend */}
      <MapLegend counts={statusCounts} />

      {/* Floating Zoom Controls Bar */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'zoomIn' }}
        panning={{ velocityDisabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(12px)',
                padding: '8px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <button
                onClick={() => zoomIn(0.3)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => zoomOut(0.3)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => resetTransform()}
                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Reset View"
              >
                <RotateCcw size={14} /> Recenter
              </button>
            </div>

            {/* Transform Canvas Surface */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <svg
                viewBox="0 0 1450 7300"
                style={{
                  width: '100%',
                  height: '100%',
                  minWidth: '1350px',
                  display: 'block',
                }}
              >
                <defs>
                  <pattern id="grid-bg" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid-bg)" />

                {/* 40 FT MAIN BOULEVARD ROAD */}
                <g id="main-road">
                  <rect x="0" y="80" width="1450" height="70" fill="rgba(30, 41, 59, 0.9)" stroke="#475569" strokeWidth="2" />
                  <line x1="0" y1="115" x2="1450" y2="115" stroke="#f59e0b" strokeWidth="3" strokeDasharray="15 15" />
                  <text x="50" y="122" fill="#fcd34d" fontSize="15" fontWeight="800">
                    🛣️ 40 FT MAIN BOULEVARD ROAD (ENTRANCE HIGHWAY DIRECT LINK)
                  </text>
                </g>

                {/* GRAND ENTRANCE & MANDIR ZONE */}
                <g id="mandir-zone">
                  <rect x="50" y="5" width="380" height="65" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" rx="12" />
                  <text x="70" y="42" fill="#fcd34d" fontSize="16" fontWeight="800">
                    🛕 SHRI GANESHA MANDIR & GRAND GATE (50 FT)
                  </text>
                </g>

                {/* COMMERCIAL SHOPS ZONE */}
                <g id="commercial-zone">
                  <rect x="900" y="5" width="480" height="65" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" rx="12" />
                  <text x="920" y="42" fill="#f472b6" fontSize="16" fontWeight="800">
                    🛍️ DEDICATED COMMERCIAL MARKET ZONE (20,440 SQ.FT)
                  </text>
                </g>

                {/* BLOCK A HEADER */}
                <g id="block-a">
                  <rect x="35" y="170" width="1380" height="50" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="2" rx="10" />
                  <text x="55" y="202" fill="#fcd34d" fontSize="17" fontWeight="800">
                    👑 BLOCK A — PREMIUM SECTOR (Plots A-1 to A-316 | 30'x50', 25'x50', 20'x50')
                  </text>
                </g>

                {/* BLOCK B HEADER */}
                <g id="block-b">
                  <rect x="35" y="2490" width="1380" height="50" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" rx="10" />
                  <text x="55" y="2522" fill="#6ee7b7" fontSize="17" fontWeight="800">
                    🌴 BLOCK B — CENTRAL PARK & LUXURY CLUB (Plots B-317 to B-680 | 25'x40', 20'x40')
                  </text>
                </g>

                {/* BLOCK C HEADER */}
                <g id="block-c">
                  <rect x="35" y="5190" width="1380" height="50" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2" rx="10" />
                  <text x="55" y="5222" fill="#93c5fd" fontSize="17" fontWeight="800">
                    🏡 BLOCK C — GARDEN SECTOR (Plots C-681 to C-980 | 25'x40', 20'x40', 15'x40')
                  </text>
                </g>

                {/* RENDER ALL VECTOR SVG POLYGONS */}
                {plots.map((plot) => (
                  <PlotPolygon
                    key={plot.id}
                    plot={plot}
                    isSelected={selectedPlot?.id === plot.id}
                    isSearched={searchedPlot?.id === plot.id}
                    onSelect={onSelectPlot}
                    onHover={onHoverPlot}
                  />
                ))}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
