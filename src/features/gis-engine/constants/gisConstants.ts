import type { PlotStatus } from '../types/gis';

export type GisRenderMode = 'production' | 'developer';

export const GIS_RENDER_MODE: GisRenderMode = 'production';

export const GIS_COLORS: Record<PlotStatus | 'selected' | 'searched' | 'background' | 'grid' | 'boundary' | 'road' | 'park' | 'commercial', string> = {
  available: '#059669',
  reserved: '#d97706',
  booked: '#2563eb',
  sold: '#dc2626',
  unreleased: '#475569',
  selected: '#38bdf8',
  searched: '#f59e0b',
  background: '#0b0f19',
  grid: 'rgba(255, 255, 255, 0.035)',
  boundary: '#38bdf8',
  road: '#f8fafc',
  park: '#059669',
  commercial: '#7c3aed',
};

export const GIS_FILL_OPACITY: Record<PlotStatus | 'selected' | 'park' | 'commercial', string> = {
  available: 'rgba(16, 185, 129, 0.35)',
  reserved: 'rgba(245, 158, 11, 0.35)',
  booked: 'rgba(59, 130, 246, 0.35)',
  sold: 'rgba(239, 68, 68, 0.35)',
  unreleased: 'rgba(100, 116, 139, 0.30)',
  selected: 'rgba(56, 189, 248, 0.45)',
  park: 'rgba(16, 185, 129, 0.28)',
  commercial: 'rgba(124, 58, 237, 0.28)',
};

export const GIS_LOD_THRESHOLDS = {
  LOW_ZOOM_MAX: 1.5,
  MEDIUM_ZOOM_MAX: 3.0,
  HIGH_ZOOM_MIN: 5.0,
} as const;

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
  'parks',
  'commercial',
  'roads',
  'plots',
  'labels',
] as const;

export const GIS_INTERACTION_CONSTANTS = {
  HIT_TOLERANCE_PX: 5,
  QUADTREE_MAX_CAPACITY: 8,
  QUADTREE_MAX_DEPTH: 8,
  ANIMATION_DURATION_FAST_MS: 150,
  ANIMATION_DURATION_NORMAL_MS: 200,
} as const;
