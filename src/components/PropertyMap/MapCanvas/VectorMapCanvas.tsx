import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import { PlotPolygon } from '../PlotPolygon/PlotPolygon';
import { MapLegend } from '../Legend/MapLegend';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Tag, Keyboard, X } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredPlotState, setHoveredPlotState] = useState<EnhancedPlot | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showLabelsOverride, setShowLabelsOverride] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Progressive Image Loading State: fast (366KB) -> HD (1.8MB) -> Lossless PNG (>2.0x zoom)
  const [imageSrc, setImageSrc] = useState<string>('./assets/layout_map_fast.jpg');
  const [isHdLoaded, setIsHdLoaded] = useState<boolean>(false);
  const [isPngLoaded, setIsPngLoaded] = useState<boolean>(false);

  // Step 1: Preload HD image after initial render
  useEffect(() => {
    const hdImg = new Image();
    hdImg.src = './assets/layout_map_hd.jpg';
    hdImg.onload = () => {
      setIsHdLoaded(true);
      setImageSrc('./assets/layout_map_hd.jpg');
    };
  }, []);

  // Step 2: Preload & swap to Lossless PNG when zoom scale > 2.0x
  useEffect(() => {
    if (zoomScale >= 2.0 && !isPngLoaded) {
      const pngImg = new Image();
      pngImg.src = './assets/layout_map_hd.png';
      pngImg.onload = () => {
        setIsPngLoaded(true);
        setImageSrc('./assets/layout_map_hd.png');
      };
    } else if (zoomScale < 2.0 && isHdLoaded) {
      setImageSrc('./assets/layout_map_hd.jpg');
    }
  }, [zoomScale, isPngLoaded, isHdLoaded]);

  const handleZoomToPlot = useCallback((plot: EnhancedPlot) => {
    if (transformRef.current) {
      const { setTransform } = transformRef.current;
      setTransform(-plot.x * 1.5 + 600, -plot.y * 1.5 + 400, 2.2, 400, 'easeOut');
    }
  }, []);

  useEffect(() => {
    if (searchedPlot) {
      handleZoomToPlot(searchedPlot);
    }
  }, [searchedPlot, handleZoomToPlot]);

  // Hover handler wrapper
  const handlePlotHover = useCallback((plot: EnhancedPlot | null, e?: React.MouseEvent) => {
    setHoveredPlotState(plot);
    onHoverPlot(plot, e);
  }, [onHoverPlot]);

  // Keyboard Shortcuts Listener (+, -, 0, F, Arrow Keys, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing inside input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!transformRef.current) return;
      const { zoomIn, zoomOut, resetTransform, state, setTransform } = transformRef.current;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          zoomIn(0.4);
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut(0.4);
          break;
        case '0':
          e.preventDefault();
          resetTransform();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          setShowLabelsOverride((prev) => !prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setTransform(state.positionX, state.positionY + 80, state.scale, 150);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setTransform(state.positionX, state.positionY - 80, state.scale, 150);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setTransform(state.positionX + 80, state.positionY, state.scale, 150);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setTransform(state.positionX - 80, state.positionY, state.scale, 150);
          break;
        case 'Escape':
          e.preventDefault();
          if (showKeyboardHelp) setShowKeyboardHelp(false);
          else onSelectPlot(null as any);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectPlot, showKeyboardHelp]);

  return (
    <div
      ref={containerRef}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              width: '100vw',
              height: '100vh',
              background: '#0b0f19',
              userSelect: 'none',
            }
          : {
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
            }
      }
    >
      {/* Floating Inventory Legend */}
      <MapLegend counts={statusCounts} />

      {/* Floating Touch / Mobile Helper Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#cbd5e1',
          fontSize: '0.78rem',
          fontWeight: 600,
          pointerEvents: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
        }}
      >
        💡 Touch: Pinch to zoom • Drag to pan • Keys: <span style={{ color: '#38bdf8' }}>+ - 0 F L</span>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            zIndex: 30,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #38bdf8',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            color: '#ffffff',
            maxWidth: '320px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>⌨️ Keyboard Shortcuts</strong>
            <button
              onClick={() => setShowKeyboardHelp(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><kbd style={kbdStyle}>+</kbd> / <kbd style={kbdStyle}>-</kbd> Zoom In / Zoom Out</div>
            <div><kbd style={kbdStyle}>0</kbd> Recenter & Reset Map View</div>
            <div><kbd style={kbdStyle}>F</kbd> Toggle Fullscreen Canvas</div>
            <div><kbd style={kbdStyle}>L</kbd> Toggle Plot Number Labels</div>
            <div><kbd style={kbdStyle}>↑ ↓ ← →</kbd> Pan Map North/South/East/West</div>
            <div><kbd style={kbdStyle}>Esc</kbd> Clear Plot Selection</div>
          </div>
        </div>
      )}

      {/* Zoom Pan Pinch Canvas Wrapper */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.7}
        maxScale={6}
        wheel={{ step: 0.08 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ velocityDisabled: true }}
        centerOnInit={true}
        onTransform={(ref: any) => {
          if (ref?.state?.scale) setZoomScale(ref.state.scale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Control Toolbar */}
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
                onClick={() => zoomIn(0.4)}
                style={controlBtnStyle}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>

              <button
                onClick={() => zoomOut(0.4)}
                style={controlBtnStyle}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>

              <button
                onClick={() => resetTransform()}
                style={{ ...controlBtnStyle, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981' }}
                title="Recenter Map (0)"
              >
                <RotateCcw size={14} /> Recenter
              </button>

              <button
                onClick={() => setShowLabelsOverride((prev) => !prev)}
                style={{
                  ...controlBtnStyle,
                  background: showLabelsOverride ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.08)',
                  borderColor: showLabelsOverride ? '#38bdf8' : 'transparent',
                  color: showLabelsOverride ? '#38bdf8' : '#ffffff',
                }}
                title="Toggle Plot Labels (L)"
              >
                <Tag size={15} /> Labels
              </button>

              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                style={controlBtnStyle}
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>

              <button
                onClick={() => setShowKeyboardHelp((prev) => !prev)}
                style={controlBtnStyle}
                title="Keyboard Shortcuts"
              >
                <Keyboard size={16} />
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
                {/* Progressive 3-Stage Blueprint Image (Fast -> HD -> Lossless PNG) */}
                <image
                  href={imageSrc}
                  x="0"
                  y="0"
                  width="3508"
                  height="2480"
                  preserveAspectRatio="none"
                />

                {/* Grouped SVG Plot Layer for Maximum Rendering Performance */}
                <g className="plots-layer">
                  {plots.map((plot) => (
                    <PlotPolygon
                      key={plot.id}
                      plot={plot}
                      isSelected={selectedPlot?.id === plot.id}
                      isSearched={searchedPlot?.id === plot.id}
                      isHovered={hoveredPlotState?.id === plot.id}
                      showLabels={showLabelsOverride}
                      zoomScale={zoomScale}
                      onSelect={onSelectPlot}
                      onHover={handlePlotHover}
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

const controlBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.85rem',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'all 0.15s ease',
};

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#38bdf8',
};
