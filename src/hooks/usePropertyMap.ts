import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { enhancePlotData } from '../utils/svgPlotGenerator';
import { fetchPlotsFromApi } from '../services/api';
import type { EnhancedPlot, FilterState, EnhancedPlotStatus } from '../types/propertyMap';

/**
 * Return type interface for the `usePropertyMap` custom hook.
 */
export interface UsePropertyMapReturn {
  enhancedPlots: EnhancedPlot[];
  filteredPlots: EnhancedPlot[];
  selectedPlot: EnhancedPlot | null;
  searchedPlot: EnhancedPlot | null;
  hoveredPlot: EnhancedPlot | null;
  tooltipPos: { x: number; y: number } | null;
  searchQuery: string;
  bookingModalPlot: EnhancedPlot | null;
  adminEditorPlot: EnhancedPlot | null;
  filters: FilterState;
  statusCounts: Record<EnhancedPlotStatus, number>;
  setSearchQuery: (query: string) => void;
  setSearchedPlot: (plot: EnhancedPlot | null) => void;
  setSelectedPlot: (plot: EnhancedPlot | null) => void;
  setBookingModalPlot: (plot: EnhancedPlot | null) => void;
  setAdminEditorPlot: (plot: EnhancedPlot | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  handleHoverPlot: (plot: EnhancedPlot | null, e?: React.MouseEvent) => void;
  handleSelectPlot: (plot: EnhancedPlot) => void;
  handleUpdatePlotStatus: (plotId: string, newStatus: EnhancedPlotStatus) => void;
  handleUpdatePlotPrice: (plotId: string, newPrice: number) => void;
  handleSaveAdminUpdate: (updated: EnhancedPlot) => void;
}

/**
 * Custom hook encapsulating all Property Map state, API synchronization,
 * filtering logic, hover tracking, and plot status update handlers.
 */
export function usePropertyMap(): UsePropertyMapReturn {
  const { plots: rawPlots } = useApp();

  const [enhancedPlots, setEnhancedPlots] = useState<EnhancedPlot[]>(() => enhancePlotData(rawPlots));

  const [selectedPlot, setSelectedPlot] = useState<EnhancedPlot | null>(null);
  const [searchedPlot, setSearchedPlot] = useState<EnhancedPlot | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<EnhancedPlot | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingModalPlot, setBookingModalPlot] = useState<EnhancedPlot | null>(null);
  const [adminEditorPlot, setAdminEditorPlot] = useState<EnhancedPlot | null>(null);

  // Fetch backend API plot status/prices with O(1) Map lookup
  useEffect(() => {
    fetchPlotsFromApi().then((apiPlots) => {
      if (apiPlots && Array.isArray(apiPlots) && apiPlots.length > 0) {
        const apiPlotMap = new Map(apiPlots.map((ap: any) => [ap.plotNo, ap]));
        setEnhancedPlots((prev) =>
          prev.map((p) => {
            const match = apiPlotMap.get(p.plotNo);
            return match
              ? {
                  ...p,
                  totalPrice: match.price || p.totalPrice,
                  enhancedStatus: match.status || p.enhancedStatus,
                  owner: match.owner || p.owner,
                  description: match.description || p.description,
                }
              : p;
          })
        );
      }
    });
  }, []);

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

  const resetFilters = useCallback(() => {
    setFilters({
      block: 'All',
      status: 'All',
      category: 'All',
      facing: 'All',
      minPrice: 0,
      maxPrice: 10000000,
      minArea: 0,
      maxArea: 10000,
    });
  }, []);

  // Memoized Filtered Plots
  const filteredPlots = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return enhancedPlots.filter((p) => {
      if (filters.block !== 'All' && p.block !== filters.block) return false;
      if (filters.status !== 'All' && p.enhancedStatus !== filters.status) return false;
      if (filters.category !== 'All' && p.category !== filters.category) return false;
      if (filters.facing !== 'All' && p.facing !== filters.facing) return false;
      if (trimmedQuery.length > 0 && !p.plotNo.toLowerCase().includes(trimmedQuery)) return false;
      return true;
    });
  }, [enhancedPlots, filters, searchQuery]);

  // Inventory Metric Counts memoized
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

  // Hover Handler
  const handleHoverPlot = useCallback((plot: EnhancedPlot | null, e?: React.MouseEvent) => {
    if (plot && e) {
      setHoveredPlot(plot);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredPlot(null);
      setTooltipPos(null);
    }
  }, []);

  // Select Plot Handler
  const handleSelectPlot = useCallback((plot: EnhancedPlot) => {
    setSelectedPlot(plot);
  }, []);

  // Update Status Handler with functional state setter (no selectedPlot dependency)
  const handleUpdatePlotStatus = useCallback((plotId: string, newStatus: EnhancedPlotStatus) => {
    setEnhancedPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, enhancedStatus: newStatus } : p))
    );
    setSelectedPlot((prev) => (prev?.id === plotId ? { ...prev, enhancedStatus: newStatus } : prev));
  }, []);

  // Update Price Handler with functional state setter (no selectedPlot dependency)
  const handleUpdatePlotPrice = useCallback((plotId: string, newPrice: number) => {
    setEnhancedPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, totalPrice: newPrice } : p))
    );
    setSelectedPlot((prev) => (prev?.id === plotId ? { ...prev, totalPrice: newPrice } : prev));
  }, []);

  // Save Admin Plot Editor Changes Handler
  const handleSaveAdminUpdate = useCallback((updated: EnhancedPlot) => {
    setEnhancedPlots((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedPlot((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  return {
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
  };
}
