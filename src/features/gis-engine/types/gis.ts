export type Point2D = [number, number];

export interface GISFeatureBase {
  id: string;
  name: string;
  bbox: [number, number, number, number];
}

export interface RoadFeature extends GISFeatureBase {
  widthFt: number;
  surfaceType: string;
  centerLine: Point2D[];
  polygon: Point2D[];
}

export interface ParkFeature extends GISFeatureBase {
  category: string;
  polygon: Point2D[];
  areaSqFt: number;
}

export interface CommercialFeature extends GISFeatureBase {
  type: string;
  polygon: Point2D[];
  areaSqFt: number;
}

export interface BoundaryFeature extends GISFeatureBase {
  boundaryType: 'Outer Township Boundary' | 'Block Perimeter Boundary';
  polygon: Point2D[];
}

export interface LayerVisibilityState {
  boundary: boolean;
  roads: boolean;
  commercial: boolean;
  parks: boolean;
}

export interface GISViewportState {
  scale: number;
  posX: number;
  posY: number;
  minScale: number;
  maxScale: number;
}
