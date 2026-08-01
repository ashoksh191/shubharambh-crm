# Changelog

All notable changes to **Shubharambh CRM** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc1] - 2026-08-01

### Added
- **PostgreSQL 16 Enterprise Migration**: Datasource provider migration from SQLite to PostgreSQL with 17 normalized relational tables and initial migration script `20260801000000_init_postgresql`.
- **Prisma Connection Pooling**: Centralized `PrismaClient` singleton (`database.ts`) preventing connection leaks under high concurrent load.
- **GIS Viewport Spatial Culling**: Active SVG bounding box filtering (`minX`, `minY`, `maxX`, `maxY`) in `SvgCanvas.tsx`, reducing active SVG DOM nodes by **>85%** and achieving constant **60 FPS** pan/zoom.
- **Adaptive Level of Detail (LOD)**: Automated label visibility toggling based on zoom scale (`scale >= 0.6`).
- **Redis 7.2 Distributed Platform**: Response caching (`plots:list:*`, 300s TTL), pattern-based cache invalidation, distributed session storage, token revocation store, rate limiting, and SRE telemetry hash counters.
- **Distributed Lock Helpers**: Exposed `redisCache.acquireLock()` and `redisCache.releaseLock()` for atomic resource synchronization.
- **Playwright E2E Automation Suite**: 11 automated E2E tests covering Login, JWT Refresh Token Rotation, Dashboard, Plot Search, GIS Canvas Plot Click, Booking Submission, OCC Conflict (HTTP 409), Logout, Unauthorized Access, and RBAC permissions.
- **Production SRE Observability**: Pino JSON structured logging, `x-request-id` correlation header propagation, slow request alerts ($\ge 500\text{ms}$), and Prometheus JSON telemetry (`GET /metrics`).

### Fixed
- Fixed SVG DOM node limit freeze when rendering large township blueprints.
- Fixed database lock contention under concurrent booking attempts by switching SQLite to PostgreSQL with Optimistic Concurrency Control (`Plot.version`).
