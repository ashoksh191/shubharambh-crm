import type { Point2D } from '../types/gis';
import { getPolygonBBox } from './boundingBox';

/**
 * Calculates the centroid center [cx, cy] for a polygon.
 */
export function getPolygonCenter(polygon: Point2D[]): Point2D {
  if (!polygon || !polygon.length) return [0, 0];
  const [xmin, ymin, xmax, ymax] = getPolygonBBox(polygon);
  return [
    Math.round(((xmin + xmax) / 2) * 100) / 100,
    Math.round(((ymin + ymax) / 2) * 100) / 100,
  ];
}

/**
 * Computes polygon surface area using Shoelace formula.
 */
export function getPolygonArea(polygon: Point2D[]): number {
  if (!polygon || polygon.length < 3) return 0;
  let area = 0;
  const len = polygon.length;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }
  return Math.abs(area / 2.0);
}

/**
 * Computes polygon perimeter (total edge length).
 */
export function getPolygonPerimeter(polygon: Point2D[]): number {
  if (!polygon || polygon.length < 2) return 0;
  let perimeter = 0;
  const len = polygon.length;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    const dx = polygon[j][0] - polygon[i][0];
    const dy = polygon[j][1] - polygon[i][1];
    perimeter += Math.hypot(dx, dy);
  }
  return Math.round(perimeter * 100) / 100;
}

/**
 * Scales/normalizes 2D coordinates into target viewport space.
 */
export function normalizeCoordinates(
  points: Point2D[],
  targetWidth: number,
  targetHeight: number,
  sourceWidth: number,
  sourceHeight: number
): Point2D[] {
  if (!points || !points.length) return [];
  const scaleX = targetWidth / sourceWidth;
  const scaleY = targetHeight / sourceHeight;
  return points.map(([x, y]) => [
    Math.round(x * scaleX * 100) / 100,
    Math.round(y * scaleY * 100) / 100,
  ]);
}
