import type { PlotMetadata } from './metadata';
import type { PlotStatus } from './gis';

export type GISEventType =
  | 'PlotBooked'
  | 'PlotReleased'
  | 'PlotSold'
  | 'PriceUpdated'
  | 'CustomerAssigned'
  | 'MetadataUpdated';

export interface GISEventPayloadMap {
  PlotBooked: { plotId: string; customerId: string; bookingId: string; timestamp: string };
  PlotReleased: { plotId: string; previousStatus: PlotStatus; timestamp: string };
  PlotSold: { plotId: string; ownerName: string; timestamp: string };
  PriceUpdated: { plotId: string; newPrice: number; oldPrice: number; timestamp: string };
  CustomerAssigned: { plotId: string; customerId: string; customerName: string; timestamp: string };
  MetadataUpdated: { plotId: string; updatedMetadata: Partial<PlotMetadata>; timestamp: string };
}

export type GISEventListener<K extends GISEventType> = (payload: GISEventPayloadMap[K]) => void;
