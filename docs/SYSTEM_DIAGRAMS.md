# 📊 Enterprise System Diagrams — Shubharambh CRM

This document contains complete technical sequence diagrams, database entity-relationship models, concurrency control flows, and repository folder trees for **Shubharambh CRM**.

---

## 1. Authentication & Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as React SPA Client
    participant Auth as Auth Controller
    participant Session as Session Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL DB

    Client->>Auth: POST /api/v1/auth/login {identifier, password}
    Auth->>DB: Query User & Password Hash
    DB-->>Auth: User Record & Hash
    Auth->>Auth: Verify Bcrypt Password Hash (12 rounds)
    Auth->>Session: Create Active Session Record
    Session->>Redis: Cache Session Token (sessions:userId)
    Auth-->>Client: Set HTTP-Only Refresh Cookie & Return Access Token

    Note over Client,Auth: Access Token Expires after 15 Minutes
    Client->>Auth: Silent POST /api/v1/auth/refresh (Cookie attached)
    Auth->>Session: Validate Refresh Token in Revocation Store
    Session->>Redis: Check revoked_session:sessionId
    Redis-->>Session: Valid Session
    Auth-->>Client: Return New Access Token
```

```plantuml
@startuml AuthenticationFlow
autonumber
actor Client
participant "Auth Controller" as Auth
participant "Session Service" as Session
participant "Redis Cache" as Redis
database "PostgreSQL" as DB

Client -> Auth: POST /api/v1/auth/login
Auth -> DB: Query User Hash
DB --> Auth: Password Hash
Auth -> Auth: Verify Bcrypt Hash
Auth -> Session: Register Session
Session -> Redis: Store Session Key
Auth --> Client: HTTP-Only Refresh Cookie + Access Token
@enduml
```

---

## 2. Server-Authoritative Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Sales Agent Client
    participant Booking as Booking Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL DB

    Client->>Booking: POST /api/v1/booking {plotId, customerDetails, payment}
    Booking->>DB: BEGIN $transaction
    Booking->>DB: SELECT * FROM Plot WHERE id = plotId FOR UPDATE
    alt Plot.status != 'AVAILABLE'
        DB-->>Booking: Plot Already Reserved
        Booking-->>Client: Return HTTP 409 Conflict Banner
    else Plot.status == 'AVAILABLE'
        Booking->>DB: UPDATE Plot SET status='BOOKED', version=version+1
        Booking->>DB: INSERT INTO Booking (id, customerId, plotId, version)
        Booking->>DB: COMMIT $transaction
        Booking->>Redis: Invalidate Cache Pattern plots:*
        Booking-->>Client: Return HTTP 201 Created & Booking Confirmation
    end
```

```plantuml
@startuml BookingFlow
autonumber
actor Agent
participant "Booking Service" as Booking
participant "Redis Cache" as Redis
database "PostgreSQL" as DB

Agent -> Booking: POST /api/v1/booking
Booking -> DB: BEGIN $transaction
Booking -> DB: SELECT Plot WHERE id = plotId
alt Plot Unavailable
    DB --> Booking: Status = BOOKED
    Booking --> Agent: HTTP 409 Conflict
else Plot Available
    Booking -> DB: UPDATE Plot SET status='BOOKED', version = version + 1
    Booking -> DB: INSERT Booking
    Booking -> DB: COMMIT $transaction
    Booking -> Redis: Invalidate plots:* Cache
    Booking --> Agent: HTTP 201 Created
end
@enduml
```

---

## 3. Optimistic Concurrency Control (OCC) Flow

```mermaid
graph TD
    Agent1[Sales Agent A] -->|Book Plot 101| Tx1[Transaction 1: Reads Version = 1]
    Agent2[Sales Agent B] -->|Book Plot 101| Tx2[Transaction 2: Reads Version = 1]
    Tx1 -->|Executes First| Commit1[UPDATE Plot SET status='BOOKED', version = 2 WHERE version = 1]
    Commit1 -->|Succeeds| Success1[Agent A Receives HTTP 201 Booking Confirmed]
    Tx2 -->|Executes Second| Commit2[UPDATE Plot SET status='BOOKED', version = 2 WHERE version = 1]
    Commit2 -->|Fails: 0 rows updated| Conflict2[Agent B Receives HTTP 409 Conflict Rejection]
```

```plantuml
@startuml OCCFlow
state "Plot 101 (Status: AVAILABLE, Version: 1)" as Init
state "Agent A Transaction Begins (Reads Version 1)" as AgentA
state "Agent B Transaction Begins (Reads Version 1)" as AgentB
state "Agent A Commits (Version -> 2, Status -> BOOKED)" as CommitA
state "Agent B Commit Fails (Version 1 no longer matches)" as CommitB

Init --> AgentA
Init --> AgentB
AgentA --> CommitA : Succeeds (HTTP 201)
AgentB --> CommitB : Rejected (HTTP 409 Conflict)
@enduml
```

---

## 4. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    PROJECT ||--|{ LAYOUT : contains
    LAYOUT ||--|{ BLOCK : contains
    BLOCK ||--|{ PLOT : contains
    CUSTOMER ||--o{ PLOT : owns
    CUSTOMER ||--|{ BOOKING : places
    PLOT ||--o| BOOKING : holds
    BOOKING ||--|{ PAYMENT : receives
    BOOKING ||--|{ DOCUMENT : generates
    USER ||--o{ BOOKING : creates
    USER ||--|{ SESSION : maintains
    USER ||--o{ AUDITLOG : generates
    ROLE ||--|{ ROLEPERMISSION : grants
    PERMISSION ||--|{ ROLEPERMISSION : defines
```

```plantuml
@startuml DatabaseERD
entity "User" {
  * id : string
  --
  email : string
  role : string
}

entity "Plot" {
  * id : string
  --
  plotNumber : string
  status : string
  version : int
}

entity "Booking" {
  * id : string
  --
  plotId : string
  customerId : string
  version : int
}

entity "Customer" {
  * id : string
  --
  name : string
  phone : string
}

User ||--o{ Booking
Plot ||--o| Booking
Customer ||--|{ Booking
@enduml
```

---

## 5. Repository Folder Structure Tree

```text
shubharambh-crm/
├── docs/                        # Enterprise Architecture Documentation
│   ├── ARCHITECTURE.md          # Core Architecture & System Guide
│   └── SYSTEM_DIAGRAMS.md       # Sequence, ERD & Concurrency Diagrams
├── e2e/                         # Playwright End-to-End Automation Specs
│   ├── auth.spec.ts             # Auth & Token Rotation Tests
│   ├── booking.spec.ts          # Booking & OCC Conflict Tests
│   ├── propertyMap.spec.ts      # Vector Canvas & Search Tests
│   └── rbac.spec.ts             # Unauthorized Access & RBAC Tests
├── k8s/                         # Production Kubernetes Deployment Manifests
│   ├── backend-deployment.yaml  # Express Backend Pod Deployment
│   ├── configmap.yaml           # Environment Configuration
│   ├── frontend-deployment.yaml # Frontend Nginx Pod Deployment
│   ├── hpa.yaml                 # Horizontal Pod Autoscaler (3-10 Pods)
│   ├── ingress.yaml             # TLS Nginx Ingress Controller
│   ├── secret.yaml              # Encrypted Production Credentials
│   └── services.yaml            # ClusterIP Service Routing
├── server/                      # Express Backend Micro-Service Application
│   ├── docs/                    # OpenAPI 3.1 Specification (json & yaml)
│   ├── prisma/                  # Prisma Schema & PostgreSQL Migrations
│   │   ├── migrations/          # DDL Migration Scripts
│   │   └── schema.prisma        # 17 Relational Entity Schemas
│   ├── src/                     # Backend TypeScript Source Code
│   │   ├── config/              # Redis & Database Singleton Pool
│   │   ├── controllers/         # API Controllers
│   │   ├── middlewares/         # Security, Auth, RBAC, Logging
│   │   ├── routes/              # Express API Routes
│   │   └── services/            # Business Logic & Caching Engine
│   └── Dockerfile               # Multi-Stage Backend Container Build
├── src/                         # React 19 Frontend Web Application
│   ├── components/              # Modular UI Components & Modals
│   ├── context/                 # AuthContext & AppContext Providers
│   ├── features/
│   │   └── gis-engine/          # Viewport Spatial Culler & LOD Renderer
│   ├── services/                # API Interceptors & Client
│   └── types/                   # TypeScript Interfaces & Models
├── docker-compose.yml           # Local Production Micro-Service Stack
├── package.json
├── README.md
└── vite.config.ts
```
