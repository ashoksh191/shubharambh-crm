import type { PlotStatus, Point2D } from './gis';

export interface PlotMetadata {
  plotId: string;
  geometryId: string;
  block: string;
  areaSqFt: number;
  facing: 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  dimensions: string;
  status: PlotStatus;
  price: number;
  plcRate?: number;
  totalCost?: number;
  ownerName?: string;
  bookingId?: string;
  customerId?: string;
  registrationStatus: 'Available' | 'Token Paid' | 'Registered' | 'Hold' | 'Cancelled';
  documents: Array<{ id: string; title: string; url: string; type: string }>;
  createdAt: string;
  updatedAt: string;
  coordinatesRef: Point2D[];
  layoutVersion?: string;
  builderId?: string;
  projectId?: string;
}

export interface PropertyMetadata {
  id: string;
  title: string;
  location: string;
  totalPlots: number;
  layoutVersion: string;
  builderName: string;
  masterPdfPath: string;
}

export interface CustomerMetadata {
  id: string;
  name: string;
  phone: string;
  email: string;
  kycStatus: 'Verified' | 'Pending' | 'Not Started';
}

export interface BookingMetadata {
  id: string;
  plotId: string;
  customerId: string;
  bookingAmount: number;
  paymentStatus: 'Pending' | 'Completed' | 'Refunded';
  bookingDate: string;
}
