import { EventBus } from '../events/EventBus';
import { MetadataService } from './MetadataService';
import type { PlotStatus } from '../types/gis';
import type { PlotMetadata } from '../types/metadata';

export interface RealtimeProviderAdapter {
  connect(): void;
  disconnect(): void;
  send(event: string, data: any): void;
}

export class SyncService {
  private static instance: SyncService;
  private eventBus: EventBus;
  private metadataService: MetadataService;
  private adapter: RealtimeProviderAdapter | null = null;

  private constructor(
    eventBus = EventBus.getInstance(),
    metadataService = MetadataService.getInstance()
  ) {
    this.eventBus = eventBus;
    this.metadataService = metadataService;
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public setAdapter(adapter: RealtimeProviderAdapter): void {
    this.adapter = adapter;
    this.adapter.connect();
  }

  public bookPlot(plotId: string, customerId: string, bookingId: string): void {
    const existing = this.metadataService.getByPlotId(plotId);
    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        status: 'booked',
        customerId,
        bookingId,
        registrationStatus: 'Token Paid',
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('PlotBooked', {
      plotId,
      customerId,
      bookingId,
      timestamp: new Date().toISOString(),
    });
  }

  public releasePlot(plotId: string): void {
    const existing = this.metadataService.getByPlotId(plotId);
    const previousStatus: PlotStatus = existing ? existing.status : 'booked';

    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        status: 'available',
        customerId: undefined,
        bookingId: undefined,
        ownerName: undefined,
        registrationStatus: 'Available',
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('PlotReleased', {
      plotId,
      previousStatus,
      timestamp: new Date().toISOString(),
    });
  }

  public sellPlot(plotId: string, ownerName: string): void {
    const existing = this.metadataService.getByPlotId(plotId);
    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        status: 'sold',
        ownerName,
        registrationStatus: 'Registered',
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('PlotSold', {
      plotId,
      ownerName,
      timestamp: new Date().toISOString(),
    });
  }

  public updatePrice(plotId: string, newPrice: number): void {
    const existing = this.metadataService.getByPlotId(plotId);
    const oldPrice = existing ? existing.price : 0;

    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        price: newPrice,
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('PriceUpdated', {
      plotId,
      newPrice,
      oldPrice,
      timestamp: new Date().toISOString(),
    });
  }

  public assignCustomer(plotId: string, customerId: string, customerName: string): void {
    const existing = this.metadataService.getByPlotId(plotId);
    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        customerId,
        ownerName: customerName,
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('CustomerAssigned', {
      plotId,
      customerId,
      customerName,
      timestamp: new Date().toISOString(),
    });
  }

  public updateMetadata(plotId: string, updatedMetadata: Partial<PlotMetadata>): void {
    const existing = this.metadataService.getByPlotId(plotId);
    if (existing) {
      const updated: PlotMetadata = {
        ...existing,
        ...updatedMetadata,
        updatedAt: new Date().toISOString(),
      };
      this.metadataService.registerMetadata(updated);
    }

    this.eventBus.emit('MetadataUpdated', {
      plotId,
      updatedMetadata,
      timestamp: new Date().toISOString(),
    });
  }
}
