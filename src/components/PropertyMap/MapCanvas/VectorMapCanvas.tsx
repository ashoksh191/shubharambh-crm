import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { PlotPolygon } from '../PlotPolygon/PlotPolygon';
import { MapLegend } from '../Legend/MapLegend';
import { ZoomIn, ZoomOut, RotateCcw, Map as MapIcon, FileText } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'vector' | 'pdf'>('vector');

  const handleZoomToPlot = (plot: EnhancedPlot) => {
    if (transformRef.current) {
      const { setTransform } = transformRef.current;
      setTransform(-plot.x * 1.4 + 600, -plot.y * 1.4 + 400, 2.0, 400, 'easeOut');
    }
  };

  React.useEffect(() => {
    if (searchedPlot) {
      handleZoomToPlot(searchedPlot);
    }
  }, [searchedPlot?.id]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 160px)',
        minHeight: '680px',
        maxHeight: '880px',
        background: '#0b0f19',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        userSelect: 'none',
      }}
    >
      {/* Floating Legend */}
      <MapLegend counts={statusCounts} />

      {/* Top Left View Switcher */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <button
          onClick={() => setViewMode('vector')}
          style={{
            background: viewMode === 'vector' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
            color: viewMode === 'vector' ? '#10b981' : '#94a3b8',
            border: viewMode === 'vector' ? '1px solid #10b981' : '1px solid transparent',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MapIcon size={15} /> 2D Vector Master Layout
        </button>

        <button
          onClick={() => setViewMode('pdf')}
          style={{
            background: viewMode === 'pdf' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
            color: viewMode === 'pdf' ? '#f59e0b' : '#94a3b8',
            border: viewMode === 'pdf' ? '1px solid #f59e0b' : '1px solid transparent',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={15} /> Official Blueprint Drawing
        </button>
      </div>

      {/* Floating Zoom Controls Bar */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.6}
        maxScale={6}
        wheel={{ step: 0.08 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ velocityDisabled: true }}
        centerOnInit={true}
        limitToBounds={false}
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
                <RotateCcw size={14} /> Recenter Fit
              </button>
            </div>

            {/* Transform Canvas Surface */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', willChange: 'transform' }}
            >
              {viewMode === 'pdf' ? (
                /* OFFICIAL ARCHITECT BLUEPRINT DRAWING VIEW */
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', padding: '20px' }}>
                  <img
                    src="./assets/layout_map_fast.jpg"
                    alt="Shubharambh Green City Official Architect Blueprint Drawing"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
                  />
                </div>
              ) : (
                /* HIGH PRECISION 2D VECTOR MASTER LAYOUT MAP VIEW */
                <svg
                  viewBox="0 0 3508 2480"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    shapeRendering: 'geometricPrecision',
                  }}
                >
                  <defs>
                    <pattern id="grid-bg" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#grid-bg)" />

                  {/* PURVANCHAL EXPRESSWAY & ENTRANCE HIGHWAY */}
                  <g id="expressway">
                    <rect x="120" y="300" width="450" height="1800" fill="rgba(30, 41, 59, 0.95)" stroke="#475569" strokeWidth="4" rx="16" />
                    <line x1="345" y1="300" x2="345" y2="2100" stroke="#f59e0b" strokeWidth="4" strokeDasharray="20 20" />
                    <text x="345" y="1200" fill="#fcd34d" fontSize="22" fontWeight="800" textAnchor="middle" transform="rotate(-90 345 1200)">
                      🛣️ PURVANCHAL EXPRESSWAY & 50 FT MAIN TOWNSHIP HIGHWAY LINK
                    </text>
                  </g>

                  {/* MANDIR & COMMERCIAL MARKET SECTOR */}
                  <g id="mandir-comm">
                    <rect x="700" y="300" width="700" height="120" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" rx="14" />
                    <text x="730" y="370" fill="#fcd34d" fontSize="18" fontWeight="800">
                      🛕 SHRI GANESHA MANDIR & 50 FT GRAND ENTRANCE GATE
                    </text>

                    <rect x="700" y="440" width="700" height="120" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" rx="14" />
                    <text x="730" y="510" fill="#f472b6" fontSize="18" fontWeight="800">
                      🛍️ DEDICATED COMMERCIAL SHOPS & MIXED LAND SECTOR (20,440 SQ.FT)
                    </text>
                  </g>

                  {/* BLOCK A HEADER */}
                  <g id="header-a">
                    <rect x="850" y="600" width="1090" height="45" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" rx="8" />
                    <text x="870" y="630" fill="#fcd34d" fontSize="17" fontWeight="800">
                      👑 BLOCK A — PREMIUM BOULEVARD SECTOR (Plots A-101 to A-416)
                    </text>
                  </g>

                  {/* BLOCK B HEADER */}
                  <g id="header-b">
                    <rect x="1980" y="220" width="1180" height="45" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" rx="8" />
                    <text x="2000" y="250" fill="#6ee7b7" fontSize="17" fontWeight="800">
                      🌴 BLOCK B — CENTRAL PARK & CLUB HOUSE SECTOR (Plots B-317 to B-680)
                    </text>
                  </g>

                  {/* BLOCK C HEADER */}
                  <g id="header-c">
                    <rect x="2250" y="1090" width="1060" height="45" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" rx="8" />
                    <text x="2270" y="1120" fill="#93c5fd" fontSize="17" fontWeight="800">
                      🏡 BLOCK C — GARDEN RESIDENTIAL SECTOR (Plots C-681 to C-980)
                    </text>
                  </g>

                  {/* INTERACTIVE VECTOR SVG PLOTS */}
                  <g>
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
                  </g>
                </svg>
              )}
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
