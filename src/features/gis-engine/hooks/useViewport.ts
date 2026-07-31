import { useState, useCallback } from 'react';
import type { GISViewportState } from '../types/gis';

export const useViewport = (initialScale = 1, minScale = 0.5, maxScale = 10) => {
  const [viewport, setViewport] = useState<GISViewportState>({
    scale: initialScale,
    posX: 0,
    posY: 0,
    minScale,
    maxScale,
  });

  const zoomIn = useCallback((step = 0.5) => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.maxScale, prev.scale + step),
    }));
  }, []);

  const zoomOut = useCallback((step = 0.5) => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.minScale, prev.scale - step),
    }));
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({
      scale: initialScale,
      posX: 0,
      posY: 0,
      minScale,
      maxScale,
    });
  }, [initialScale, minScale, maxScale]);

  const updateTransform = useCallback((scale: number, posX: number, posY: number) => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.maxScale, Math.max(prev.minScale, scale)),
      posX,
      posY,
    }));
  }, []);

  return {
    viewport,
    zoomIn,
    zoomOut,
    resetViewport,
    updateTransform,
  };
};
