import type { Point2D } from '../types/gis';

/**
 * Formats a 2D point array into an SVG polygon points attribute string.
 */
export function formatSvgPoints(polygon: Point2D[]): string {
  if (!polygon || !polygon.length) return '';
  return polygon.map(([x, y]) => `${x},${y}`).join(' ');
}

/**
 * Calculates the bounding box [xmin, ymin, xmax, ymax] for a polygon.
 */
export function getPolygonBBox(polygon: Point2D[]): [number, number, number, number] {
  if (!polygon || !polygon.length) return [0, 0, 0, 0];
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  const xmin = Math.min(...xs);
  const ymin = Math.min(...ys);
  const xmax = Math.max(...xs);
  const ymax = Math.max(...ys);
  return [xmin, ymin, xmax, ymax];
}

/**
 * Calculates the centroid center [cx, cy] for a polygon.
 */
export function getPolygonCenter(polygon: Point2D[]): Point2D {
  if (!polygon || !polygon.length) return [0, 0];
  const [xmin, ymin, xmax, ymax] = getPolygonBBox(polygon);
  return [(xmin + xmax) / 2, (ymin + ymax) / 2];
}

/**
 * Ray-casting algorithm to test if a point (px, py) lies inside a polygon.
 */
export function isPointInPolygon(px: number, py: number, polygon: Point2D[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
