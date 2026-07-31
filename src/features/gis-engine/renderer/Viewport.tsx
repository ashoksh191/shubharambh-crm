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
                <ZoomIn size={14} />
              </button>
              <button onClick={() => zoomOut(0.5)} style={btnStyle} title="Zoom Out">
                <ZoomOut size={14} />
              </button>
              <button onClick={() => resetTransform()} style={btnStyle} title="Reset Viewport">
                <RotateCcw size={13} />
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
  background: 'rgba(15, 23, 42, 0.88)',
  backdropFilter: 'blur(16px)',
  padding: '5px 8px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  padding: '6px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms ease, transform 150ms ease',
};
