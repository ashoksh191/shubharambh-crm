import { useState, useEffect, useCallback } from 'react';
import { EventBus } from '../events/EventBus';
import { MetadataService } from '../services/MetadataService';
import type { PlotMetadata } from '../types/metadata';
import type { GISEventType } from '../types/events';

export function useRealtimeMetadata(plotId?: string | null) {
  const metadataService = MetadataService.getInstance();
  const eventBus = EventBus.getInstance();

  const [metadata, setMetadata] = useState<PlotMetadata | null>(() => {
    return plotId ? metadataService.getByPlotId(plotId) : null;
  });

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>(new Date().toISOString());

  const refreshMetadata = useCallback(() => {
    if (plotId) {
      setMetadata(metadataService.getByPlotId(plotId));
    }
    setLastSyncTimestamp(new Date().toISOString());
  }, [plotId, metadataService]);

  useEffect(() => {
    if (plotId) {
      setMetadata(metadataService.getByPlotId(plotId));
    }
  }, [plotId, metadataService]);

  useEffect(() => {
    const eventsToListen: GISEventType[] = [
      'PlotBooked',
      'PlotReleased',
      'PlotSold',
      'PriceUpdated',
      'CustomerAssigned',
      'MetadataUpdated',
    ];

    const unsubscribes = eventsToListen.map((event) => {
      return eventBus.on(event, (payload: any) => {
        if (!plotId || payload.plotId === plotId) {
          refreshMetadata();
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [plotId, eventBus, refreshMetadata]);

  return {
    metadata,
    lastSyncTimestamp,
    refreshMetadata,
  };
}
