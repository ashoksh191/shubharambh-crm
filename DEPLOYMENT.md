# Production Deployment & Infrastructure Guide

**Project**: Shubharambh Green City CRM  
**Target Environment**: Production Linux VPS / AWS EC2 / DigitalOcean Droplet / Kubernetes  

---

## 1. Quickstart Deployment with Docker Compose

### Prerequisites
- Docker Engine 24.0+
- Docker Compose 2.20+
- Git

### Step-by-Step Execution

1. **Clone Repository**:
   ```bash
   git clone https://github.com/ashoksh191/shubharambh-crm.git
   cd shubharambh-crm
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```
   *Edit `server/.env` to update `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` with secure production values (minimum 32 characters).*

3. **Build and Launch Container Stack**:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify Health Endpoints**:
   - Liveness Check: `curl http://localhost/api/health`
   - Readiness Check: `curl http://localhost/api/ready`

---

## 2. Container Topology & Port Allocation

| Container Service | Image Base | Internal Port | Exposed Port | Purpose |
|---|---|---|---|---|
| `shubharambh_frontend` | `nginx:alpine` | 80 | 80 | Serves SPA Web Assets & Reverses Proxy `/api/` to backend |
| `shubharambh_backend` | `node:20-alpine` | 5000 | 5000 | Express.js REST Engine & Server-Authoritative OCC Transactions |
| `shubharambh_postgres` | `postgres:16-alpine` | 5432 | 5432 | Relational Database for Users, Plots, Bookings & Audit Trail |
| `shubharambh_redis` | `redis:7-alpine` | 6379 | 6379 | In-memory session store & cache layer |

---

## 3. Database Migration & Seeding in Production Container

To run database migrations and seed default data in the running container:
```bash
docker exec -it shubharambh_backend npx prisma db push
docker exec -it shubharambh_backend npx prisma db seed
```

---

## 4. Production Checklist

- [x] Multi-stage Docker build optimization (Nginx Gzip + Node Alpine runner)
- [x] Non-root `node` container user execution
- [x] Health & Readiness probes (`/health`, `/ready`)
- [x] Graceful shutdown handling (`SIGTERM`, `SIGINT`)
- [x] Automated GitHub Actions CI/CD workflow (`ci.yml`)
- [x] Environment secret validation
- [x] Rate limiting & CORS protection
