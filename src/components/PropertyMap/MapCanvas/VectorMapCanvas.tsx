import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { PlotPolygon } from '../PlotPolygon/PlotPolygon';
import { MapLegend } from '../Legend/MapLegend';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';

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
  const [showBlueprintBg, setShowBlueprintBg] = useState(true);
  const [polygonOpacity, setPolygonOpacity] = useState(0.45);

  const handleZoomToPlot = (plot: EnhancedPlot) => {
    if (transformRef.current) {
      const { setTransform } = transformRef.current;
      setTransform(-plot.x * 1.5 + 600, -plot.y * 1.5 + 400, 2.2, 400, 'easeOut');
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
        minHeight: '650px',
        maxHeight: '850px',
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

      {/* Map Control Buttons (Top Left Layer Switcher) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '8px 12px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <button
          onClick={() => setShowBlueprintBg(!showBlueprintBg)}
          style={{
            background: showBlueprintBg ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
            color: showBlueprintBg ? '#10b981' : '#94a3b8',
            border: '1px solid ' + (showBlueprintBg ? '#10b981' : 'rgba(255,255,255,0.15)'),
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Toggle Official PDF Blueprint Overlay"
        >
          <Layers size={14} /> Official PDF Overlay {showBlueprintBg ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={() => setPolygonOpacity(polygonOpacity === 0.45 ? 0.75 : polygonOpacity === 0.75 ? 0.2 : 0.45)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Adjust Status Color Opacity"
        >
          <Eye size={14} /> Opacity ({Math.round(polygonOpacity * 100)}%)
        </button>
      </div>

      {/* Floating Zoom Controls Bar */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.8}
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
                <RotateCcw size={14} /> Recenter PDF
              </button>
            </div>

            {/* Transform Canvas Surface */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', willChange: 'transform' }}
            >
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

                {/* Official High Resolution Blueprint Image Layer (Exact 3508 x 2480 Landscape PDF Blueprint) */}
                {showBlueprintBg && (
                  <image
                    href="./assets/layout_map_fast.jpg"
                    x="0"
                    y="0"
                    width="3508"
                    height="2480"
                    preserveAspectRatio="xMidYMid meet"
                    opacity="0.9"
                  />
                )}

                {/* RENDER ALL INTERACTIVE VECTOR SVG POLYGONS OVERLAID DIRECTLY ON PDF LANDSCAPE BLUEPRINT */}
                <g style={{ opacity: polygonOpacity }}>
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
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
