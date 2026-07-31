import { Quadtree, type QuadtreeItem } from './Quadtree';
import { type BoundingBox } from '../geometry/boundingBox';
import { isPointInPolygon } from '../geometry/pointInPolygon';
import { GIS_VIEWPORT_CONSTANTS } from '../constants/gisConstants';

export class SpatialIndex<T = any> {
  private quadtree: Quadtree<T>;

  constructor(
    bounds: BoundingBox = [0, 0, GIS_VIEWPORT_CONSTANTS.CANVAS_WIDTH, GIS_VIEWPORT_CONSTANTS.CANVAS_HEIGHT]
  ) {
    this.quadtree = new Quadtree<T>(bounds);
  }

  buildIndex(items: QuadtreeItem<T>[]): void {
    this.quadtree.clear();
    for (let i = 0; i < items.length; i++) {
      this.quadtree.insert(items[i]);
    }
  }

  updateIndex(items: QuadtreeItem<T>[]): void {
    this.buildIndex(items);
  }

  insert(item: QuadtreeItem<T>): void {
    this.quadtree.insert(item);
  }

  remove(id: string): void {
    this.quadtree.remove(id);
  }

  clear(): void {
    this.quadtree.clear();
  }

  findCandidatesAtPoint(px: number, py: number): QuadtreeItem<T>[] {
    return this.quadtree.queryPoint(px, py);
  }

  findInViewport(viewportBBox: BoundingBox): QuadtreeItem<T>[] {
    return this.quadtree.queryBBox(viewportBBox);
  }

  findPointExactMatch(px: number, py: number): QuadtreeItem<T> | null {
    const candidates = this.findCandidatesAtPoint(px, py);
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (isPointInPolygon(px, py, candidate.polygon)) {
        return candidate;
      }
    }
    return null;
  }

  findNearest(px: number, py: number, maxRadius = 50): QuadtreeItem<T> | null {
    const rangeBBox: BoundingBox = [
      px - maxRadius,
      py - maxRadius,
      px + maxRadius,
      py + maxRadius,
    ];
    const candidates = this.quadtree.queryBBox(rangeBBox);
    let nearest: QuadtreeItem<T> | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      const cx = (item.bbox[0] + item.bbox[2]) / 2;
      const cy = (item.bbox[1] + item.bbox[3]) / 2;
      const dist = Math.hypot(cx - px, cy - py);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = item;
      }
    }

    return nearest;
  }
}
