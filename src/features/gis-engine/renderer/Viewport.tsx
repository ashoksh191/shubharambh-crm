import React, { memo, useRef } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ViewportProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onTransformChange?: (scale: number, posX: number, posY: number) => void;
}

export const Viewport: React.FC<ViewportProps> = memo(({
  children,
  minScale = 0.5,
  maxScale = 10,
  initialScale = 1,
  onTransformChange,
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <div style={wrapperStyle}>
      <TransformWrapper
        ref={transformRef}
        initialScale={initialScale}
        minScale={minScale}
        maxScale={maxScale}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ velocityDisabled: true }}
        centerOnInit={true}
        onTransform={(ref: any) => {
          if (ref?.state && onTransformChange) {
            onTransformChange(ref.state.scale, ref.state.positionX, ref.state.positionY);
          }
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div style={toolbarStyle}>
              <button onClick={() => zoomIn(0.5)} style={btnStyle} title="Zoom In">
                <ZoomIn size={15} />
              </button>
              <button onClick={() => zoomOut(0.5)} style={btnStyle} title="Zoom Out">
                <ZoomOut size={15} />
              </button>
              <button onClick={() => resetTransform()} style={btnStyle} title="Reset Viewport">
                <RotateCcw size={14} />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', willChange: 'transform' }}
            >
              {children}
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
});

Viewport.displayName = 'Viewport';

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: '#0b0f19',
  overflow: 'hidden',
};

const toolbarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(10px)',
  padding: '6px 10px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  padding: '6px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
