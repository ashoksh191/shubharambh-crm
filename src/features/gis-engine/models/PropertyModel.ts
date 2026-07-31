import type { PropertyMetadata } from '../types/metadata';

export class PropertyModel {
  private metadata: PropertyMetadata;

  constructor(metadata: PropertyMetadata) {
    this.metadata = metadata;
  }

  get id(): string {
    return this.metadata.id;
  }

  get title(): string {
    return this.metadata.title;
  }

  get builderName(): string {
    return this.metadata.builderName;
  }

  get layoutVersion(): string {
    return this.metadata.layoutVersion;
  }

  get raw(): PropertyMetadata {
    return { ...this.metadata };
  }
}
