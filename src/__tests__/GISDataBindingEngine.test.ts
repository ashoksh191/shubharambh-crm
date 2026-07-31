import { describe, it, expect } from 'vitest';
import { MetadataService } from '../features/gis-engine/services/MetadataService';
import { PlotBindingService } from '../features/gis-engine/services/PlotBindingService';
import { PlotModel } from '../features/gis-engine/models/PlotModel';

describe('GIS Data Binding Engine Unit Tests', () => {
  it('pre-indexes plot geometries into Map<GeometryId, PlotMetadata> cache', () => {
    const metadataService = MetadataService.getInstance();
    const meta = metadataService.getByGeometryId('A-101');
    expect(meta).not.toBeNull();
    expect(meta?.geometryId).toBe('A-101');
    expect(meta?.block).toBe('Block A');
  });

  it('binds raw polygon geometry to PlotModel domain instance', () => {
    const metadataService = MetadataService.getInstance();
    const bindingService = new PlotBindingService(metadataService);

    const poly: [number, number][] = [[10, 10], [50, 10], [50, 50], [10, 50]];
    const model = bindingService.bindPlotGeometry('A-101', poly);

    expect(model).toBeInstanceOf(PlotModel);
    expect(model?.geometryId).toBe('A-101');
    expect(model?.raw.coordinatesRef).toEqual(poly);
  });

  it('calculates total cost with PLC percentage dynamically', () => {
    const model = new PlotModel({
      plotId: 'A-325',
      geometryId: 'A-325',
      block: 'Block A',
      areaSqFt: 1200,
      facing: 'East',
      dimensions: "30' x 40'",
      status: 'available',
      price: 3000000,
      plcRate: 10, // 10% PLC
      registrationStatus: 'Available',
      documents: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-07-31T00:00:00Z',
      coordinatesRef: [],
    });

    expect(model.getFormattedPrice()).toBe('₹30,00,000');
    expect(model.calculateTotalCost()).toBe(3300000); // 30,00,000 + 3,00,000 = 33,00,000
  });

  it('supports custom metadata registration for multi-layout scalability', () => {
    const metadataService = MetadataService.getInstance();
    metadataService.registerMetadata({
      plotId: 'CUSTOM-999',
      geometryId: 'GEOM-999',
      block: 'Block Z',
      areaSqFt: 2500,
      facing: 'North',
      dimensions: "50' x 50'",
      status: 'available',
      price: 5000000,
      registrationStatus: 'Available',
      documents: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-07-31T00:00:00Z',
      coordinatesRef: [],
      projectId: 'PROJECT_PHASE_2',
    });

    const registered = metadataService.getByGeometryId('GEOM-999');
    expect(registered).not.toBeNull();
    expect(registered?.block).toBe('Block Z');
    expect(registered?.projectId).toBe('PROJECT_PHASE_2');
  });
});
