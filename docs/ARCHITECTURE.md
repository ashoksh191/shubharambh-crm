# 🏛️ Enterprise Architecture Guide — Shubharambh CRM

**Version**: `v1.0.0-rc1`  
**System Target**: Shubharambh Green City Real Estate Township & Sales Network  
**Target Scale**: 100 Concurrent Users, 50 Sales Agents, 100,000 Plots  

---

## 1. System Overview Architecture

Shubharambh CRM is designed as a high-performance 3-tier enterprise real estate management platform powered by Node.js, Express, PostgreSQL 16, Redis 7.2, and React 19.

```mermaid
graph TD
    User[Sales Agent / Customer / Admin] -->|HTTPS| Ingress[Nginx Ingress / Reverse Proxy]
    Ingress -->|Rate Limited / Security Filtered| BackendCluster[Node.js / Express Backend Cluster]
    BackendCluster -->|Connection Pool| Prisma[Prisma ORM Singleton]
    BackendCluster -->|Sub-ms Query Cache / Revocation Store| Redis[(Redis 7.2 Cluster)]
    Prisma -->|Atomic OCC $transaction| Postgres[(PostgreSQL 16 Enterprise DB)]
    BackendCluster -->|Structured JSON Logs| Observability[Pino / SRE Telemetry GET /metrics]
```

```plantuml
@startuml SystemArchitecture
skinparam monochrome false
skinparam shadowing true

actor User
node "Kubernetes Cluster" {
    component "Nginx Ingress Controller" as Ingress
    component "React 19 Frontend SPA" as SPA
    component "Node.js Express API Cluster" as API
    database "Redis 7.2 Cache" as Redis
    database "PostgreSQL 16 DB" as DB
}

User --> Ingress : HTTPS / WSS
Ingress --> SPA : Static Assets
Ingress --> API : REST API / v1 / auth / booking
API --> Redis : Sub-ms Query Cache / Sessions
API --> DB : Prisma Connection Pool / OCC Transaction
@enduml
```

---

## 2. Frontend Application Architecture

The frontend is built using React 19, TypeScript 5.7, Framer Motion, and custom state context providers (`AuthContext`, `AppContext`).

```mermaid
graph TD
    App[React 19 Main Application] --> AuthProvider[AuthContext - JWT Token State & Session Sync]
    App --> AppProvider[AppContext - Plot Inventory & Selected State]
    App --> Router[Protected Router Guard]
    Router --> PropertyMap[GIS Property Map Page]
    Router --> Dashboard[User Profile / Admin Dashboard]
    PropertyMap --> VectorMapCanvas[VectorMapCanvas - Pan & Zoom Container]
    VectorMapCanvas --> SvgCanvas[SvgCanvas - Spatial Bounding Box Culler]
    SvgCanvas --> PlotDrawer[Plot Metadata Drawer & Booking Modal]
```

```plantuml
@startuml FrontendArchitecture
package "React 19 Frontend Client" {
    [Main Application] --> [AuthContext Provider]
    [Main Application] --> [AppContext Provider]
    [AuthContext Provider] --> [Protected Router Guard]
    [Protected Router Guard] --> [VectorMapCanvas]
    [VectorMapCanvas] --> [SvgCanvas Viewport Culler]
    [SvgCanvas Viewport Culler] --> [PlotDrawer & Booking Modal]
}
@enduml
```

---

## 3. Backend Micro-Service Architecture

The backend follows a strict layered separation of concerns:

- **Controllers**: Handle HTTP requests, parse payloads, and return JSON responses.
- **Middlewares**: Enforce authentication (`authMiddleware`), RBAC (`rbacMiddleware`), rate limiting (`rateLimiter`), input sanitization (`uploadGuard`, `sanitizeInputs`), and logging (`requestIdMiddleware`).
- **Services**: Enforce domain business logic, caching (`plotService`, `sessionService`), and atomic transactional boundaries (`bookingService`).
- **Data Access Layer**: Prisma Singleton connection pool (`database.ts`) connected to PostgreSQL 16.

---

## 4. GIS Engine & Viewport Culling Architecture

```mermaid
graph LR
    TransformWrapper[TransformWrapper State: positionX, positionY, scale] --> ViewportCalc[Viewport Bounding Box Calculator]
    ViewportCalc -->|minX, minY, maxX, maxY| SpatialCull[Spatial Bounding Box Culler]
    SpatialCull -->|Filtered Intersecting Polygons| SvgRender[SVG Canvas Polygon Renderer]
    SvgRender -->|scale < 0.6| LOD[Adaptive LOD Label Suppressor]
    SvgRender -->|scale >= 0.6| TextLabels[Vector Plot Halo Text Labels]
```

```plantuml
@startuml GISArchitecture
package "GIS Vector Engine" {
    [TransformWrapper Pan/Zoom] -> [Viewport Bounds Calculator]
    [Viewport Bounds Calculator] -> [Bounding Box Spatial Culler]
    [Bounding Box Spatial Culler] -> [SVG Renderer]
    [SVG Renderer] -> [LOD Label Suppressor]
}
@enduml
```

---

## 5. Deployment & Kubernetes Infrastructure

```mermaid
graph TD
    Client[Client Browser] --> Ingress[Nginx Ingress - TLS Termination]
    Ingress --> FrontendSVC[Frontend ClusterIP Service]
    Ingress --> BackendSVC[Backend ClusterIP Service]
    FrontendSVC --> FrontendPods[Frontend Pod Replicas x2]
    BackendSVC --> BackendPods[Backend Pod Replicas x3-10 HPA]
    BackendPods --> PostgresSVC[PostgreSQL 16 Service]
    BackendPods --> RedisSVC[Redis 7.2 Service]
```

```plantuml
@startuml DeploymentArchitecture
cloud "AWS EKS Cluster" {
    node "Nginx Ingress Controller" as Ingress
    node "Frontend Deployment (2 Replicas)" as FE
    node "Backend Deployment (3-10 HPA Replicas)" as BE
    database "PostgreSQL 16 StatefulSet" as PG
    database "Redis 7.2 StatefulSet" as RD
}

Ingress --> FE
Ingress --> BE
BE --> PG
BE --> RD
@enduml
```
