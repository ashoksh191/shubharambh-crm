import type { Point2D } from '../types/gis';
import { type BoundingBox, doBBoxesIntersect, isPointInBBox } from '../geometry/boundingBox';
import { GIS_INTERACTION_CONSTANTS } from '../constants/gisConstants';

export interface QuadtreeItem<T = any> {
  id: string;
  bbox: BoundingBox;
  polygon: Point2D[];
  data?: T;
}

export class Quadtree<T = any> {
  bounds: BoundingBox;
  capacity: number;
  maxDepth: number;
  depth: number;
  items: QuadtreeItem<T>[];
  divided: boolean;
  northWest: Quadtree<T> | null = null;
  northEast: Quadtree<T> | null = null;
  southWest: Quadtree<T> | null = null;
  southEast: Quadtree<T> | null = null;

  constructor(
    bounds: BoundingBox,
    capacity: number = GIS_INTERACTION_CONSTANTS.QUADTREE_MAX_CAPACITY,
    maxDepth: number = GIS_INTERACTION_CONSTANTS.QUADTREE_MAX_DEPTH,
    depth = 0
  ) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
    this.items = [];
    this.divided = false;
  }

  subdivide(): void {
    const [xmin, ymin, xmax, ymax] = this.bounds;
    const mx = (xmin + xmax) / 2;
    const my = (ymin + ymax) / 2;

    this.northWest = new Quadtree<T>([xmin, ymin, mx, my], this.capacity, this.maxDepth, this.depth + 1);
    this.northEast = new Quadtree<T>([mx, ymin, xmax, my], this.capacity, this.maxDepth, this.depth + 1);
    this.southWest = new Quadtree<T>([xmin, my, mx, ymax], this.capacity, this.maxDepth, this.depth + 1);
    this.southEast = new Quadtree<T>([mx, my, xmax, ymax], this.capacity, this.maxDepth, this.depth + 1);
    this.divided = true;

    // Redistribute items to children if possible
    const existing = this.items;
    this.items = [];
    for (let i = 0; i < existing.length; i++) {
      this.insert(existing[i]);
    }
  }

  insert(item: QuadtreeItem<T>): boolean {
    if (!doBBoxesIntersect(this.bounds, item.bbox)) {
      return false;
    }

    if (this.items.length < this.capacity || this.depth >= this.maxDepth) {
      this.items.push(item);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    let inserted = false;
    if (this.northWest?.insert(item)) inserted = true;
    if (this.northEast?.insert(item)) inserted = true;
    if (this.southWest?.insert(item)) inserted = true;
    if (this.southEast?.insert(item)) inserted = true;

    return inserted;
  }

  remove(id: string): boolean {
    let removed = false;
    const initialLen = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    if (this.items.length !== initialLen) {
      removed = true;
    }

    if (this.divided) {
      if (this.northWest?.remove(id)) removed = true;
      if (this.northEast?.remove(id)) removed = true;
      if (this.southWest?.remove(id)) removed = true;
      if (this.southEast?.remove(id)) removed = true;
    }

    return removed;
  }

  clear(): void {
    this.items = [];
    if (this.divided) {
      this.northWest?.clear();
      this.northEast?.clear();
      this.southWest?.clear();
      this.southEast?.clear();
      this.northWest = null;
      this.northEast = null;
      this.southWest = null;
      this.southEast = null;
      this.divided = false;
    }
  }

  queryBBox(rangeBBox: BoundingBox, found: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    if (!doBBoxesIntersect(this.bounds, rangeBBox)) {
      return found;
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (doBBoxesIntersect(item.bbox, rangeBBox)) {
        if (!found.some((f) => f.id === item.id)) {
          found.push(item);
        }
      }
    }

    if (this.divided) {
      this.northWest?.queryBBox(rangeBBox, found);
      this.northEast?.queryBBox(rangeBBox, found);
      this.southWest?.queryBBox(rangeBBox, found);
      this.southEast?.queryBBox(rangeBBox, found);
    }

    return found;
  }

  queryPoint(px: number, py: number, found: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    if (!isPointInBBox(px, py, this.bounds)) {
      return found;
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (isPointInBBox(px, py, item.bbox)) {
        if (!found.some((f) => f.id === item.id)) {
          found.push(item);
        }
      }
    }

    if (this.divided) {
      this.northWest?.queryPoint(px, py, found);
      this.northEast?.queryPoint(px, py, found);
      this.southWest?.queryPoint(px, py, found);
      this.southEast?.queryPoint(px, py, found);
    }

    return found;
  }
}
