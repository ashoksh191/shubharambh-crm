import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { EnhancedPlot, EnhancedPlotStatus } from '../../../types/propertyMap';
import type { GisRenderMode } from '../../../features/gis-engine/types/gis';
import { GIS_RENDER_MODE } from '../../../features/gis-engine/constants/gisConstants';
import { SvgCanvas, type ViewportBounds } from '../../../features/gis-engine/renderer/SvgCanvas';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Tag,
  Search,
  Download,
  Layers as LayersIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VectorMapCanvasProps {
  plots: EnhancedPlot[];
  selectedPlot: EnhancedPlot | null;
  searchedPlot: EnhancedPlot | null;
  statusCounts: Record<EnhancedPlotStatus, number>;
  onSelectPlot: (plot: EnhancedPlot) => void;
  onHoverPlot: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
  onFilterBlockChange?: (block: string) => void;
  onFilterStatusChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const VectorMapCanvas: React.FC<VectorMapCanvasProps> = memo(({
  plots,
  selectedPlot,
  searchedPlot,
  statusCounts,
  onSelectPlot,
  onHoverPlot,
  searchQuery = '',
  onSearchChange,
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredPlotState, setHoveredPlotState] = useState<EnhancedPlot | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showLabelsOverride, setShowLabelsOverride] = useState<boolean>(false);
  const [showBlueprintImage, setShowBlueprintImage] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [renderMode] = useState<GisRenderMode>(GIS_RENDER_MODE);
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 1850, y: 1240 });
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

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

    const margin = 150 / scale;
    const minX = (-positionX / (scale * scaleX)) - margin;
    const minY = (-positionY / (scale * scaleY)) - margin;
    const maxX = minX + (cWidth / (scale * scaleX)) + (margin * 2);
    const maxY = minY + (cHeight / (scale * scaleY)) + (margin * 2);

    setViewportBounds({ minX, minY, maxX, maxY });
  }, []);

  // Hover handler wrapper with telemetry update
  const handlePlotHover = useCallback((plot: EnhancedPlot | null, e?: React.MouseEvent) => {
    setHoveredPlotState(plot);
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = Math.round(e.clientX - rect.left);
      const relY = Math.round(e.clientY - rect.top);
      setCursorCoords({ x: relX * 2, y: relY * 2 });
    }
    onHoverPlot(plot, e);
  }, [onHoverPlot]);

  // Filtered plots based on local toolbar selects
  const activeDisplayedPlots = React.useMemo(() => {
    return plots.filter((p) => {
      if (selectedBlockFilter !== 'all' && p.block !== selectedBlockFilter) return false;
      if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [plots, selectedBlockFilter, selectedStatusFilter]);

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
      className={`gis-command-center-viewport-32px ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Subtle Grid Background Pattern */}
      <div className="gis-viewport-grid-texture-overlay"></div>

      {/* TOP FLOATING GLASS COMMAND TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="gis-floating-top-command-bar"
      >
        <div className="gis-command-bar-group">
          {/* Search Plot Box */}
          <div className="gis-command-input-wrapper">
            <Search size={14} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Plot (e.g. 104)..."
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
              }}
            />
          </div>

          {/* Block Selector Dropdown */}
          <select
            className="gis-command-select-pill"
            value={selectedBlockFilter}
            onChange={(e) => setSelectedBlockFilter(e.target.value)}
          >
            <option value="all">🏢 All Blocks (A - F)</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
            <option value="D">Block D</option>
            <option value="E">Block E</option>
            <option value="F">Block F</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            className="gis-command-select-pill"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="all">🎨 All Statuses</option>
            <option value="available">🟢 Available ({statusCounts.available || 0})</option>
            <option value="reserved">🟡 Reserved ({statusCounts.reserved || 0})</option>
            <option value="booked">🔴 Booked ({statusCounts.booked || 0})</option>
            <option value="sold">⚪ Sold ({statusCounts.sold || 0})</option>
          </select>
        </div>

        <div className="gis-command-bar-group">
          <button
            onClick={() => transformRef.current?.zoomIn(0.5)}
            className="gis-glass-btn"
            title="Zoom In (+)"
          >
            <ZoomIn size={15} />
          </button>

          <button
            onClick={() => transformRef.current?.zoomOut(0.5)}
            className="gis-glass-btn"
            title="Zoom Out (-)"
          >
            <ZoomOut size={15} />
          </button>

          <button
            onClick={() => transformRef.current?.resetTransform()}
            className="gis-glass-btn"
            title="Recenter View (0)"
          >
            <RotateCcw size={14} /> Recenter
          </button>

          <button
            onClick={() => setShowLabelsOverride((prev) => !prev)}
            className={`gis-glass-btn ${showLabelsOverride ? 'active' : ''}`}
            title="Toggle Plot Labels (L)"
          >
            <Tag size={14} /> Labels
          </button>

          <button
            onClick={() => setShowBlueprintImage((prev) => !prev)}
            className={`gis-glass-btn ${showBlueprintImage ? 'active' : ''}`}
            title="Toggle Blueprint Image Overlay"
          >
            <LayersIcon size={14} /> Blueprint
          </button>

          <a
            href="./assets/layout_plan_master.pdf"
            download="Shubharambh_Layout_Blueprint.pdf"
            className="gis-glass-btn"
            style={{ textDecoration: 'none', background: 'rgba(14, 165, 233, 0.25)', borderColor: '#0ea5e9', color: '#38bdf8' }}
            title="Download Architectural Master Layout PDF"
          >
            <Download size={14} /> PDF
          </a>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="gis-glass-btn"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </motion.div>

      {/* LEFT FLOATING HUD STATISTICS PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="gis-floating-left-hud-statistics"
      >
        <span className="hud-panel-title-label">Live Inventory Stats</span>

        <div className="hud-stat-counter-row">
          <span>Available</span>
          <span className="hud-stat-pill-badge available">{statusCounts.available || 0}</span>
        </div>

        <div className="hud-stat-counter-row">
          <span>Reserved</span>
          <span className="hud-stat-pill-badge reserved">{statusCounts.reserved || 0}</span>
        </div>

        <div className="hud-stat-counter-row">
          <span>Booked</span>
          <span className="hud-stat-pill-badge booked">{statusCounts.booked || 0}</span>
        </div>

        <div className="hud-stat-counter-row">
          <span>Sold</span>
          <span className="hud-stat-pill-badge sold">{statusCounts.sold || 0}</span>
        </div>
      </motion.div>

      {/* RIGHT FLOATING LEGEND PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="gis-floating-right-legend-panel"
      >
        <span className="hud-panel-title-label">Status Legend</span>

        <div className="legend-item-line">
          <div className="legend-color-dot-square" style={{ background: '#10b981' }}></div>
          <span>Green: Available</span>
        </div>

        <div className="legend-item-line">
          <div className="legend-color-dot-square" style={{ background: '#f59e0b' }}></div>
          <span>Yellow: Reserved</span>
        </div>

        <div className="legend-item-line">
          <div className="legend-color-dot-square" style={{ background: '#ef4444' }}></div>
          <span>Red: Booked</span>
        </div>

        <div className="legend-item-line">
          <div className="legend-color-dot-square" style={{ background: '#94a3b8' }}></div>
          <span>Gray: Sold</span>
        </div>
      </motion.div>

      {/* BOTTOM FLOATING TELEMETRY STATUS BAR */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="gis-floating-bottom-telemetry-bar"
      >
        <div className="telemetry-item-block">
          <span>Coordinates:</span>
          <strong>X: {cursorCoords.x} | Y: {cursorCoords.y}</strong>
        </div>

        <div className="telemetry-item-block">
          <span>Zoom:</span>
          <strong>{zoomPercentage}%</strong>
        </div>

        <div className="telemetry-item-block">
          <span>Hovered Plot:</span>
          <strong>{hoveredPlotState ? `Plot ${hoveredPlotState.plotNo} (${hoveredPlotState.block})` : 'None'}</strong>
        </div>

        <div className="telemetry-item-block">
          <span>Current Block:</span>
          <strong>{selectedBlockFilter === 'all' ? 'All Blocks' : `Block ${selectedBlockFilter}`}</strong>
        </div>

        <div className="telemetry-item-block">
          <span>Scale:</span>
          <strong>1:500 (4K Vector)</strong>
        </div>
      </motion.div>

      {/* Transform Canvas Surface - SVG Vector Rendering */}
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
        {() => (
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%', willChange: 'transform' }}
          >
            <SvgCanvas
              mode={renderMode}
              scale={zoomScale}
              showBlueprintImage={showBlueprintImage}
              plots={activeDisplayedPlots}
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
        )}
      </TransformWrapper>
    </div>
  );
});

VectorMapCanvas.displayName = 'VectorMapCanvas';
