import { useRef, useEffect, useState, useCallback } from 'react';
import type { Point2D } from '../types/gis';
import { SpatialIndex } from '../spatial/SpatialIndex';
import type { QuadtreeItem } from '../spatial/Quadtree';
import { getPolygonBBox } from '../geometry/boundingBox';

export interface SpatialSelectionItem<T = any> {
  id: string;
  polygon: Point2D[];
  data?: T;
}

export function useSpatialSelection<T = any>(
  items: SpatialSelectionItem<T>[] = [],
  onSelect?: (item: SpatialSelectionItem<T> | null) => void
) {
  const spatialIndexRef = useRef<SpatialIndex<T>>(new SpatialIndex<T>());
  const [selectedItem, setSelectedItem] = useState<SpatialSelectionItem<T> | null>(null);
  const [hoveredItem, setHoveredItem] = useState<SpatialSelectionItem<T> | null>(null);

  // Build / rebuild Quadtree spatial index when items array updates
  useEffect(() => {
    const quadItems: QuadtreeItem<T>[] = items.map((item) => ({
      id: item.id,
      bbox: getPolygonBBox(item.polygon),
      polygon: item.polygon,
      data: item.data,
    }));
    spatialIndexRef.current.buildIndex(quadItems);
  }, [items]);

  const handlePointHover = useCallback((px: number, py: number) => {
    const match = spatialIndexRef.current.findPointExactMatch(px, py);
    if (match) {
      setHoveredItem({
        id: match.id,
        polygon: match.polygon,
        data: match.data,
      });
    } else {
      setHoveredItem(null);
    }
  }, []);

  const handlePointClick = useCallback((px: number, py: number) => {
    const match = spatialIndexRef.current.findPointExactMatch(px, py);
    const selected = match ? { id: match.id, polygon: match.polygon, data: match.data } : null;
    setSelectedItem(selected);
    onSelect?.(selected);
  }, [onSelect]);

  const handleNearestLookup = useCallback((px: number, py: number, maxRadius = 50) => {
    const nearest = spatialIndexRef.current.findNearest(px, py, maxRadius);
    return nearest ? { id: nearest.id, polygon: nearest.polygon, data: nearest.data } : null;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    onSelect?.(null);
  }, [onSelect]);

  return {
    selectedItem,
    hoveredItem,
    handlePointHover,
    handlePointClick,
    handleNearestLookup,
    clearSelection,
    spatialIndex: spatialIndexRef.current,
  };
}
