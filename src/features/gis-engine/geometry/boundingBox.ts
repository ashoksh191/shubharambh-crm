import type { Point2D } from '../types/gis';

export type BoundingBox = [number, number, number, number]; // [xmin, ymin, xmax, ymax]

/**
 * Computes the 2D bounding box [xmin, ymin, xmax, ymax] for a polygon.
 */
export function getPolygonBBox(polygon: Point2D[]): BoundingBox {
  if (!polygon || !polygon.length) return [0, 0, 0, 0];

  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const [x, y] = polygon[i];
    if (x < xmin) xmin = x;
    if (y < ymin) ymin = y;
    if (x > xmax) xmax = x;
    if (y > ymax) ymax = y;
  }

  return [xmin, ymin, xmax, ymax];
}

/**
 * Checks if a point (px, py) lies within a bounding box [xmin, ymin, xmax, ymax].
 */
export function isPointInBBox(px: number, py: number, bbox: BoundingBox, tolerance = 0): boolean {
  const [xmin, ymin, xmax, ymax] = bbox;
  return (
    px >= xmin - tolerance &&
    px <= xmax + tolerance &&
    py >= ymin - tolerance &&
    py <= ymax + tolerance
  );
}

/**
 * Tests if two 2D bounding boxes overlap.
 */
export function doBBoxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
}
