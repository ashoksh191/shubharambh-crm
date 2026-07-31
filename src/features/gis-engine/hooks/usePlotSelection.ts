import { useState, useCallback } from 'react';

export function usePlotSelection(initialSelectedId: string | null = null) {
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(initialSelectedId);

  const selectPlot = useCallback((plotId: string | null) => {
    setSelectedPlotId(plotId);
  }, []);

  const togglePlot = useCallback((plotId: string) => {
    setSelectedPlotId((prev) => (prev === plotId ? null : plotId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlotId(null);
  }, []);

  return {
    selectedPlotId,
    selectPlot,
    togglePlot,
    clearSelection,
  };
}
