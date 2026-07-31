import { MetadataService } from './MetadataService';
import { PlotModel } from '../models/PlotModel';
import type { PlotFeature } from '../types/gis';

export class PlotBindingService {
  private metadataService: MetadataService;

  constructor(metadataService = MetadataService.getInstance()) {
    this.metadataService = metadataService;
  }

  public bindPlotGeometry(geometryId: string, polygon: [number, number][]): PlotModel | null {
    const metadata = this.metadataService.getByGeometryId(geometryId);
    if (!metadata) return null;

    return new PlotModel({
      ...metadata,
      coordinatesRef: polygon,
    });
  }

  public bindFeature(feature: PlotFeature): PlotModel | null {
    const metadata = this.metadataService.getByGeometryId(feature.id);
    if (!metadata) return null;

    return new PlotModel({
      ...metadata,
      coordinatesRef: feature.polygon,
    });
  }
}
