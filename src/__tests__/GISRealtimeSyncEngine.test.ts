import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../features/gis-engine/events/EventBus';
import { SyncService } from '../features/gis-engine/services/SyncService';
import { MetadataService } from '../features/gis-engine/services/MetadataService';

describe('Real-Time GIS Synchronization Engine Unit Tests', () => {
  beforeEach(() => {
    EventBus.getInstance().clearAll();
  });

  it('publishes and subscribes to PlotBooked events', () => {
    const eventBus = EventBus.getInstance();
    const listener = vi.fn();

    const unsub = eventBus.on('PlotBooked', listener);
    eventBus.emit('PlotBooked', {
      plotId: 'A-101',
      customerId: 'CUST-001',
      bookingId: 'B-888',
      timestamp: '2026-07-31T18:00:00Z',
    });

    expect(listener).toHaveBeenCalledWith({
      plotId: 'A-101',
      customerId: 'CUST-001',
      bookingId: 'B-888',
      timestamp: '2026-07-31T18:00:00Z',
    });

    unsub();
  });

  it('SyncService updates MetadataService cache and emits event on plot booking', () => {
    const syncService = SyncService.getInstance();
    const metadataService = MetadataService.getInstance();
    const listener = vi.fn();

    EventBus.getInstance().on('PlotBooked', listener);

    syncService.bookPlot('A-101', 'CUST-100', 'BOOK-100');

    const updated = metadataService.getByPlotId('A-101');
    expect(updated?.status).toBe('booked');
    expect(updated?.customerId).toBe('CUST-100');
    expect(listener).toHaveBeenCalled();
  });

  it('SyncService updates price and emits PriceUpdated event', () => {
    const syncService = SyncService.getInstance();
    const metadataService = MetadataService.getInstance();
    const listener = vi.fn();

    EventBus.getInstance().on('PriceUpdated', listener);

    syncService.updatePrice('A-101', 3500000);

    const updated = metadataService.getByPlotId('A-101');
    expect(updated?.price).toBe(3500000);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        plotId: 'A-101',
        newPrice: 3500000,
      })
    );
  });

  it('SyncService releases plot and reverts status to available', () => {
    const syncService = SyncService.getInstance();
    const metadataService = MetadataService.getInstance();

    syncService.bookPlot('A-102', 'CUST-200', 'BOOK-200');
    expect(metadataService.getByPlotId('A-102')?.status).toBe('booked');

    syncService.releasePlot('A-102');
    expect(metadataService.getByPlotId('A-102')?.status).toBe('available');
  });
});
