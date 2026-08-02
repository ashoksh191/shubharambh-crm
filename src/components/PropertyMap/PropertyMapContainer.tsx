import React, { lazy, Suspense } from 'react';
import { usePropertyMap } from '../../hooks/usePropertyMap';
import { VectorMapCanvas } from './MapCanvas/VectorMapCanvas';
import { PlotDrawer } from './PlotDrawer/PlotDrawer';
import { PlotTooltip } from './Tooltip/PlotTooltip';
import { MapFilters } from './Filters/MapFilters';
import { MapSearch } from './Search/MapSearch';
import { Download, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../styles/Map.css';

const BookingFormModal = lazy(() =>
  import('../Booking/BookingFormModal').then((m) => ({ default: m.BookingFormModal }))
);
const AdminPlotEditorModal = lazy(() =>
  import('./Admin/AdminPlotEditorModal').then((m) => ({ default: m.AdminPlotEditorModal }))
);

import type { EnhancedPlot } from '../../types/propertyMap';

interface PropertyMapContainerProps {
  onOpenBooking: (plot: EnhancedPlot) => void;
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="property-map-wrapper"
      style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}
    >
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
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Compass size={28} color="#0284c7" />
            Official Master Architectural Layout Blueprint
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
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

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="./assets/layout_plan_master.pdf"
            download="Shubharambh_Layout_Blueprint.pdf"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Download size={16} /> Blueprint PDF
          </motion.a>
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
      <Suspense fallback={null}>
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
      </Suspense>
    </motion.div>
  );
};
