import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Plot, BlockName, PlotStatus } from '../../types';
import { PlotModal } from './PlotModal';
import { Search, ZoomIn, ZoomOut, RotateCcw, Filter, MapPin, Grid } from 'lucide-react';
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
    setZoomLevel((prev) => Math.min(Math.max(0.7, prev + delta), 1.8));
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

        {/* Search Plot */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search Plot No (e.g. A-101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main SVG Interactive Layout Viewport */}
      <div className="map-canvas-wrapper">
        <div className="map-header-bar">
          <h3>
            <MapPin size={20} color="var(--accent-gold)" />
            Shubharambh Green City — 60-Bigha Master Layout Plan
          </h3>
          <div className="map-controls">
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '8px' }}>
              Showing {filteredPlots.length} of {plots.length} Plots
            </span>
            <button className="map-ctrl-btn" onClick={() => handleZoom(0.15)} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button className="map-ctrl-btn" onClick={() => handleZoom(-0.15)} title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <button className="map-ctrl-btn" onClick={handleResetZoom} title="Reset View">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Scalable Vector SVG Map */}
        <div className="svg-map-viewport">
          <svg
            className="map-svg-element"
            viewBox="0 0 700 950"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Background Grid Lines & Sector Roads */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* BLOCK A SECTION */}
            <g id="block-a">
              <rect x="25" y="15" width="650" height="320" className="block-banner" rx="12" />
              <text x="40" y="38" className="block-title-text">
                BLOCK A — PREMIUM BOULEVARD (30'x50', 25'x50', 20'x50')
              </text>
              {/* 40Ft Road line */}
              <rect x="35" y="300" width="630" height="24" fill="rgba(148, 163, 184, 0.15)" rx="4" />
              <text x="350" y="316" className="road-text" textAnchor="middle">
                🛣️ 40 FT WIDE MAIN BOULEVARD ROAD
              </text>
            </g>

            {/* BLOCK B SECTION */}
            <g id="block-b">
              <rect x="25" y="355" width="650" height="300" className="block-banner" rx="12" />
              <text x="40" y="378" className="block-title-text">
                BLOCK B — CENTRAL PARK & CLUB HOUSE SECTOR (25'x40', 20'x40', 15'x40')
              </text>
              {/* Park Graphic */}
              <rect x="520" y="420" width="140" height="180" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeDasharray="3" rx="8" />
              <text x="590" y="500" fill="#6ee7b7" fontSize="12" fontWeight="700" textAnchor="middle">
                🌴 CENTRAL PARK &
              </text>
              <text x="590" y="518" fill="#6ee7b7" fontSize="12" fontWeight="700" textAnchor="middle">
                🏊 CLUB HOUSE
              </text>
              {/* 30Ft Road line */}
              <rect x="35" y="625" width="630" height="20" fill="rgba(148, 163, 184, 0.15)" rx="4" />
              <text x="350" y="639" className="road-text" textAnchor="middle">
                🛣️ 30 FT PARK AVENUE ROAD
              </text>
            </g>

            {/* BLOCK C SECTION */}
            <g id="block-c">
              <rect x="25" y="665" width="650" height="260" className="block-banner" rx="12" />
              <text x="40" y="688" className="block-title-text">
                BLOCK C — GARDEN RESIDENTIAL SECTOR (25'x40', 20'x40', 15'x40')
              </text>
            </g>

            {/* Render Plots */}
            {plots.map((plot) => {
              const isFilteredOut = !filteredPlots.some((p) => p.id === plot.id);
              const opacity = isFilteredOut ? 0.2 : 1;

              return (
                <g key={plot.id} style={{ opacity, transition: 'opacity 0.2s' }}>
                  <rect
                    x={plot.x}
                    y={plot.y}
                    width={plot.w}
                    height={plot.h}
                    rx="4"
                    className={`svg-plot-rect status-${plot.status}`}
                    onClick={() => setActivePlot(plot)}
                  >
                    <title>{`Plot ${plot.plotNo} (${plot.block})\nDimensions: ${plot.dimensions}\nArea: ${plot.totalArea} sq.ft\nPrice: ₹${plot.totalPrice.toLocaleString('en-IN')}\nStatus: ${plot.status.toUpperCase()}`}</title>
                  </rect>
                  {/* Plot Number Text */}
                  <text x={plot.x + plot.w / 2} y={plot.y + plot.h / 2 - 6} className="svg-plot-text">
                    {plot.plotNo}
                  </text>
                  {/* Plot Size Dimensions Text */}
                  <text x={plot.x + plot.w / 2} y={plot.y + plot.h / 2 + 8} className="svg-plot-dim">
                    {plot.dimensions}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="map-legend">
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
          <div className="legend-item" style={{ color: 'var(--accent-gold-light)', marginLeft: '12px' }}>
            <Grid size={16} /> Total Capacity: {metrics.total} Plots across 60-Bigha
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
