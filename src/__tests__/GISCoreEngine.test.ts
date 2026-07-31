import { describe, it, expect } from 'vitest';
import { isPointInPolygon } from '../features/gis-engine/geometry/pointInPolygon';
import { getPolygonBBox, doBBoxesIntersect } from '../features/gis-engine/geometry/boundingBox';
import { getPolygonCenter, getPolygonArea, getPolygonPerimeter } from '../features/gis-engine/geometry/geometry';
import { Quadtree } from '../features/gis-engine/spatial/Quadtree';
import { SpatialIndex } from '../features/gis-engine/spatial/SpatialIndex';
import type { Point2D } from '../features/gis-engine/types/gis';

describe('GIS Core Engine Unit Tests', () => {
  const squarePoly: Point2D[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ];

  describe('Point In Polygon (Ray-Casting)', () => {
    it('returns true for points inside the polygon', () => {
      expect(isPointInPolygon(50, 50, squarePoly)).toBe(true);
      expect(isPointInPolygon(10, 10, squarePoly)).toBe(true);
      expect(isPointInPolygon(90, 90, squarePoly)).toBe(true);
    });

    it('returns false for points outside the polygon', () => {
      expect(isPointInPolygon(150, 50, squarePoly)).toBe(false);
      expect(isPointInPolygon(-10, 50, squarePoly)).toBe(false);
      expect(isPointInPolygon(50, 200, squarePoly)).toBe(false);
    });

    it('returns false for invalid polygon input', () => {
      expect(isPointInPolygon(50, 50, [])).toBe(false);
      expect(isPointInPolygon(50, 50, [[0, 0], [10, 10]])).toBe(false);
    });
  });

  describe('Bounding Box & Calculations', () => {
    it('computes exact [xmin, ymin, xmax, ymax] bounding box', () => {
      const bbox = getPolygonBBox(squarePoly);
      expect(bbox).toEqual([0, 0, 100, 100]);
    });

    it('correctly tests bounding box intersection', () => {
      expect(doBBoxesIntersect([0, 0, 100, 100], [50, 50, 150, 150])).toBe(true);
      expect(doBBoxesIntersect([0, 0, 100, 100], [150, 150, 200, 200])).toBe(false);
    });
  });

  describe('Polygon Geometry Metrics', () => {
    it('calculates polygon centroid center', () => {
      const center = getPolygonCenter(squarePoly);
      expect(center).toEqual([50, 50]);
    });

    it('calculates polygon surface area using Shoelace formula', () => {
      const area = getPolygonArea(squarePoly);
      expect(area).toBe(10000); // 100 x 100 = 10,000
    });

    it('calculates polygon perimeter', () => {
      const perimeter = getPolygonPerimeter(squarePoly);
      expect(perimeter).toBe(400); // 100 * 4 = 400
    });
  });

  describe('Quadtree Spatial Partitioning Indexing', () => {
    it('inserts items and subdivides node when capacity exceeded', () => {
      const quadtree = new Quadtree([0, 0, 1000, 1000], 2, 4);

      quadtree.insert({ id: 'P1', bbox: [10, 10, 50, 50], polygon: [[10, 10], [50, 10], [50, 50], [10, 50]] });
      quadtree.insert({ id: 'P2', bbox: [100, 100, 150, 150], polygon: [[100, 100], [150, 100], [150, 150], [100, 150]] });
      quadtree.insert({ id: 'P3', bbox: [600, 600, 650, 650], polygon: [[600, 600], [650, 600], [650, 650], [600, 650]] });

      expect(quadtree.divided).toBe(true);
    });

    it('queries bounding box ranges returning matching candidates', () => {
      const quadtree = new Quadtree([0, 0, 1000, 1000]);

      quadtree.insert({ id: 'P1', bbox: [10, 10, 50, 50], polygon: [[10, 10], [50, 10], [50, 50], [10, 50]] });
      quadtree.insert({ id: 'P2', bbox: [600, 600, 650, 650], polygon: [[600, 600], [650, 600], [650, 650], [600, 650]] });

      const results = quadtree.queryBBox([0, 0, 100, 100]);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('P1');
    });

    it('queries spatial point returning matching items', () => {
      const quadtree = new Quadtree([0, 0, 1000, 1000]);
      quadtree.insert({ id: 'P1', bbox: [10, 10, 50, 50], polygon: [[10, 10], [50, 10], [50, 50], [10, 50]] });

      const hits = quadtree.queryPoint(25, 25);
      expect(hits.length).toBe(1);
      expect(hits[0].id).toBe('P1');
    });
  });

  describe('SpatialIndex Manager & Selection Lookup', () => {
    it('performs exact spatial selection matching', () => {
      const spatialIndex = new SpatialIndex([0, 0, 1000, 1000]);
      spatialIndex.buildIndex([
        { id: 'PLOT-A', bbox: [10, 10, 50, 50], polygon: [[10, 10], [50, 10], [50, 50], [10, 50]] },
        { id: 'PLOT-B', bbox: [100, 100, 150, 150], polygon: [[100, 100], [150, 100], [150, 150], [100, 150]] },
      ]);

      const match = spatialIndex.findPointExactMatch(25, 25);
      expect(match).not.toBeNull();
      expect(match?.id).toBe('PLOT-A');
    });
  });
});
