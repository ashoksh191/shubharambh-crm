import type { BookingMetadata } from '../types/metadata';

export class BookingModel {
  private metadata: BookingMetadata;

  constructor(metadata: BookingMetadata) {
    this.metadata = metadata;
  }

  get id(): string {
    return this.metadata.id;
  }

  get plotId(): string {
    return this.metadata.plotId;
  }

  get bookingAmount(): number {
    return this.metadata.bookingAmount;
  }

  get raw(): BookingMetadata {
    return { ...this.metadata };
  }
}
