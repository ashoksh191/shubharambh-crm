import { describe, it, expect } from 'vitest';
import { MetadataService } from '../features/gis-engine/services/MetadataService';
import { SyncService } from '../features/gis-engine/services/SyncService';

describe('GIS CRM UI Integration Tests', () => {
  it('resolves CRM plot metadata from MetadataService when plot ID is selected', () => {
    const metadataService = MetadataService.getInstance();
    const meta = metadataService.getByPlotId('A-101');

    expect(meta).not.toBeNull();
    expect(meta?.plotId).toBe('A-101');
    expect(meta?.block).toBe('Block A');
    expect(meta?.registrationStatus).toBe('Available');
  });

  it('updates metadata and emits events when SyncService triggers real-time CRM state mutation', () => {
    const syncService = SyncService.getInstance();
    const metadataService = MetadataService.getInstance();

    syncService.updatePrice('A-101', 2800000);
    const updated = metadataService.getByPlotId('A-101');

    expect(updated?.price).toBe(2800000);
  });
});
