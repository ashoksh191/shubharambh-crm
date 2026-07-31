import { useState, useCallback } from 'react';

export interface HoverState<T> {
  hoveredItem: T | null;
  position: { x: number; y: number } | null;
}

export function useHover<T = string>() {
  const [hoverState, setHoverState] = useState<HoverState<T>>({
    hoveredItem: null,
    position: null,
  });

  const handleMouseEnter = useCallback((item: T, e?: React.MouseEvent) => {
    setHoverState({
      hoveredItem: item,
      position: e ? { x: e.clientX, y: e.clientY } : null,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverState({
      hoveredItem: null,
      position: null,
    });
  }, []);

  const clearHover = useCallback(() => {
    setHoverState({
      hoveredItem: null,
      position: null,
    });
  }, []);

  return {
    hoveredItem: hoverState.hoveredItem,
    hoverPosition: hoverState.position,
    handleMouseEnter,
    handleMouseLeave,
    clearHover,
  };
}
