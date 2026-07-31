import type { Point2D } from '../types/gis';

/**
 * High-performance Ray-Casting Point-in-Polygon algorithm.
 * Returns true if (px, py) lies inside the 2D polygon.
 */
export function isPointInPolygon(px: number, py: number, polygon: Point2D[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const len = polygon.length;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
