import type { PlotMetadata } from '../types/metadata';
import type { PlotStatus } from '../types/gis';

export class PlotModel {
  private metadata: PlotMetadata;

  constructor(metadata: PlotMetadata) {
    this.metadata = metadata;
  }

  get plotId(): string {
    return this.metadata.plotId;
  }

  get geometryId(): string {
    return this.metadata.geometryId;
  }

  get block(): string {
    return this.metadata.block;
  }

  get areaSqFt(): number {
    return this.metadata.areaSqFt;
  }

  get facing(): string {
    return this.metadata.facing;
  }

  get dimensions(): string {
    return this.metadata.dimensions;
  }

  get status(): PlotStatus {
    return this.metadata.status;
  }

  get price(): number {
    return this.metadata.price;
  }

  get raw(): PlotMetadata {
    return { ...this.metadata };
  }

  isAvailable(): boolean {
    return this.metadata.status === 'available';
  }

  getFormattedPrice(): string {
    return `₹${this.metadata.price.toLocaleString('en-IN')}`;
  }

  calculateTotalCost(): number {
    const base = this.metadata.price;
    const plc = this.metadata.plcRate ? (base * this.metadata.plcRate) / 100 : 0;
    return base + plc;
  }
}
