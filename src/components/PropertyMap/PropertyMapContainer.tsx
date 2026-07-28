import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { enhancePlotData } from '../../utils/svgPlotGenerator';
import type { EnhancedPlot, FilterState, EnhancedPlotStatus } from '../../types/propertyMap';
import { VectorMapCanvas } from './MapCanvas/VectorMapCanvas';
import { PlotDrawer } from './PlotDrawer/PlotDrawer';
import { PlotTooltip } from './Tooltip/PlotTooltip';
import { MapFilters } from './Filters/MapFilters';
import { MapSearch } from './Search/MapSearch';
import { BookingFormModal } from '../Booking/BookingFormModal';
import { Download, Compass } from 'lucide-react';
import '../../styles/Map.css';

interface PropertyMapContainerProps {
  onOpenBooking: (plot: any) => void;
  onOpenReceipt: (bookingId: string) => void;
  onOpenBond: (bookingId: string) => void;
}

export const PropertyMapContainer: React.FC<PropertyMapContainerProps> = ({
  onOpenBooking,
}) => {
  const { plots: rawPlots } = useApp();

  // Enhance raw plots into rich vector plots
  const [enhancedPlots, setEnhancedPlots] = useState<EnhancedPlot[]>(() => enhancePlotData(rawPlots));

  const [selectedPlot, setSelectedPlot] = useState<EnhancedPlot | null>(null);
  const [searchedPlot, setSearchedPlot] = useState<EnhancedPlot | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<EnhancedPlot | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalPlot, setBookingModalPlot] = useState<EnhancedPlot | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    block: 'All',
    status: 'All',
    category: 'All',
    facing: 'All',
    minPrice: 0,
    maxPrice: 10000000,
    minArea: 0,
    maxArea: 10000,
  });

  // Calculate Filtered Plots
  const filteredPlots = useMemo(() => {
    return enhancedPlots.filter((p) => {
      if (filters.block !== 'All' && p.block !== filters.block) return false;
      if (filters.status !== 'All' && p.enhancedStatus !== filters.status) return false;
      if (filters.category !== 'All' && p.category !== filters.category) return false;
      if (filters.facing !== 'All' && p.facing !== filters.facing) return false;
      if (searchQuery.trim().length > 0 && !p.plotNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [enhancedPlots, filters, searchQuery]);

  // Inventory Metric Counts
  const statusCounts = useMemo(() => {
    const counts: Record<EnhancedPlotStatus, number> = {
      available: 0,
      reserved: 0,
      booked: 0,
      sold: 0,
      unreleased: 0,
    };
    enhancedPlots.forEach((p) => {
      counts[p.enhancedStatus] = (counts[p.enhancedStatus] || 0) + 1;
    });
    return counts;
  }, [enhancedPlots]);

  const handleHoverPlot = useCallback((plot: EnhancedPlot | null, e?: React.MouseEvent) => {
    setHoveredPlot(plot);
    if (e) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setTooltipPos(null);
    }
  }, []);

  const handleUpdatePlotStatus = (plotId: string, newStatus: EnhancedPlotStatus) => {
    setEnhancedPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, enhancedStatus: newStatus } : p))
    );
    if (selectedPlot?.id === plotId) {
      setSelectedPlot((prev) => (prev ? { ...prev, enhancedStatus: newStatus } : null));
    }
  };

  const handleUpdatePlotPrice = (plotId: string, newPrice: number) => {
    setEnhancedPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, totalPrice: newPrice } : p))
    );
    if (selectedPlot?.id === plotId) {
      setSelectedPlot((prev) => (prev ? { ...prev, totalPrice: newPrice } : null));
    }
  };

  return (
    <div className="property-map-wrapper" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Compass size={28} color="#f59e0b" />
            Official Master Architectural Layout Blueprint
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Interactive Vector SVG Property Engine • Village Hasnapur, Amethi (Lucknow Road)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapSearch
            plots={enhancedPlots}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectPlot={(p) => {
              setSearchedPlot(p);
              setSelectedPlot(p);
            }}
          />

          <a
            href="./assets/layout_plan_master.pdf"
            download="Shubharambh_Layout_Blueprint.pdf"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid #10b981',
              padding: '10px 16px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={16} /> Blueprint PDF
          </a>
        </div>
      </div>

      {/* Multi-Filters Toolbar */}
      <div style={{ marginBottom: '16px' }}>
        <MapFilters
          filters={filters}
          onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
          onReset={() =>
            setFilters({
              block: 'All',
              status: 'All',
              category: 'All',
              facing: 'All',
              minPrice: 0,
              maxPrice: 10000000,
              minArea: 0,
              maxArea: 10000,
            })
          }
        />
      </div>

      {/* Vector SVG Infinite Zoom Canvas Surface */}
      <VectorMapCanvas
        plots={filteredPlots}
        selectedPlot={selectedPlot}
        searchedPlot={searchedPlot}
        statusCounts={statusCounts}
        onSelectPlot={(plot) => setSelectedPlot(plot)}
        onHoverPlot={handleHoverPlot}
      />

      {/* Floating Hover Tooltip */}
      <PlotTooltip plot={hoveredPlot} position={tooltipPos} />

      {/* Premium Side Drawer (Sliding from Right) */}
      <PlotDrawer
        plot={selectedPlot}
        onClose={() => setSelectedPlot(null)}
        onBookPlot={(p) => {
          setBookingModalPlot(p);
          onOpenBooking(p);
        }}
        onUpdateStatus={handleUpdatePlotStatus}
        onUpdatePrice={handleUpdatePlotPrice}
      />

      {/* Booking Modal */}
      {bookingModalPlot && (
        <BookingFormModal
          plot={bookingModalPlot}
          onClose={() => setBookingModalPlot(null)}
          onSuccess={() => {
            handleUpdatePlotStatus(bookingModalPlot.id, 'booked');
            setBookingModalPlot(null);
          }}
        />
      )}
    </div>
  );
};
