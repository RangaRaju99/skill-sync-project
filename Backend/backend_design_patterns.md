1. Creational Patterns

*   **Builder Pattern**
    *   **Usage:** Extensively used via Lombok's `@Builder` annotation.
    *   **Where it's found:** Entities (`UserSkill`, `Profile`, `LearningGroup`, `Session`, `SagaState`, `OutboxEvent`), DTOs, and Event payloads. This simplifies the instantiation of complex objects with many fields.
*   **Singleton Pattern**
    *   **Usage:** Core to the Spring Framework. 
    *   **Where it's found:** Every class annotated with `@Service`, `@Repository`, `@RestController`, or `@Component` is managed as a Singleton bean in the Spring Application Context.
*   **Factory Method Pattern**
    *   **Usage:** Creating specialized filters in the API Gateway.
    *   **Where it's found:** `JwtAuthenticationFilter` in `api-gateway` extends Spring's `AbstractGatewayFilterFactory`, which acts as a factory to produce gateway filters.

## 2. Structural Patterns

*   **Facade Pattern**
    *   **Usage:** Hiding the complexity of the microservices ecosystem from the client.
    *   **Where it's found:** The `api-gateway` acts as a facade. Clients make a single call to the gateway, which routes the request to the appropriate downstream microservice (user, skill, session, payment, etc.).
*   **Proxy Pattern**
    *   **Usage:** Enabling cross-cutting concerns without modifying the core business logic.
    *   **Where it's found:** Spring AOP dynamically creates proxies for annotations like `@Transactional` (database transaction management) and caching mechanisms. Feign clients also utilize dynamic proxies.
*   **Adapter / Wrapper Pattern**
    *   **Usage:** Adapting external REST APIs into local Java interfaces.
    *   **Where it's found:** OpenFeign interfaces (`@FeignClient`). For example, `SkillServiceClient`, `SessionServiceClient`, and `AuthServiceClient` adapt REST HTTP calls into standard Java method calls.

## 3. Behavioral Patterns

*   **Observer / Publish-Subscribe Pattern**
    *   **Usage:** Asynchronous, event-driven communication between microservices.
    *   **Where it's found:** Implemented extensively using RabbitMQ. Services publish events, and consumers (annotated with `@RabbitListener`) observe and react to these queues (e.g., `PaymentEventConsumer`, `ReviewEventCacheSyncConsumer`, `SessionEventConsumer`).

## 4. Architectural & Microservices Patterns

*   **CQRS (Command Query Responsibility Segregation)**
    *   **Usage:** Separating read operations (Queries) from write operations (Commands).
    *   **Where it's found:** Services are split into `command` and `query` packages. For instance, `user-service` has `MentorCommandService` and `UserCommandService` vs. `MentorQueryService` and `UserQueryService`.
*   **Saga Pattern (Orchestration)**
    *   **Usage:** Managing distributed transactions across multiple microservices without 2-Phase Commit.
    *   **Where it's found:** Deeply implemented in the `payment-service`. It includes a `PaymentSagaOrchestrator`, `SagaState` entity to track the transaction lifecycle (e.g., `SUCCESS_PENDING`, `COMPENSATED`), and a `SagaRecoveryScheduler`.
*   **Transactional Outbox Pattern**
    *   **Usage:** Ensuring atomic updates of database state and reliable message publishing to the message broker.
    *   **Where it's found:** Implemented in `payment-service`. It utilizes `OutboxEvent` entity, `OutboxEventService`, and an `OutboxPublisher` to safely persist events before they are sent to RabbitMQ, preventing data loss if the broker goes down.
*   **Circuit Breaker Pattern**
    *   **Usage:** Preventing cascading failures when a downstream service is unresponsive.
    *   **Where it's found:** The `resilience4j-spring-boot3` dependency is present in the `payment-service` (and likely others) to wrap external calls with fault-tolerance limits.
*   **Data Transfer Object (DTO) Pattern**
    *   **Usage:** Decoupling internal domain models (Entities) from the external API contract.
    *   **Where it's found:** Universally used across all microservices. Requests and responses are mapped to DTOs (e.g., `CreateSkillRequest`, `SkillSummary`, `MentorProfileResponse`).
*   **Dead Letter Queue (DLQ) Pattern**
    *   **Usage:** Handling unprocessable or failed messages gracefully.
    *   **Where it's found:** Queues like `DLQ_BUSINESS_ACTION` and components like `DlqConsumer` in the `payment-service` handle messages that exhaust retry limits.
*   **Service Discovery Pattern**
    *   **Usage:** Allowing microservices to find each other dynamically without hardcoded IPs.
    *   **Where it's found:** The `eureka-server` module acts as the service registry where all other services register themselves.
*   **Externalized Configuration Pattern**
    *   **Usage:** Keeping application configuration separate from the packaged application code.
    *   **Where it's found:** The `config-server` module serves configurations to all microservices from a centralized location.
