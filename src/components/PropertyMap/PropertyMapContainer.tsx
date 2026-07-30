import React from 'react';
import { usePropertyMap } from '../../hooks/usePropertyMap';
import { VectorMapCanvas } from './MapCanvas/VectorMapCanvas';
import { PlotDrawer } from './PlotDrawer/PlotDrawer';
import { PlotTooltip } from './Tooltip/PlotTooltip';
import { MapFilters } from './Filters/MapFilters';
import { MapSearch } from './Search/MapSearch';
import { BookingFormModal } from '../Booking/BookingFormModal';
import { AdminPlotEditorModal } from './Admin/AdminPlotEditorModal';
import { Download, Compass } from 'lucide-react';
import '../../styles/Map.css';

interface PropertyMapContainerProps {
  onOpenBooking: (plot: any) => void;
  onOpenReceipt: (bookingId: string) => void;
  onOpenBond: (bookingId: string) => void;
}

/**
 * Main container component for the Property Map feature.
 * Connects layout controls, filters, search, vector SVG map canvas, tooltip, and modals.
 */
export const PropertyMapContainer: React.FC<PropertyMapContainerProps> = ({
  onOpenBooking,
}) => {
  const {
    enhancedPlots,
    filteredPlots,
    selectedPlot,
    searchedPlot,
    hoveredPlot,
    tooltipPos,
    searchQuery,
    bookingModalPlot,
    adminEditorPlot,
    filters,
    statusCounts,
    setSearchQuery,
    setSearchedPlot,
    setSelectedPlot,
    setBookingModalPlot,
    setAdminEditorPlot,
    setFilters,
    resetFilters,
    handleHoverPlot,
    handleSelectPlot,
    handleUpdatePlotStatus,
    handleUpdatePlotPrice,
    handleSaveAdminUpdate,
  } = usePropertyMap();

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
            GIS Vector SVG Interactive Engine • Google Maps & Apple Maps Digital Standard
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
          onReset={resetFilters}
        />
      </div>

      {/* Vector SVG Canvas Surface */}
      <VectorMapCanvas
        plots={filteredPlots}
        selectedPlot={selectedPlot}
        searchedPlot={searchedPlot}
        statusCounts={statusCounts}
        onSelectPlot={handleSelectPlot}
        onHoverPlot={handleHoverPlot}
      />

      {/* Floating Hover Tooltip */}
      <PlotTooltip plot={hoveredPlot} position={tooltipPos} />

      {/* Side Drawer */}
      <PlotDrawer
        plot={selectedPlot}
        onClose={() => setSelectedPlot(null)}
        onBookPlot={(p) => {
          setBookingModalPlot(p);
          onOpenBooking(p);
        }}
        onUpdateStatus={handleUpdatePlotStatus}
        onUpdatePrice={handleUpdatePlotPrice}
        onOpenAdminEditor={(p) => setAdminEditorPlot(p)}
      />

      {/* Booking Form Modal */}
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

      {/* Admin Plot Editor Modal */}
      {adminEditorPlot && (
        <AdminPlotEditorModal
          plot={adminEditorPlot}
          onClose={() => setAdminEditorPlot(null)}
          onSaveSuccess={handleSaveAdminUpdate}
        />
      )}
    </div>
  );
};
