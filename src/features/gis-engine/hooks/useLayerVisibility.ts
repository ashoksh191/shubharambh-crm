import { useState, useCallback } from 'react';
import type { LayerVisibilityState } from '../types/gis';

export const useLayerVisibility = (initialState?: Partial<LayerVisibilityState>) => {
  const [layers, setLayers] = useState<LayerVisibilityState>({
    boundary: true,
    roads: true,
    commercial: true,
    parks: true,
    ...initialState,
  });

  const toggleLayer = useCallback((layerKey: keyof LayerVisibilityState) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }, []);

  const setAllLayers = useCallback((visible: boolean) => {
    setLayers({
      boundary: visible,
      roads: visible,
      commercial: visible,
      parks: visible,
    });
  }, []);

  return {
    layers,
    toggleLayer,
    setAllLayers,
  };
};
