import type { PlotMetadata } from '../types/metadata';
import defaultPlotsData from '../../../data/plots.generated.json';

export class MetadataService {
  private static instance: MetadataService;
  private cache: Map<string, PlotMetadata> = new Map();
  private plotIdToGeometryIdMap: Map<string, string> = new Map();

  private constructor() {
    this.initializeDefaultIndex();
  }

  public static getInstance(): MetadataService {
    if (!MetadataService.instance) {
      MetadataService.instance = new MetadataService();
    }
    return MetadataService.instance;
  }

  private initializeDefaultIndex(): void {
    const rawData = defaultPlotsData as unknown as Record<string, any>;
    for (const [id, item] of Object.entries(rawData)) {
      const meta: PlotMetadata = {
        plotId: item.plotNo || id,
        geometryId: id,
        block: item.block || (id.startsWith('A') ? 'Block A' : id.startsWith('B') ? 'Block B' : 'Block C'),
        areaSqFt: item.areaSqFt || 1000,
        facing: item.facing || 'East',
        dimensions: item.dimensions || '25\' x 40\'',
        status: item.status || 'available',
        price: item.price || 2500000,
        registrationStatus: item.status === 'sold' ? 'Registered' : item.status === 'booked' ? 'Token Paid' : 'Available',
        documents: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-07-31T00:00:00Z',
        coordinatesRef: item.polygon || [],
        layoutVersion: 'v2.0',
        builderId: 'SHUBHARAMBH_GROUP',
        projectId: 'TOWNSHIP_PHASE_1',
      };

      this.cache.set(id, meta);
      this.plotIdToGeometryIdMap.set(meta.plotId, id);
    }
  }

  public getByGeometryId(geometryId: string): PlotMetadata | null {
    return this.cache.get(geometryId) || null;
  }

  public getByPlotId(plotId: string): PlotMetadata | null {
    const geomId = this.plotIdToGeometryIdMap.get(plotId);
    return geomId ? this.cache.get(geomId) || null : this.cache.get(plotId) || null;
  }

  public registerMetadata(metadata: PlotMetadata): void {
    this.cache.set(metadata.geometryId, metadata);
    this.plotIdToGeometryIdMap.set(metadata.plotId, metadata.geometryId);
  }

  public getAllMetadata(): Map<string, PlotMetadata> {
    return new Map(this.cache);
  }

  public clearCache(): void {
    this.cache.clear();
    this.plotIdToGeometryIdMap.clear();
  }
}
