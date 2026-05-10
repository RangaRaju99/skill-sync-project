# SkillSync — Technical Documentation

> **Document Type:** Technical Documentation | **Version:** 1.0 | **Date:** 2026-05-10

---

## 1. Repository Structure

```
skill-sync-project/
├── Backend/
│   ├── docker-compose.yml          # Full orchestration (16 containers)
│   ├── .env.example                # Environment variable template
│   ├── init-databases.sql          # PostgreSQL DB + schema creation
│   ├── insert-data.sql             # Seed data (users, mentors, skills)
│   ├── pom.xml                     # Parent Maven POM (multi-module)
│   ├── monitoring/
│   │   ├── prometheus/prometheus.yml
│   │   ├── grafana/provisioning/   # Grafana datasource provisioning
│   │   └── loki/loki-config.yml
│   ├── nginx/                      # NGINX reverse proxy config
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── skill-service/
│   ├── session-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── eureka-server/
│   ├── config-server/
│   └── skillsync-cache-common/     # Shared Redis caching library
└── Frontend/
    ├── src/
    │   ├── App.tsx                 # Root component + providers
    │   ├── main.tsx                # ReactDOM.createRoot entry point
    │   ├── index.css               # Global CSS design tokens
    │   ├── pages/                  # Route-level page components
    │   ├── components/             # Shared UI + layout components
    │   ├── services/               # API clients (axios-based)
    │   ├── store/                  # Redux Toolkit store + slices
    │   ├── hooks/                  # Custom React hooks
    │   ├── context/                # React context (ThemeContext)
    │   ├── types/                  # TypeScript type definitions
    │   ├── utils/                  # Utility helpers
    │   └── routes/                 # AppRoutes + DashboardRedirect
    ├── vite.config.ts
    ├── tsconfig.app.json
    ├── jest.config.cjs             # Jest test configuration
    ├── vercel.json                 # Vercel SPA routing config
    └── Dockerfile                  # Frontend Docker image
```

---

## 2. Backend Module Structure (Per Microservice)

Each microservice follows the **same internal package layout**:

```
com.skillsync.<service>/
├── <Service>Application.java       # @SpringBootApplication entry point
├── config/                         # Spring beans, security, RabbitMQ, Redis config
├── controller/                     # @RestController — HTTP endpoints
├── dto/                            # Request/Response record classes
├── entity/                         # @Entity JPA classes
├── enums/                          # Enum definitions (roles, statuses)
├── event/                          # Event payload POJOs
├── exception/                      # Custom domain exceptions + @ControllerAdvice
├── feign/                          # @FeignClient interfaces (inter-service calls)
├── mapper/                         # Entity ↔ DTO mappers
├── repository/                     # @Repository JPA interfaces
├── service/
│   ├── command/                    # Write operations (CQRS command side)
│   └── query/                      # Read operations (CQRS query side)
└── consumer/                       # @RabbitListener message consumers
```

**Exception pattern** — each service defines domain exceptions extending `RuntimeException`, caught by a global `@RestControllerAdvice` that returns a standard error envelope:
```json
{
  "timestamp": "2026-05-10T17:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Mentor not found with id: 99"
}
```

---

## 3. Configuration Overview

### 3.1 Environment Variables (`.env`)

| Variable | Default / Example | Used By |
|---|---|---|
| `DB_HOST` | `postgres` | All services |
| `DB_PORT` | `5432` | All services |
| `DB_USER` | `postgres` | All services |
| `DB_PASSWORD` | *(secret)* | All services |
| `DB_NAME` | Per-service override | e.g. `skillsync_auth` |
| `EUREKA_HOST` | `skillsync-eureka` | All services |
| `CONFIG_SERVER_HOST` | `skillsync-config` | All services |
| `RABBITMQ_HOST` | `rabbitmq` | user, session, payment, notification |
| `RABBITMQ_PORT` | `5672` | Same |
| `RABBITMQ_USER` | `guest` | Same |
| `RABBITMQ_PASSWORD` | *(secret)* | Same |
| `REDIS_HOST` | `redis` | user, skill, gateway |
| `REDIS_PORT` | `6379` | Same |
| `ZIPKIN_HOST` | `zipkin` | All services |
| `MAIL_HOST` | `smtp.gmail.com` | notification-service |
| `MAIL_PORT` | `587` | notification-service |
| `MAIL_USERNAME` | Gmail address | notification-service |
| `MAIL_PASSWORD` | Gmail app password | notification-service |
| `JWT_SECRET` | *(base64 256-bit)* | auth-service, api-gateway |
| `JWT_ACCESS_EXPIRATION` | `86400000` (1 day ms) | auth-service |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7 day ms) | auth-service |
| `ALLOWED_ORIGINS` | `https://skillsync.mraks.dev,...` | api-gateway |
| `APP_BASE_URL` | `https://skillsync.mraks.dev` | notification-service (email links) |
| `JPA_DDL_AUTO` | `validate` | All services |
| `JAVA_OPTS` | `-Xms256m -Xmx512m -XX:+UseG1GC` | All services |
| `DOCKERHUB_USERNAME` | `aksahoo1097` | docker-compose image refs |
| `GRAFANA_ADMIN_PASSWORD` | *(secret)* | grafana |

### 3.2 Spring Cloud Config

The `config-server` runs with `CONFIG_SERVER_PROFILE=git`, pulling shared application properties from a Git-backed repository. This allows all services to receive centralised config updates without redeployment.

### 3.3 Frontend Environment Variables

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Backend API base URL |

The `axios.ts` client auto-corrects misconfigured `VITE_API_URL` values in production (e.g., if it points to the frontend domain instead of the API domain).

---

## 4. Build & Runtime Flow

### 4.1 Backend Build

```
Maven Multi-Module (pom.xml)
  ├── compile all modules
  ├── run tests (JUnit 5 + Mockito)
  └── package JAR per module

Dockerfile per service:
  FROM eclipse-temurin:17-jre-alpine
  COPY *.jar app.jar
  ENTRYPOINT ["java", "-jar", "/app/app.jar"]

docker-compose build → pushes to Docker Hub (aksahoo1097/skillsync:<tag>)
```

### 4.2 Backend Startup Order

```
1. postgres + rabbitmq + redis (infrastructure → health checks pass)
2. zipkin + prometheus + grafana + loki (observability)
3. eureka-server (service registry)
4. config-server (depends_on: eureka healthy)
5. api-gateway (depends_on: eureka + config healthy)
6. auth-service, user-service, skill-service,
   session-service, payment-service, notification-service
   (all depend_on: postgres + eureka + config + rabbitmq + redis healthy)
```

### 4.3 Frontend Build

```
npm install
npm run dev      # Vite dev server (localhost:5173)
npm run build    # Production build → dist/
vercel deploy    # Deploys dist/ to Vercel CDN
```

**vercel.json** configures SPA routing so all paths resolve to `index.html`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 5. Inter-Service Communication Details

### 5.1 Feign Clients

| Client | Declared In | Calls | Methods |
|---|---|---|---|
| `AuthServiceClient` | user-service | auth-service | `updateUserRole`, `updateUserName`, `getAllUsers`, `getUserCount`, `deleteUser`, `getUserById` |
| `SessionServiceClient` | user-service | session-service | `getSessionCount` |
| `UserServiceClient` | session/payment-service | user-service | `getMentorById` |
| `PaymentServiceClient` | session-service | payment-service | `checkPaymentStatus` |

All Feign clients use **Eureka service discovery** (service name, not URL) with Resilience4j circuit breakers.

### 5.2 RabbitMQ Exchange / Queue Design

| Exchange | Type | Routing Keys | Consumer |
|---|---|---|---|
| `payment.events` | Direct | `payment.success`, `payment.failed`, `payment.business.action` | session-service, notification-service |
| `session.events` | Direct | `session.created`, `session.accepted`, `session.rejected`, `session.cancelled`, `session.completed` | notification-service |
| `mentor.events` | Direct | `mentor.approved`, `mentor.rejected` | notification-service |
| `*.dlq` | Dead Letter | — | DlqReplayController |

**Transactional Outbox** (payment-service):
- Events inserted in the **same DB transaction** as business writes
- `OutboxPublisher` polls every 5 seconds with `FOR UPDATE SKIP LOCKED`
- Publisher confirms (ACK) required before marking `SENT`
- Up to 5 retries before moving to `FailedEvent` / DLQ

### 5.3 WebSocket (Notifications)

| Aspect | Detail |
|---|---|
| Protocol | STOMP over WebSocket |
| Endpoint | `/ws/notifications` (routed by API Gateway) |
| Subscription | `/user/queue/notifications` (per-user) |
| Client library | `@stomp/stompjs` (frontend) |
| Reconnect | 5 s delay with heartbeat 10 s in/out |
| Auth | Bearer token sent in STOMP headers |

---

## 6. Security Architecture

```
┌── API Gateway Filters (applied in order) ──────────────────┐
│ 1. CsrfOriginFilter                                        │
│    - Checks Origin against ALLOWED_ORIGINS list            │
│    - Rejects non-matching cross-origin requests            │
│                                                            │
│ 2. JwtAuthenticationFilter                                 │
│    - Skips: /api/auth/**, /actuator/health/**              │
│    - Validates JWT (HS256) from:                           │
│      a) Authorization: Bearer <token>                      │
│      b) accessToken cookie                                 │
│    - Injects headers: X-User-Id, X-User-Email, X-User-Role │
│                                                            │
│ 3. RateLimitingFilter (Redis-backed)                       │
│    - Per-IP sliding window                                 │
│    - Returns 429 on limit exceeded                         │
│                                                            │
│ 4. SecurityHeadersFilter                                   │
│    - X-Content-Type-Options: nosniff                       │
│    - X-Frame-Options: DENY                                 │
│    - Referrer-Policy: strict-origin-when-cross-origin      │
└────────────────────────────────────────────────────────────┘

Downstream Services:
  - Trust X-User-Id/Role headers (injected by gateway)
  - No re-validation of JWT
  - Role checks via header value in service logic

Cookie Security (auth-service):
  - HttpOnly: true (no JS access)
  - Secure: true (HTTPS only in production)
  - SameSite: None (cross-origin) / Lax (localhost)
  - Domain: configured via auth.cookie.domain property
  - Max-Age: matches token expiration
```

---

## 7. Observability

### 7.1 Metrics (Prometheus + Grafana)

Every Spring Boot service exposes `/actuator/metrics` and `/actuator/prometheus`. Prometheus scrapes at configured intervals. Grafana dashboards are **provisioned automatically** from `monitoring/grafana/provisioning/`.

Key metrics collected:
- JVM heap/GC metrics
- HTTP request count/latency per endpoint
- HikariCP connection pool stats
- RabbitMQ consumer lag
- Redis hit/miss rates

### 7.2 Distributed Tracing (Zipkin)

All services include Micrometer Brave integration. Every request generates a `traceId` propagated across service calls (both Feign and RabbitMQ). Zipkin UI at `:9411` shows full call graphs.

### 7.3 Log Aggregation (Loki)

Grafana Loki collects structured logs from all containers. Log queries in Grafana use `{container="skillsync-auth"}` label filters. Log format is JSON with `traceId` included for correlation with Zipkin.

### 7.4 Health Checks

Every service exposes Spring Actuator health endpoints:
- `/actuator/health` — liveness
- `/actuator/health/readiness` — readiness (used by Docker healthcheck)

Docker Compose waits for `service_healthy` before starting dependents.

---

## 8. Testing Components

### 8.1 Backend Tests

| Test Type | Framework | Location | Coverage |
|---|---|---|---|
| Unit tests | JUnit 5 + Mockito | `src/test/java` per service | Service layer logic, mappers |
| Integration tests | Spring Boot Test | `src/test/java` per service | Controller + repository with H2 or Testcontainers |
| Coverage analysis | JaCoCo | `target/site/jacoco` | HTML reports generated per service |
| Coverage summary | Python scripts | `analyze_coverage.py`, `coverage_summary.py` | Cross-service aggregation |

### 8.2 Frontend Tests

| Test Type | Framework | Files |
|---|---|---|
| Unit / Component | Jest + React Testing Library | `*.test.tsx`, `*.test.ts` in `src/` |
| Service tests | Jest + axios-mock-adapter | `services/*.test.ts` |
| Slice tests | Jest | `store/slices/*.test.ts` |
| Smoke tests | Playwright / custom | `pages/pages.smoke.test.tsx` |

**Jest configuration** (`jest.config.cjs`):
- `testEnvironment: 'jsdom'`
- Module name mapper for CSS/asset mocking
- Transform: `ts-jest` for TypeScript

---

## 9. Deployment Runbook

### 9.1 First-Time Deployment

```bash
# 1. Clone repository
git clone https://github.com/RangaRaju99/skill-sync-project.git
cd skill-sync-project/Backend

# 2. Configure environment
cp .env.example .env
# Edit .env with real secrets

# 3. Start all services
docker-compose up --build -d

# 4. Verify health
docker-compose ps
curl http://localhost:8080/actuator/health/readiness

# 5. Initialize databases (auto via init-databases.sql on first start)
# Seed data auto-inserted via insert-data.sql
```

### 9.2 Frontend Deployment (Vercel)

```bash
cd Frontend
npm install
npm run build
vercel deploy --prod
# Set VITE_API_URL=https://api.skillsync.mraks.dev in Vercel dashboard
```

### 9.3 Service-Level URLs

| Service | Local URL | Production |
|---|---|---|
| Frontend | `http://localhost:5173` | `https://skillsync.mraks.dev` |
| API Gateway | `http://localhost:8080` | `https://api.skillsync.mraks.dev` |
| Eureka Dashboard | `http://localhost:8761` | Internal only |
| RabbitMQ Mgmt | `http://localhost:15672` | Internal only |
| Prometheus | `http://localhost:9090` | `https://api.skillsync.mraks.dev/prometheus/` |
| Grafana | `http://localhost:3000` | `https://api.skillsync.mraks.dev/grafana/` |
| Zipkin | `http://localhost:9411` | Internal only |

---

## 10. Key Design Patterns Applied

| Pattern | Where Used |
|---|---|
| **Microservices** | 7 independent Spring Boot services |
| **API Gateway** | Spring Cloud Gateway — single entry point |
| **Service Discovery** | Netflix Eureka |
| **CQRS** | user-service, session-service, payment-service |
| **Repository Pattern** | All JPA repositories |
| **DTO / Mapper Pattern** | All services — entity never exposed directly |
| **Transactional Outbox** | payment-service — reliable event publishing |
| **Saga Orchestration** | payment-service — distributed payment workflow |
| **Dead Letter Queue** | RabbitMQ DLQ + replay endpoint |
| **Circuit Breaker** | Resilience4j on Feign clients |
| **Optimistic Locking** | Session state transitions (via DB constraint) |
| **Observer (WebSocket)** | notification-service STOMP push |
| **Shared Kernel** | `skillsync-cache-common` — Redis utilities |
| **BFF (Backend for Frontend)** | API Gateway injects user context headers |
