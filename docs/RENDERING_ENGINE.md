# GIS Engine v2 — Rendering Engine Architecture

## 1. Hybrid Rendering Pipeline Architecture

To achieve constant 60 FPS performance when rendering 5,000+ vector plot polygons alongside master blueprint graphics, GIS Engine v2 uses a **Hybrid SVG + Canvas / WebGL Architecture**:

- **Static Vector Layers (Layers 0–2)**: Rendered via pure vector SVG (`layout_plan_master.svg` + Grid Pattern) for crisp scaling up to 10x.
- **Dynamic Interactive Layer (Layer 6)**: Rendered via **Canvas 2D Context / WebGL Buffer** when plot count exceeds 1,000 polygons, or via optimized SVG `<polygon>` nodes with memoized React components when below 1,000 plots.
- **Overlay & HUD Layer (Layer 7)**: SVG `<text>` and selection focus rings for high accessibility and crisp typography.

---

## 2. Level of Detail (LOD) Manager

The LOD Manager dynamically throttles text and geometry detail based on current viewport scale $\mathbf{S}$:

$$\mathbf{LOD}(\mathbf{S}) = \begin{cases} \text{LOD 0 (Macro View)} & 0.5 \le \mathbf{S} < 1.2 \quad (\text{Plot fills only; labels hidden}) \\ \text{LOD 1 (Standard View)} & 1.2 \le \mathbf{S} < 2.5 \quad (\text{Plot fills + Plot Number labels}) \\ \text{LOD 2 (Detailed View)} & 2.5 \le \mathbf{S} \le 10.0 \quad (\text{Plot fills + Labels + Dimensions + Facing Vectors}) \end{cases}$$

---

## 3. Viewport Virtualization & Spatial Culling

```
┌─────────────────────────────────────────────────────────────┐
│                 Full 2384 x 1684 Map Space                   │
│                                                             │
│         ┌───────────────────────────────┐                   │
│         │     Active Viewport BBox      │                   │
│         │   [xmin, ymin, xmax, ymax]    │                   │
│         │                               │                   │
│         │   (Only render geometries     │                   │
│         │    intersecting this BBox)    │                   │
│         └───────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **Bounding Box Intersect Calculation**:
   - Compute current viewport bounding box $V_{bbox} = [v_{x1}, v_{y1}, v_{x2}, v_{y2}]$.
2. **QuadTree / R-Tree Spatial Query**:
   - Query spatial index for geometries intersecting $V_{bbox}$.
   - Off-screen polygons (outside viewport) are instantly culled from the DOM render tree, lowering DOM node count from 5,000+ to `< 200` visible nodes!

---

## 4. Point-in-Polygon Hit Detection Engine

For ultra-fast hover and click detection across 5,000+ arbitrary polygon shapes without DOM listener overhead:

```ts
function isPointInPolygon(px: number, py: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```
- Executed inside a background **Web Worker**, ensuring main UI thread remains at 60 FPS without stutter during fast cursor movements!
