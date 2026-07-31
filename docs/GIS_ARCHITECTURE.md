# GIS Engine v2 — Architectural Design & System Specification

## 1. High-Level System Architecture

The **GIS Engine v2** employs a modular, 5-stage decoupled pipeline architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Master PDF Blueprint                     │
│               (layout_plan_master.pdf - PyMuPDF)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spatial Extraction Pipeline                 │
│              (extract_pdf_property_map.py)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Normalized Spatial Layer Repositories           │
│  (roads.json, parks.json, plots.json, utilities.json, etc.) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Spatial Indexing & Hit Detection Engine         │
│          (Web Worker Offloaded R-Tree / QuadTree Index)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Hybrid SVG / Canvas Renderer                │
│     (Viewport Virtualization, LOD Manager, Canvas Overlay)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shubharambh CRM Layer Binding               │
│        (Plot Drawer, Search Engine, Real-time Booking)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Layer Stack Specification

The map canvas consists of 8 isolated rendering layers stacked sequentially along the Z-axis:

| Layer Index | Layer Name | Technology | Render Content | Pointer Events |
|---|---|---|---|---|
| **Layer 0** | Base Canvas | SVG `<rect>` | Background color (`#0b0f19`) & viewport bounds | `none` |
| **Layer 1** | Master PDF Blueprint | SVG `<image>` | Authentic PDF vector blueprint (`layout_plan_master.svg`) | `none` |
| **Layer 2** | Coordinate Grid | SVG `<pattern>` | Grid coordinate lines & scale references | `none` |
| **Layer 3** | Civil Infrastructure | SVG `<path>` | Water, Electricity, Sewer, Street Lights | `none` |
| **Layer 4** | Road & Amenities | SVG `<path>` | 50'-0" Boulevard, 40'-0" Sector Roads, Parks, Greenery | `none` |
| **Layer 5** | Commercial & Boundaries | SVG `<polygon>` | Commercial blocks, township entrance gates | `none` |
| **Layer 6** | Interactive Plot Inventory | SVG `<polygon>` | Sellable plot polygons (Available, Booked, Reserved, Sold) | **`visiblePainted`** |
| **Layer 7** | Dynamic Labels & Highlights | SVG `<text>` / `<circle>` | Plot numbers, selection focus rings, hover tooltips | `none` |

---

## 3. Coordinate System & Projection Architecture

### 3.1 Primary Native Coordinates
- **Coordinate Space**: Single unified landscape viewport (`2384 x 1684` units).
- **Origin**: Top-left `[0, 0]` matching standard PDF PyMuPDF spatial bounds.

### 3.2 Geo-Referenced Scalability (EPSG:4326 WGS84)
- **Affine Transformation Matrix**: Supports 3-point geo-anchoring to translate 2D blueprint pixel coordinates `[x, y]` into latitude/longitude `[lat, lng]` coordinates:
$$\begin{bmatrix} lat \\ lng \end{bmatrix} = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} e \\ f \end{bmatrix}$$
- Enables satellite map overlays (Google Maps, OpenStreetMap) and GPS geolocation positioning for field agents on site.
