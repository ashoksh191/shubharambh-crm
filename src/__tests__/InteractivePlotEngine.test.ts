import { describe, it, expect, vi } from 'vitest';
import { SpatialIndex } from '../features/gis-engine/spatial/SpatialIndex';
import { isPointInPolygon } from '../features/gis-engine/geometry/pointInPolygon';
import type { Point2D } from '../features/gis-engine/types/gis';

describe('Interactive Plot Engine Integration Tests', () => {
  const plotA: Point2D[] = [[850, 450], [904, 450], [904, 482], [850, 482]];
  const plotB: Point2D[] = [[1000, 600], [1050, 600], [1050, 640], [1000, 640]];

  it('queries Quadtree spatial index returning candidate bounding box matches', () => {
    const spatialIndex = new SpatialIndex([0, 0, 2384, 1684]);
    spatialIndex.buildIndex([
      { id: 'A-101', bbox: [850, 450, 904, 482], polygon: plotA },
      { id: 'B-201', bbox: [1000, 600, 1050, 640], polygon: plotB },
    ]);

    const candidates = spatialIndex.findCandidatesAtPoint(870, 460);
    expect(candidates.length).toBe(1);
    expect(candidates[0].id).toBe('A-101');
  });

  it('performs exact Ray-Casting Point-in-Polygon check on candidates', () => {
    const spatialIndex = new SpatialIndex([0, 0, 2384, 1684]);
    spatialIndex.buildIndex([
      { id: 'A-101', bbox: [850, 450, 904, 482], polygon: plotA },
    ]);

    const match = spatialIndex.findPointExactMatch(870, 460);
    expect(match).not.toBeNull();
    expect(match?.id).toBe('A-101');

    const outsideMatch = spatialIndex.findPointExactMatch(10, 10);
    expect(outsideMatch).toBeNull();
  });

  it('triggers selection callback with exact plot metadata', () => {
    const selectCallback = vi.fn();
    const spatialIndex = new SpatialIndex([0, 0, 2384, 1684]);
    spatialIndex.buildIndex([
      { id: 'A-325', bbox: [850, 1066, 904, 1098], polygon: [[850, 1066], [904, 1066], [904, 1098], [850, 1098]], data: { plotNo: 'A-325', status: 'available' } },
    ]);

    const match = spatialIndex.findPointExactMatch(870, 1080);
    if (match) {
      selectCallback(match.data);
    }

    expect(selectCallback).toHaveBeenCalledWith({ plotNo: 'A-325', status: 'available' });
  });
});
