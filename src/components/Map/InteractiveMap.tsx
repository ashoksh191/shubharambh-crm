import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Plot, BlockName, PlotStatus } from '../../types';
import { PlotModal } from './PlotModal';
import { Search, ZoomIn, ZoomOut, RotateCcw, Filter, MapPin, LayoutGrid, Map as MapIcon, Download, FileText } from 'lucide-react';
import '../../styles/Map.css';

interface InteractiveMapProps {
  onOpenBooking: (plot: Plot) => void;
  onOpenReceipt: (bookingId: string) => void;
  onOpenBond: (bookingId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onOpenBooking,
  onOpenReceipt,
  onOpenBond,
}) => {
  const { plots } = useApp();
  const [selectedBlock, setSelectedBlock] = useState<BlockName | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<PlotStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'map' | 'grid'>('blueprint');

  // Filter plots
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchBlock = selectedBlock === 'All' || plot.block === selectedBlock;
      const matchStatus = selectedStatus === 'All' || plot.status === selectedStatus;
      const matchQuery =
        searchQuery === '' ||
        plot.plotNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.dimensions.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchStatus && matchQuery;
    });
  }, [plots, selectedBlock, selectedStatus, searchQuery]);

  // Inventory Metrics
  const metrics = useMemo(() => {
    const total = plots.length;
    const available = plots.filter((p) => p.status === 'available').length;
    const booked = plots.filter((p) => p.status === 'booked').length;
    const sold = plots.filter((p) => p.status === 'sold').length;
    return { total, available, booked, sold };
  }, [plots]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, prev + delta), 2.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="map-page-container">
      {/* Top Filter & Toolbar */}
      <div className="map-toolbar">
        {/* Block Filters */}
        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-forest)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={16} /> Block:
          </span>
          {(['All', 'Block A', 'Block B', 'Block C'] as const).map((block) => (
            <button
              key={block}
              className={`filter-chip ${selectedBlock === block ? 'active' : ''}`}
              onClick={() => setSelectedBlock(block)}
            >
              {block}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-forest)' }}>Status:</span>
          {(['All', 'available', 'booked', 'sold'] as const).map((status) => (
            <button
              key={status}
              className={`filter-chip ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status === 'available' ? 'Available (Green)' : status === 'booked' ? 'Booked (Yellow)' : status === 'sold' ? 'Sold Out (Red)' : 'All Plots'}
            </button>
          ))}
        </div>

        {/* Search Plot & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search Plot No (e.g. A-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`filter-chip ${viewMode === 'blueprint' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setViewMode('blueprint')}
            >
              <FileText size={14} /> Official Layout Map
            </button>
            <button
              className={`filter-chip ${viewMode === 'map' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setViewMode('map')}
            >
              <MapIcon size={14} /> Interactive 2D
            </button>
            <button
              className={`filter-chip ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} /> Touch Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="map-canvas-wrapper">
        <div className="map-header-bar">
          <h3>
            <MapPin size={20} color="var(--accent-gold)" />
            Shubharambh Green City — {viewMode === 'blueprint' ? 'Official Master Architectural Layout Blueprint' : viewMode === 'map' ? 'Interactive 2D Vector Map (Ultra Spaced)' : 'Mobile Touch Plot Grid'}
          </h3>
          <div className="map-controls">
            <a
              href="./assets/layout_plan_master.pdf"
              download="Shubharambh_Green_City_Layout_Plan.pdf"
              className="map-ctrl-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
              title="Download High-Res PDF Layout Plan"
            >
              <Download size={14} /> PDF Download
            </a>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 8px' }}>
              {filteredPlots.length} Plots
            </span>
            <button className="map-ctrl-btn" onClick={() => handleZoom(0.2)} title="Zoom In">
              <ZoomIn size={16} /> +
            </button>
            <button className="map-ctrl-btn" onClick={() => handleZoom(-0.2)} title="Zoom Out">
              <ZoomOut size={16} /> -
            </button>
            <button className="map-ctrl-btn" onClick={handleResetZoom} title="Reset View">
              <RotateCcw size={16} /> Fit
            </button>
          </div>
        </div>

        {viewMode === 'blueprint' ? (
          /* Official Architect Blueprint Layout Map View */
          <div style={{ width: '100%', minHeight: '650px', background: '#0b0f19', overflow: 'auto', padding: '1rem', position: 'relative', textAlign: 'center' }}>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)', display: 'inline-block', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(245,158,11,0.4)' }}>
              <img
                src="./assets/layout_map_fast.jpg"
                alt="Shubharambh Green City Official Layout Blueprint Plan"
                loading="eager"
                decoding="async"
                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Mobile Touch Grid View */
          <div className="mobile-plot-grid">
            {filteredPlots.map((plot) => (
              <div
                key={plot.id}
                className={`mobile-plot-card ${plot.status}`}
                onClick={() => setActivePlot(plot)}
              >
                <div className="mobile-plot-card-header">
                  <span className="mobile-plot-num">{plot.plotNo}</span>
                  <span className={`badge badge-${plot.status}`}>
                    {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {plot.block} • {plot.facing}
                </div>
                <div className="mobile-plot-dim">{plot.dimensions} ({plot.totalArea} sq.ft)</div>
                <div className="mobile-plot-price">₹{plot.totalPrice.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        ) : (
          /* High Precision Non-Overlapping 2D Vector SVG Map */
          <div className="svg-map-viewport" style={{ overflow: 'auto', maxHeight: '780px' }}>
            <svg
              className="map-svg-element"
              viewBox="0 0 1350 7200"
              style={{
                width: '100%',
                height: 'auto',
                minWidth: '1250px',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* BLOCK A BANNER */}
              <g id="block-a-header">
                <rect x="25" y="15" width="1280" height="45" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" rx="8" />
                <text x="40" y="44" fill="#fcd34d" fontSize="16" fontWeight="700">
                  👑 BLOCK A — PREMIUM BOULEVARD SECTOR (Plots A-1 to A-316 | 30'x50', 25'x50', 20'x50')
                </text>
              </g>

              {/* BLOCK B BANNER */}
              <g id="block-b-header">
                <rect x="25" y="2330" width="1280" height="45" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" rx="8" />
                <text x="40" y="2359" fill="#6ee7b7" fontSize="16" fontWeight="700">
                  🌴 BLOCK B — CENTRAL PARK & CLUB HOUSE SECTOR (Plots B-317 to B-680 | 25'x40', 20'x40', 15'x40')
                </text>
              </g>

              {/* BLOCK C BANNER */}
              <g id="block-c-header">
                <rect x="25" y="4990" width="1280" height="45" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" rx="8" />
                <text x="40" y="5019" fill="#93c5fd" fontSize="16" fontWeight="700">
                  🏡 BLOCK C — GARDEN RESIDENTIAL SECTOR (Plots C-681 to C-980 | 25'x40', 20'x40', 15'x40')
                </text>
              </g>

              {/* Render All 980 Plots cleanly with ZERO overlap */}
              {plots.map((plot) => {
                const isFilteredOut = !filteredPlots.some((p) => p.id === plot.id);
                const opacity = isFilteredOut ? 0.15 : 1;

                return (
                  <g key={plot.id} style={{ opacity, transition: 'opacity 0.2s', cursor: 'pointer' }}>
                    <rect
                      x={plot.x}
                      y={plot.y}
                      width={plot.w}
                      height={plot.h}
                      rx="6"
                      className={`svg-plot-rect status-${plot.status}`}
                      onClick={() => setActivePlot(plot)}
                      style={{
                        stroke: plot.status === 'available' ? '#10b981' : plot.status === 'booked' ? '#f59e0b' : '#ef4444',
                        strokeWidth: 1.5,
                      }}
                    >
                      <title>{`Plot ${plot.plotNo} (${plot.block})\nDimensions: ${plot.dimensions}\nArea: ${plot.totalArea} sq.ft\nPrice: ₹${plot.totalPrice.toLocaleString('en-IN')}\nStatus: ${plot.status.toUpperCase()}`}</title>
                    </rect>
                    {/* Plot Number Text */}
                    <text
                      x={plot.x + plot.w / 2}
                      y={plot.y + plot.h / 2 - 4}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {plot.plotNo}
                    </text>
                    {/* Plot Dimensions */}
                    <text
                      x={plot.x + plot.w / 2}
                      y={plot.y + plot.h / 2 + 10}
                      fill="#9ca3af"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {plot.dimensions}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Legend & Architect Info */}
        <div className="map-legend" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="legend-item">
            <div className="legend-color-box available" />
            <span>Available ({metrics.available} Plots)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-box booked" />
            <span>Booked ({metrics.booked} Plots)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-box sold" />
            <span>Sold Out ({metrics.sold} Plots)</span>
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginLeft: 'auto' }}>
            📐 Architect: <strong>Ar. Sachin Pal (The Art Life Architecture)</strong> • Location: Village Hasnapur, Amethi, Lucknow
          </div>
        </div>
      </div>

      {/* Plot Detail Modal */}
      <PlotModal
        plot={activePlot}
        onClose={() => setActivePlot(null)}
        onOpenBooking={onOpenBooking}
        onOpenReceipt={onOpenReceipt}
        onOpenBond={onOpenBond}
      />
    </div>
  );
};
