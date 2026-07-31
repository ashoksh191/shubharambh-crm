import type { PlotStatus } from '../types/gis';

export const GIS_COLORS: Record<PlotStatus | 'selected' | 'searched' | 'background' | 'grid' | 'boundary' | 'road' | 'park' | 'commercial', string> = {
  available: '#10b981',
  reserved: '#f59e0b',
  booked: '#3b82f6',
  sold: '#ef4444',
  unreleased: '#64748b',
  selected: '#38bdf8',
  searched: '#f59e0b',
  background: '#0b0f19',
  grid: 'rgba(255, 255, 255, 0.04)',
  boundary: '#38bdf8',
  road: '#1e293b',
  park: '#10b981',
  commercial: '#8b5cf6',
};

export const GIS_VIEWPORT_CONSTANTS = {
  CANVAS_WIDTH: 2384,
  CANVAS_HEIGHT: 1684,
  MIN_SCALE: 0.5,
  MAX_SCALE: 10.0,
  DEFAULT_SCALE: 1.0,
  TARGET_ZOOM_SCALE: 3.0,
  WHEEL_STEP: 0.1,
} as const;

export const GIS_LAYER_ORDER = [
  'boundary',
  'roads',
  'commercial',
  'parks',
  'plots',
  'labels',
] as const;

export const GIS_INTERACTION_CONSTANTS = {
  HIT_TOLERANCE_PX: 5,
  QUADTREE_MAX_CAPACITY: 8,
  QUADTREE_MAX_DEPTH: 8,
  ANIMATION_DURATION_FAST_MS: 150,
  ANIMATION_DURATION_NORMAL_MS: 400,
} as const;
