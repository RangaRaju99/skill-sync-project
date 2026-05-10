# SkillSync — High-Level Design (HLD)

> **Document Type:** High-Level Design | **Version:** 1.0 | **Date:** 2026-05-10

---

## 1. System Overview

**SkillSync** is a full-stack, cloud-deployed **skill mentorship marketplace** built with a production-grade **microservices architecture**. It connects **Learners** who want to acquire skills with vetted **Mentors** who teach them through paid one-on-one sessions. The platform handles the complete lifecycle: discovery, booking, payment, session delivery, review, and group-based collaborative learning.

| Dimension | Detail |
|---|---|
| **Frontend** | React 18 + TypeScript SPA (Vite), deployed on Vercel |
| **Backend** | 7 Spring Boot 3 microservices (Java 17) |
| **Infrastructure** | Docker Compose, PostgreSQL 16, RabbitMQ 3.13, Redis 7.2 |
| **Observability** | Prometheus + Grafana + Loki (log aggregation) + Zipkin (tracing) |
| **Production Domain** | Frontend: `skillsync.mraks.dev` · API: `api.skillsync.mraks.dev` (AWS EC2 behind NGINX) |
| **Payment Gateway** | Razorpay (INR) |
| **Real-Time** | WebSocket STOMP (notifications) |

---

## 2. Problem Statement & Business Objectives

### Problem Statement
Aspiring developers and learners lack structured access to experienced mentors who can provide hands-on, personalized skill instruction. Existing platforms are either too generic, lack proper vetting mechanisms, or make payments and session coordination cumbersome.

### Business Objectives
1. **Mentor Vetting** — Ensure mentor quality via a structured application + admin approval process.
2. **Transparent Discovery** — Enable learners to find mentors filtered by skill, rating, and price.
3. **Seamless Payments** — Integrate a reliable payment gateway (Razorpay) with idempotent transaction management.
4. **Collaborative Learning** — Support peer learning through group channels and threaded discussions.
5. **Reliable Notifications** — Keep all parties informed of session status changes in near-real-time.
6. **Scalable Architecture** — Build as microservices to scale individual components independently.

---

## 3. Core Business Modules

| Module | Owning Service | Description |
|---|---|---|
| **Authentication & Identity** | `auth-service` | Registration (OTP), login (email + OAuth), JWT issuance, password reset |
| **User Profiles** | `user-service` | Learner profiles, mentor profiles, availability slots |
| **Skill Catalog** | `skill-service` | Master list of skills and categories (Admin managed) |
| **Session Management** | `session-service` | Booking, lifecycle (PENDING→ACCEPTED→COMPLETED), cancellation, reviews |
| **Payment & Saga** | `payment-service` | Razorpay order creation, payment verification, saga orchestration |
| **Notifications** | `notification-service` | Email notifications via SMTP + WebSocket push |
| **Group Learning** | `user-service` | Group CRUD, member management, threaded discussions |
| **Admin Operations** | Cross-service (via Feign) | Stats aggregation, user/mentor management from `user-service` admin endpoints |

---

## 4. Functional Requirements

### 4.1 Authentication
- FR-01: Users shall register via email with OTP email verification.
- FR-02: Users shall log in via email/password and via Google OAuth.
- FR-03: JWT access tokens shall expire in 24 hours; refresh tokens in 7 days.
- FR-04: Tokens shall be stored as `HttpOnly` cookies (cross-domain with `SameSite=None; Secure`) and in localStorage (fallback for cross-origin frontend deployments).
- FR-05: Forgotten passwords shall be reset via OTP verification.

### 4.2 Mentor System
- FR-06: Learners may apply to become mentors with bio, experience, hourly rate, and skill IDs.
- FR-07: Admin shall approve or reject mentor applications with optional reason.
- FR-08: Approved mentors may set weekly availability slots (day-of-week, start/end time).

### 4.3 Session Management
- FR-09: Learners may book sessions with approved mentors.
- FR-10: Sessions shall follow a state machine: `PENDING → ACCEPTED | REJECTED`, `ACCEPTED → COMPLETED | CANCELLED`.
- FR-11: Mentors and learners shall be able to cancel sessions in eligible states.
- FR-12: Only completed sessions shall be reviewable; one review per session.

### 4.4 Payments
- FR-13: Booking a session shall require a successful Razorpay payment.
- FR-14: Payment-Service shall verify Razorpay signature before triggering business actions.
- FR-15: The saga pattern shall ensure at-most-once booking per payment, with compensation on failure.
- FR-16: Users shall view their full payment history.

### 4.5 Groups & Discussions
- FR-17: Any user may browse public groups.
- FR-18: Mentors and Admins may create groups with optional membership caps.
- FR-19: Members may post threaded discussions; authors and admins may delete posts.

### 4.6 Notifications
- FR-20: Email notifications shall fire for: session booked/accepted/rejected/cancelled/completed, mentor approved/rejected, OTP events.
- FR-21: Real-time push notifications shall be delivered via STOMP WebSocket.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API Gateway response < 300 ms p95 under normal load; Postgres queries optimised with indexes on foreign keys and status columns |
| **Security** | JWT RS256 or HS256 (configurable); `HttpOnly` cookies; CSRF origin filter; Rate-Limiting filter on Gateway (Redis-backed); Security headers (CSP, X-Frame-Options) via `SecurityHeadersFilter` |
| **Scalability** | Microservice-per-domain; Redis caching (`skillsync-cache-common` library); Stateless services behind Eureka; horizontal scaling via Docker replicas |
| **Reliability** | Transactional Outbox Pattern guarantees event delivery; Saga pattern with compensation on payment failure; RabbitMQ DLQ with replay endpoint; Circuit-breaker via Resilience4j (per Feign client) |
| **Observability** | Distributed tracing via Zipkin; Prometheus metrics on every service (`/actuator/metrics`); Grafana dashboards; Loki log aggregation |
| **Maintainability** | CQRS pattern in user/session/payment services; Command/Query service separation; DTO/Mapper layers; Repository pattern; Lombok-reduced boilerplate |
| **Availability** | `restart: unless-stopped` on all containers; health-checks guard startup order; Eureka heartbeats detect failed instances |
| **Compliance** | Passwords bcrypt-hashed (10 rounds); no secrets in code (`.env` injection); OAuth provider integration |

---

## 6. System Layers

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT LAYER (Browser)                  │
│   React 18 SPA — Vite + TypeScript + Redux Toolkit       │
│   Deployed: Vercel (CDN-edge)                            │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS / WSS
┌─────────────────▼───────────────────────────────────────┐
│             INGRESS LAYER (nginx on EC2)                  │
│   TLS termination · Rate limiting · Reverse proxy        │
│   Routes:  / → Vercel (frontend)                         │
│            /api/* → localhost:8080 (API Gateway)         │
│            /ws/* → API Gateway WebSocket                 │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP
┌─────────────────▼───────────────────────────────────────┐
│               API GATEWAY (Spring Cloud Gateway)          │
│   Port 8080 · JWT Auth Filter · CSRF Filter              │
│   Rate-Limit Filter · Security Headers Filter            │
│   Service Discovery via Eureka                           │
└────┬──────┬──────┬──────┬──────┬──────┬────────────────┘
     │      │      │      │      │      │
  auth   user   skill session payment notif
 :8081  :8082  :8084  :8085  :8086  :8088
     │      │      │      │      │      │
┌────▼──────▼──────▼──────▼──────▼──────▼──────────────┐
│                  DATA LAYER                             │
│  PostgreSQL 16  ·  Redis 7.2  ·  RabbitMQ 3.13        │
│  6 Databases · 10 Schemas                              │
└────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────┐
│             OBSERVABILITY LAYER                          │
│  Prometheus :9090 · Grafana :3000 · Loki :3100          │
│  Zipkin :9411                                           │
└────────────────────────────────────────────────────────┘
```

---

## 7. Inter-Module Communication

### Synchronous (REST via OpenFeign)

| Caller Service | Called Service | Purpose |
|---|---|---|
| `user-service` | `auth-service` | Get/update/delete user accounts (admin ops) |
| `user-service` | `session-service` | Get session count for admin stats |
| `session-service` | `user-service` | Get mentor profile for session creation |
| `payment-service` | `session-service` | Verify session exists before payment |
| `notification-service` | `user-service` | Look up user email/name |

### Asynchronous (RabbitMQ via Transactional Outbox)

| Publisher | Exchange / Routing Key | Subscriber | Purpose |
|---|---|---|---|
| `payment-service` | `payment.events` | `session-service` | Create session after payment |
| `payment-service` | `payment.events` | `notification-service` | Send payment confirmation email |
| `session-service` | `session.events` | `notification-service` | Session status change emails |
| `user-service` | `mentor.events` | `notification-service` | Mentor approval/rejection emails |

---

## 8. External Integrations

| Integration | Purpose | Config |
|---|---|---|
| **Razorpay** | Payment gateway (INR); order creation + signature verification | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| **Google OAuth 2.0** | Social login via `/api/auth/oauth-login` | Frontend receives Google ID token; sent to backend for validation |
| **Gmail SMTP** | Transactional emails (OTP, session events) | `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587` |
| **Vercel** | Frontend CDN hosting | Static deployment from `Frontend/dist` |
| **AWS EC2** | Backend hosting (all microservices on one instance via Docker) | `api.skillsync.mraks.dev` |

---

## 9. High-Level Data Flow

### Learner Books a Paid Session

```
[Learner Browser]
  → POST /api/payments/create-order (mentorId, amount)
  → [API Gateway] → [Payment-Service]
  → Razorpay: create order
  ← { razorpayOrderId, key }
  → [Frontend: Razorpay Checkout popup]
  → User pays
  → POST /api/payments/verify (orderId, paymentId, signature)
  → [Payment-Service]: verify HMAC signature
  → Write Payment(CAPTURED) + OutboxEvent(PENDING) in single TX
  → Outbox Publisher polls → publishes to RabbitMQ
  → [Session-Service Consumer]: creates Session(PENDING)
  → [Notification-Service Consumer]: sends email to Learner + Mentor
  → [Mentor Browser]: receives WebSocket notification
  → Mentor accepts → PUT /api/sessions/{id}/accept
  → [Session-Service]: Session(ACCEPTED)
  → Notification event → email to Learner
```

---

## 10. Security Considerations

1. **JWT Validation at Gateway** — `JwtAuthenticationFilter` validates every request before routing; extracts `userId`, `email`, `role` and propagates via `X-User-Id`, `X-User-Email`, `X-User-Role` headers. Downstream services never re-validate.
2. **HttpOnly Cookies** — Access + refresh tokens are set as `HttpOnly; Secure; SameSite=None` in production, preventing XSS token theft.
3. **CSRF Origin Filter** — `CsrfOriginFilter` validates `Origin` header against `ALLOWED_ORIGINS` list.
4. **Rate Limiting** — Redis-backed `RateLimitingFilter` at gateway prevents brute-force attacks.
5. **Security Headers** — `SecurityHeadersFilter` adds `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`.
6. **Password Storage** — Bcrypt with 10 rounds (`$2b$10$...`).
7. **Payment Integrity** — Razorpay HMAC-SHA256 signature verification before any business action.
8. **No Secret Leaks** — All credentials via `.env`; `.env.example` ships no real values.

---

## 11. Scalability Considerations

1. **Stateless Services** — All microservices are stateless; JWT carries identity; Redis used for shared cache.
2. **Database Per Service** — 6 isolated PostgreSQL databases prevent cross-service coupling and allow independent scaling.
3. **Redis Caching** — `skillsync-cache-common` module provides shared caching utilities; skill catalog is a prime cache candidate.
4. **Async Decoupling** — RabbitMQ absorbs spikes; session creation and notification sending are fully async.
5. **Horizontal Scaling** — Docker Compose `deploy.replicas` can scale any service; Eureka load-balances via Feign.
6. **Memory Limits** — Per-service Docker memory limits (640MB max) prevent OOM cascades.

---

## 12. Deployment Overview

```
AWS EC2 (Ubuntu)
└── NGINX (reverse proxy + TLS via Let's Encrypt)
    ├── api.skillsync.mraks.dev → localhost:8080 (Docker: api-gateway)
    └── Grafana/Prometheus sub-paths
Docker Compose (on EC2)
├── skillsync-postgres    (port internal)
├── skillsync-rabbitmq   (port 5672, 15672)
├── skillsync-redis       (port 6379)
├── skillsync-zipkin      (port 9411)
├── skillsync-prometheus  (port 9090)
├── skillsync-grafana     (port 3000)
├── skillsync-loki        (port 3100)
├── skillsync-eureka      (port 8761)
├── skillsync-config      (port 8888)
├── skillsync-gateway     (port 8080 → exposed to NGINX)
├── skillsync-auth        (internal)
├── skillsync-user        (internal)
├── skillsync-skill       (internal)
├── skillsync-session     (internal)
├── skillsync-notification(internal)
└── skillsync-payment     (internal)

Vercel
└── skillsync.mraks.dev → React SPA static files
```

---

## 13. Assumptions & Constraints

| # | Assumption / Constraint |
|---|---|
| A1 | Single AWS EC2 instance hosts all microservices (vertical scaling assumed for MVP) |
| A2 | Razorpay processes payments in INR only |
| A3 | Video conferencing is external (meeting link is a string field; no WebRTC implemented) |
| A4 | File uploads (avatars) are URLs only; no object storage integrated |
| A5 | Config server reads from a Git repository (`CONFIG_SERVER_PROFILE=git`) |
| A6 | Groups are not private/invite-only by default; any authenticated user can join |
| A7 | Mentor payment disbursement (payouts to mentors) is out of scope |
| A8 | AI/ML skill matching engine is not implemented; search is filter-based |
| A9 | SMS/WhatsApp notifications are not active; email + WebSocket are the only channels |
| A10 | No multi-tenancy; single platform deployment |

---

## 14. Component Dependency Map

```
auth-service          ← standalone (no Feign calls out)
  ↑
user-service          → auth-service (Feign: user CRUD)
                      → session-service (Feign: count)
  ↑
skill-service         ← standalone (provides skill catalog)
  ↑
session-service       → user-service (Feign: mentor lookup)
                      ← RabbitMQ (payment.events consumer)
  ↑
payment-service       → RabbitMQ (publishes via Outbox)
                      → Razorpay (external REST)
  ↑
notification-service  ← RabbitMQ (session.events, payment.events, mentor.events)
                      → Gmail SMTP
                      → WebSocket (STOMP push to frontend)
  ↑
api-gateway           → eureka-server (service discovery)
                      → config-server (configuration)
                      → all services (routing)
```
