import React, { lazy, Suspense } from 'react';
import { usePropertyMap } from '../../hooks/usePropertyMap';
import { VectorMapCanvas } from './MapCanvas/VectorMapCanvas';
import { PlotDrawer } from './PlotDrawer/PlotDrawer';
import { PlotTooltip } from './Tooltip/PlotTooltip';
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
 * Main Executive Command Center container for the GIS Property Map feature.
 * Integrates 32px rounded glass viewport canvas, floating top toolbar, HUD stats, plot drawer, and tooltips.
 */
export const PropertyMapContainer: React.FC<PropertyMapContainerProps> = ({
  onOpenBooking,
}) => {
  const {
    enhancedPlots,
    selectedPlot,
    searchedPlot,
    hoveredPlot,
    tooltipPos,
    searchQuery,
    bookingModalPlot,
    adminEditorPlot,
    statusCounts,
    setSearchQuery,
    setSearchedPlot,
    setSelectedPlot,
    setBookingModalPlot,
    setAdminEditorPlot,
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
      style={{ padding: '0 0 24px 0', maxWidth: '100%', margin: '0 auto' }}
    >
      {/* 32px Glass Vector SVG GIS Command Center Surface */}
      <VectorMapCanvas
        plots={enhancedPlots}
        selectedPlot={selectedPlot}
        searchedPlot={searchedPlot}
        statusCounts={statusCounts}
        onSelectPlot={handleSelectPlot}
        onHoverPlot={handleHoverPlot}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          const found = enhancedPlots.find((p) => p.plotNo.toString() === q.trim());
          if (found) {
            setSearchedPlot(found);
            setSelectedPlot(found);
          }
        }}
      />

      {/* Floating Glass Hover Tooltip */}
      <PlotTooltip plot={hoveredPlot} position={tooltipPos} />

      {/* Side Property Inspector Drawer */}
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
