import React, { useCallback, useMemo } from 'react';
import { InteractiveGisCanvas } from '../renderer/InteractiveGisCanvas';
import type { PlotFeature } from '../types/gis';
import { MetadataService } from '../services/MetadataService';

interface GisEngineViewProps {
  onSelectPlot?: (plot: any) => void;
}

export const GisEngineView: React.FC<GisEngineViewProps> = ({ onSelectPlot }) => {
  const metadataService = useMemo(() => MetadataService.getInstance(), []);

  const handlePlotSelect = useCallback(
    (feature: PlotFeature | null) => {
      if (!feature) {
        onSelectPlot?.(null);
        return;
      }

      const meta = metadataService.getByGeometryId(feature.id);
      if (meta) {
        onSelectPlot?.({
          id: meta.plotId,
          plotNo: meta.plotId,
          block: meta.block,
          areaSqFt: meta.areaSqFt,
          facing: meta.facing,
          dimensions: meta.dimensions,
          status: meta.status,
          price: meta.price,
          x: meta.coordinatesRef[0] ? meta.coordinatesRef[0][0] : 0,
          y: meta.coordinatesRef[0] ? meta.coordinatesRef[0][1] : 0,
          width: 50,
          height: 30,
          points: meta.coordinatesRef,
        });
      } else {
        onSelectPlot?.({
          id: feature.id,
          plotNo: feature.id,
          block: feature.block || 'Block A',
          areaSqFt: feature.areaSqFt || 1000,
          facing: 'East',
          dimensions: '25\' x 40\'',
          status: feature.status || 'available',
          price: feature.price || 2500000,
          x: 0,
          y: 0,
          width: 50,
          height: 30,
          points: feature.polygon,
        });
      }
    },
    [onSelectPlot, metadataService]
  );

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '650px', position: 'relative' }}>
      <InteractiveGisCanvas onPlotSelected={handlePlotSelect} />
    </div>
  );
};
