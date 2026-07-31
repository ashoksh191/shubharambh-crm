# GIS Engine v2 — Performance Budget & Optimization Strategy

## 1. Performance Target Metrics

| Metric | Target Budget | Measurement Method | Strategy |
|---|---|---|---|
| **Frame Rate** | **60 FPS** (16.6ms frame budget) | Chrome Performance Profiler | Canvas 2D / WebGL buffer for 5,000+ polygons |
| **Hover Hit Detection** | **< 2ms** | `performance.now()` | R-Tree / QuadTree spatial index in Web Worker |
| **Initial Map Load** | **< 400ms** | Lighthouse / Core Web Vitals | Fast JSON chunk loading + Progressive SVG render |
| **Memory Footprint** | **< 45 MB** Heap Memory | Chrome Memory Snapshot | Zero-allocation object pooling for geometries |
| **DOM Node Count** | **< 300 Nodes** | Chrome DevTools DOM Counter | Viewport spatial culling & LOD virtualization |

---

## 2. Web Worker Geometry Offloading Architecture

To eliminate main thread UI blocking during intensive spatial calculations, geometry tasks are delegated to a dedicated Web Worker thread (`src/features/gis-engine/workers/geometryWorker.ts`):

```
┌──────────────────────────────┐              ┌──────────────────────────────┐
│       Main UI Thread         │              │   Dedicated Web Worker       │
│  (React, DOM, Animations)    │              │  (Geometry Calculation)      │
├──────────────────────────────┤              ├──────────────────────────────┤
│                              │  PostMessage │                              │
│  Mouse Move Event (x, y)    ├─────────────►│  R-Tree Bounding Box Search   │
│                              │              │  Point-in-Polygon Detection  │
│                              │  Message     │                              │
│  Highlight Plot State Update ◄──────────────┤  Return Hovered Plot ID      │
│                              │              │                              │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 3. Zero-Allocation Render Loop & ArrayBuffer Transferables

1. **Typed Array Buffers**:
   - Geometries are represented as contiguous `Float32Array` buffers rather than nested JavaScript arrays.
   - Buffers are passed to Web Workers via zero-copy `Transferable` objects:
     ```ts
     worker.postMessage({ buffer: polygonFloatArray.buffer }, [polygonFloatArray.buffer]);
     ```
2. **Object Pooling**:
   - Reuse pre-allocated bounding box objects (`{ xmin, ymin, xmax, ymax }`) during viewport pan operations to avoid Garbage Collection (GC) pauses.
