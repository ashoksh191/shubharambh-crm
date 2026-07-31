import type { CustomerMetadata } from '../types/metadata';

export class CustomerModel {
  private metadata: CustomerMetadata;

  constructor(metadata: CustomerMetadata) {
    this.metadata = metadata;
  }

  get id(): string {
    return this.metadata.id;
  }

  get name(): string {
    return this.metadata.name;
  }

  get phone(): string {
    return this.metadata.phone;
  }

  get raw(): CustomerMetadata {
    return { ...this.metadata };
  }
}
