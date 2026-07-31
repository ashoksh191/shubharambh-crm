import { useMemo } from 'react';
import { MetadataService } from '../services/MetadataService';
import { PlotBindingService } from '../services/PlotBindingService';
import { PlotModel } from '../models/PlotModel';
import type { PlotMetadata } from '../types/metadata';

export function usePlotData(geometryId: string | null) {
  const metadataService = useMemo(() => MetadataService.getInstance(), []);
  const bindingService = useMemo(() => new PlotBindingService(metadataService), [metadataService]);

  const metadata: PlotMetadata | null = useMemo(() => {
    if (!geometryId) return null;
    return metadataService.getByGeometryId(geometryId);
  }, [geometryId, metadataService]);

  const plotModel: PlotModel | null = useMemo(() => {
    if (!geometryId || !metadata) return null;
    return bindingService.bindPlotGeometry(geometryId, metadata.coordinatesRef);
  }, [geometryId, metadata, bindingService]);

  return {
    metadata,
    plotModel,
    isAvailable: plotModel?.isAvailable() ?? false,
    formattedPrice: plotModel?.getFormattedPrice() ?? '',
    totalCost: plotModel?.calculateTotalCost() ?? 0,
  };
}
