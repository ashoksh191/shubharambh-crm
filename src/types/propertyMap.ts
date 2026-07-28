import type { Plot, BlockName } from '../types';

export type EnhancedPlotStatus = 'available' | 'reserved' | 'booked' | 'sold' | 'unreleased';

export type PlotCategory = 'Residential' | 'Commercial' | 'Corner' | 'Park Facing' | 'Road Facing' | 'Mixed Use';

export type PlotFacing = 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface Amenity {
  name: string;
  category: 'Temple' | 'School' | 'Hospital' | 'Market' | 'Highway' | 'Club' | 'Garden';
  distance: string;
  icon: string;
}

export type PlotHistoryStage = 'Created' | 'Visited' | 'Reserved' | 'Payment Pending' | 'Booked' | 'Registry Completed';

export interface PlotHistoryItem {
  id: string;
  timestamp: string;
  stage: PlotHistoryStage;
  description: string;
  performedBy: string;
}

export interface PlotDocument {
  id: string;
  title: string;
  type: 'Brochure PDF' | 'Registry Copy' | 'Layout PDF' | 'Government Approval' | 'NOC' | 'Mutation';
  fileUrl: string;
  updatedAt: string;
}

export interface EnhancedPlot extends Plot {
  enhancedStatus: EnhancedPlotStatus;
  category: PlotCategory;
  plcRate?: number;
  description?: string;
  facing: any;
  amenities: Amenity[];
  history: PlotHistoryItem[];
  documents: PlotDocument[];
  assignedSalesperson?: string;
  svgPathPoints?: string;
}

export interface FilterState {
  block: BlockName | 'All';
  status: EnhancedPlotStatus | 'All';
  category: PlotCategory | 'All';
  facing: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
}
