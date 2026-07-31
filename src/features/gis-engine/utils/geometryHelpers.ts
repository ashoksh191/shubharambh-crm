import type { Point2D } from '../types/gis';

/**
 * Calculates Euclidean 2D distance between two points.
 */
export function distance2D(p1: Point2D, p2: Point2D): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.hypot(dx, dy);
}

/**
 * Clamps a number x within [min, max] range.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Formats area square feet into human-readable string (e.g. "1,200 Sq Ft").
 */
export function formatAreaSqFt(area: number): string {
  return `${Math.round(area).toLocaleString('en-IN')} Sq Ft`;
}

/**
 * Formats dimensions string (e.g. "25' x 50'").
 */
export function formatDimensions(w: number, h: number): string {
  return `${Math.round(w)}' x ${Math.round(h)}'`;
}
