import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import type { GisRenderMode } from '../../../features/gis-engine/types/gis';
import { GIS_RENDER_MODE } from '../../../features/gis-engine/constants/gisConstants';
import { SvgCanvas, type ViewportBounds } from '../../../features/gis-engine/renderer/SvgCanvas';
import { MapLegend } from '../Legend/MapLegend';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Tag, Keyboard, X, Layers, Code, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VectorMapCanvasProps {
  plots: EnhancedPlot[];
  selectedPlot: EnhancedPlot | null;
  searchedPlot: EnhancedPlot | null;
  statusCounts: Record<EnhancedPlotStatus, number>;
  onSelectPlot: (plot: EnhancedPlot) => void;
  onHoverPlot: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
}

export const VectorMapCanvas: React.FC<VectorMapCanvasProps> = memo(({
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
  const [showBlueprintImage, setShowBlueprintImage] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<GisRenderMode>(GIS_RENDER_MODE);
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);

  // Exact plot centering based on container bounds & target scale (Fly-To Animation)
  const handleZoomToPlot = useCallback((plot: EnhancedPlot) => {
    if (transformRef.current) {
      const { setTransform } = transformRef.current;
      const targetScale = 3.0;
      const cWidth = containerRef.current?.clientWidth || 1200;
      const cHeight = containerRef.current?.clientHeight || 700;

      const plotCenterX = plot.x + plot.w / 2;
      const plotCenterY = plot.y + plot.h / 2;

      const scaleX = cWidth / 2384;
      const scaleY = cHeight / 1684;

      const posX = cWidth / 2 - plotCenterX * scaleX * targetScale;
      const posY = cHeight / 2 - plotCenterY * scaleY * targetScale;

      setTransform(posX, posY, targetScale, 450, 'easeInOutCubic');
    }
  }, []);

  useEffect(() => {
    if (searchedPlot) {
      handleZoomToPlot(searchedPlot);
    }
  }, [searchedPlot, handleZoomToPlot]);

  // Dynamic Viewport Bounding Box Calculation for Spatial Culling
  const handleTransform = useCallback((ref: any) => {
    if (!ref?.state) return;
    const { positionX, positionY, scale } = ref.state;
    setZoomScale(scale);

    const cWidth = containerRef.current?.clientWidth || 1200;
    const cHeight = containerRef.current?.clientHeight || 700;

    const scaleX = cWidth / 2384;
    const scaleY = cHeight / 1684;

    const margin = 150 / scale; // Safety padding margin in SVG coordinate space
    const minX = (-positionX / (scale * scaleX)) - margin;
    const minY = (-positionY / (scale * scaleY)) - margin;
    const maxX = minX + (cWidth / (scale * scaleX)) + (margin * 2);
    const maxY = minY + (cHeight / (scale * scaleY)) + (margin * 2);

    setViewportBounds({ minX, minY, maxX, maxY });
  }, []);

  // Hover handler wrapper
  const handlePlotHover = useCallback((plot: EnhancedPlot | null, e?: React.MouseEvent) => {
    setHoveredPlotState(plot);
    onHoverPlot(plot, e);
  }, [onHoverPlot]);

  // Keyboard Shortcuts Listener (+, -, 0, F, L, Arrow Keys, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!transformRef.current) return;
      const { zoomIn, zoomOut, resetTransform, state, setTransform } = transformRef.current;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          zoomIn(0.5);
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut(0.5);
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

  const isZoomedIn = zoomScale >= 1.2;
  const zoomPercentage = Math.round(zoomScale * 100);

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
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              userSelect: 'none',
            }
      }
    >
      {/* Floating Inventory Legend */}
      <MapLegend counts={statusCounts} />

      {/* Floating Interactive Compass Widget */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => transformRef.current?.resetTransform()}
        className="gis-compass-widget"
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 20 }}
        title="Reset North Orientation (0)"
      >
        <Compass size={22} />
      </motion.div>

      {/* Touch & Engine Status Helper Badge */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '6px 16px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#f8fafc',
          fontSize: '0.8rem',
          fontWeight: 600,
          pointerEvents: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>💡 Enterprise GIS Vector Engine</span>
        <span style={{ color: '#0284c7' }}>•</span>
        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{zoomPercentage}% Zoom</span>
        <span style={{ color: '#0284c7' }}>•</span>
        <span style={{ color: '#10b981', fontWeight: 700 }}>Spatial Culling: ACTIVE</span>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '70px',
              right: '20px',
              zIndex: 30,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '18px 22px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              maxWidth: '320px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>Keyboard Navigation</h4>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 14px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <kbd style={kbdStyle}>+</kbd> <span>Zoom In</span>
              <kbd style={kbdStyle}>-</kbd> <span>Zoom Out</span>
              <kbd style={kbdStyle}>0</kbd> <span>Recenter Map</span>
              <kbd style={kbdStyle}>F</kbd> <span>Toggle Fullscreen</span>
              <kbd style={kbdStyle}>L</kbd> <span>Toggle Plot Labels</span>
              <kbd style={kbdStyle}>↑ ↓ ← →</kbd> <span>Pan Viewport</span>
              <kbd style={kbdStyle}>Esc</kbd> <span>Deselect Plot</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Pan Pinch Canvas Wrapper (Up to 10x scale) */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={10}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ velocityDisabled: true }}
        centerOnInit={true}
        onTransform={handleTransform}
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
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                padding: '8px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={() => zoomIn(0.5)}
                className="gis-glass-btn"
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>

              <button
                onClick={() => zoomOut(0.5)}
                className="gis-glass-btn"
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>

              <button
                onClick={() => resetTransform()}
                className="gis-glass-btn"
                style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981' }}
                title="Recenter Map (0)"
              >
                <RotateCcw size={14} /> Recenter
              </button>

              <button
                onClick={() => setShowLabelsOverride((prev) => !prev)}
                className={`gis-glass-btn ${showLabelsOverride ? 'active' : ''}`}
                title="Toggle Plot Labels (L)"
              >
                <Tag size={15} /> Labels
              </button>

              <button
                onClick={() => setShowBlueprintImage((prev) => !prev)}
                className={`gis-glass-btn ${showBlueprintImage ? 'active' : ''}`}
                title="Toggle Architectural Master Layout Plan"
              >
                <Layers size={15} /> Blueprint Map
              </button>

              {/* GIS Render Mode Toggle (Production vs Developer) */}
              <button
                onClick={() => setRenderMode((prev) => (prev === 'production' ? 'developer' : 'production'))}
                className={`gis-glass-btn ${renderMode === 'developer' ? 'active' : ''}`}
                title="Toggle GIS Architecture Mode (Production / Developer)"
              >
                <Code size={15} /> {renderMode === 'production' ? 'Dev Mode' : 'Prod Mode'}
              </button>

              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="gis-glass-btn"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>

              <button
                onClick={() => setShowKeyboardHelp((prev) => !prev)}
                className="gis-glass-btn"
                title="Keyboard Shortcuts"
              >
                <Keyboard size={16} />
              </button>
            </div>

            {/* Transform Canvas Surface - Pure SVG Vector Rendering delegated to SvgCanvas */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', willChange: 'transform' }}
            >
              <SvgCanvas
                mode={renderMode}
                scale={zoomScale}
                showBlueprintImage={showBlueprintImage}
                plots={plots}
                selectedPlot={selectedPlot}
                searchedPlot={searchedPlot}
                hoveredPlot={hoveredPlotState}
                showLabels={showLabelsOverride}
                isZoomedIn={isZoomedIn}
                viewport={viewportBounds}
                onSelectPlot={onSelectPlot}
                onHoverPlot={handlePlotHover}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
});

VectorMapCanvas.displayName = 'VectorMapCanvas';

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  padding: '2px 6px',
  fontWeight: 700,
  fontSize: '0.75rem',
  color: '#38bdf8',
  textAlign: 'center',
};
