import type { GISEventType, GISEventPayloadMap, GISEventListener } from '../types/events';

export class EventBus {
  private static instance: EventBus;
  private listeners: { [K in GISEventType]?: Set<GISEventListener<K>> } = {};

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<K extends GISEventType>(event: K, listener: GISEventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as any;
    }
    (this.listeners[event] as Set<GISEventListener<K>>).add(listener);

    // Return unsubscribe callback
    return () => {
      this.off(event, listener);
    };
  }

  public off<K extends GISEventType>(event: K, listener: GISEventListener<K>): void {
    const set = this.listeners[event] as Set<GISEventListener<K>> | undefined;
    if (set) {
      set.delete(listener);
    }
  }

  public emit<K extends GISEventType>(event: K, payload: GISEventPayloadMap[K]): void {
    const set = this.listeners[event] as Set<GISEventListener<K>> | undefined;
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`Error executing listener for GIS event ${event}:`, err);
        }
      });
    }
  }

  public clearAll(): void {
    this.listeners = {};
  }
}
