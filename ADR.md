# StockPulse — Architectural Decision Record (ADR)

## Table of Contents
1. [ADR-01: Backend Architecture — Event-Driven Agentic Loop & In-Memory H2 Persistence (Scenario Analysis)](#adr-01-backend-architecture--event-driven-agentic-loop--in-memory-h2-persistence)
2. [ADR-02: Frontend Architecture — React 18 + Vite Reactive Merchandising Console (Scenario Analysis)](#adr-02-frontend-architecture--react-18--vite-reactive-merchandising-console)
3. [ADR-03: Commerce Logic Placement — Dedicated Strategy Engine vs. Service/Entity Layer](#adr-03-commerce-logic-placement--dedicated-strategy-engine-vs-serviceentity-layer)
4. [ADR-04: AI Strategy Contract — Unified Reasoning vs. Split Isolated Prompts](#adr-04-ai-strategy-contract--unified-reasoning-vs-split-isolated-prompts)
5. [ADR-05: Runtime Strategy Switchability — Centralized Strategy Registry](#adr-05-runtime-strategy-switchability--centralized-strategy-registry)
6. [ADR-06: LLM Failure Handling & Resilience — Fail-Safe Circuit Breaker to Rule Baseline](#adr-06-llm-failure-handling--resilience--fail-safe-circuit-breaker-to-rule-baseline)
7. [ADR-07: Extensibility Seams & Deliberate Exclusions (Sprint 2/3 Readiness)](#adr-07-extensibility-seams--deliberate-exclusions-sprint-23-readiness)

---

## ADR-01: Backend Architecture — Event-Driven Agentic Loop & In-Memory H2 Persistence

### Context
ShopStream requires an automated system that reacts instantly when inventory drops below safety thresholds or when product sales velocity spikes. The system must update stock and calculate suggestions without introducing checkout lag. Furthermore, the solution must be evaluated seamlessly in a 5-minute hackathon walkthrough without requiring complex external database server installations, docker daemon dependencies, or migration scripts.

### Scenarios Considered (Comparison & Tradeoffs)

#### Scenario A: Synchronous Transactional Processing with External PostgreSQL Database
- **Description:** Orders flow through `POST /products/{id}/orders`. Inside the database transaction, the backend executes an LLM call synchronously to get pricing/reorder suggestions, saves them to an external PostgreSQL database running on port 5432, and commits the transaction before returning HTTP 200.
- **Why Rejected:** 
  1. *Unacceptable Transaction Latency:* LLM API calls take 1.5 to 4.5 seconds. Locking database rows and holding the client connection for seconds during order placement degrades checkout throughput and causes timeouts.
  2. *Single Point of Failure:* If the LLM provider experiences a temporary rate limit or outage, the entire order placement fails.
  3. *Environment Fragility:* Requiring a running PostgreSQL instance adds friction, external network configuration hurdles, and risks failure during the evaluator's 5-minute walkthrough.

#### Scenario B (Chosen): Asynchronous Spring Event-Driven Agentic Loop with In-Memory H2 Database
- **Description:** Order placement and stock adjustments execute within an atomic, lightweight in-memory H2 database transaction (<15ms). Upon commit, the service publishes an `InventorySignalEvent` via Spring's `ApplicationEventPublisher`. A decoupled `@Async` worker thread picks up the event, evaluates trigger conditions (`INVENTORY_LOW`, `DEMAND_SPIKE`), applies deduplication checks, queries the AI Advisor, and persists `PENDING` suggestions.
- **Why Chosen:** 
  1. *Sub-20ms HTTP Order Response:* Storefront and simulation endpoints return immediately.
  2. *Autonomous Background Reasoning:* Senses, reasons, and queues actions without human or client polling triggers.
  3. *Zero-Setup Evaluation:* In-memory H2 runs out-of-the-box on standard JVM boot, pre-seeded with the exact Addendum A products.

### Decision
Implement **Scenario B**: An asynchronous, event-driven reactive architecture using Spring Boot 3/4, Spring `@Async` thread pools, and an in-memory H2 relational database seeded via `data.sql`.

### Tradeoffs
- **What We Gave Up:** Cross-restart persistence. Data in H2 resets upon application termination. 
- **Mitigation:** The application auto-seeds seeded products on every start, enabling rapid end-to-end demo repeatability. The JPA entities use standard SQL dialects, allowing switching to PostgreSQL in production simply by altering `application.properties`.

---

## ADR-02: Frontend Architecture — React 18 + Vite Reactive Merchandising Console

### Context
Merchandising teams need an actionable, clear cockpit to review AI-generated pricing and reorder suggestions. The console must clearly highlight trigger reasons (`INVENTORY_LOW`, `DEMAND_SPIKE`), show confidence metrics and plain-English reasoning, and allow one-click approvals. The interface must also provide simulation controls so evaluators can trigger stock drops and observe live suggestions without external CLI commands.

### Scenarios Considered (Comparison & Tradeoffs)

#### Scenario A: Server-Side Rendered (SSR) Storefront Architecture (Next.js or Spring MVC Thymeleaf)
- **Description:** A customer-facing e-commerce storefront rendered on the server, with admin pages embedded as server-rendered HTML templates.
- **Why Rejected:**
  1. *Out of Scope:* Sprint 1 focuses exclusively on the reactive commerce loop (replenishment and pricing decisions), not shopping carts or storefront checkout flows.
  2. *Poor Interactive Feedback:* Server-rendered pages require full or partial page refreshes, making it difficult to demonstrate the asynchronous appearance of suggestions triggered by background worker events.

#### Scenario B (Chosen): React 18 + Vite Client-Side Merchandising Console with Smart Polling & Optimistic UI
- **Description:** A dedicated Single Page Application (SPA) built with React 18, TypeScript, and Vite. The console communicates with the Spring Boot backend (`http://localhost:8080`) over typed REST endpoints. It implements smart visibility-aware auto-polling (3-second interval), dual-card suggestions, confidence meters, and one-click simulation modals for instant demo testing.
- **Why Chosen:**
  1. *Zero-Friction Developer Experience:* Sub-50ms Vite HMR, lightning-fast compilation, and strict TypeScript types mirroring backend DTOs.
  2. *Live Reactive UX:* Evaluators click "Simulate Sale" on a product; within seconds, the polling cycle captures the newly generated AI suggestions and animates them into the review panel without page reload.
  3. *Optimistic Updates:* Approving a price change updates the catalog display immediately while the PATCH request completes in the background.

### Decision
Implement **Scenario B**: React 18 with Vite, TypeScript, and Lucide React, running on port `5173`, integrated with backend port `8080` through a strongly typed API service layer and Spring CORS policy.

### Tradeoffs
- **What We Gave Up:** Dedicated WebSockets/SSE server infrastructure for the floor requirements.
- **Mitigation:** A 3000ms polling loop with tab visibility detection (`document.visibilityState`) provides near-instant real-time responsiveness with minimal complexity and zero socket-reconnection edge cases.

---

## ADR-03: Commerce Logic Placement — Dedicated Strategy Engine vs. Service/Entity Layer

### Context
Dynamic pricing and inventory replenishment involve complex formulas and AI integrations. We must decide where this logic resides to prevent the `ProductService` from becoming an untestable monolith.

### Options
1. **Domain Model Entity Logic:** Place calculations inside `Product.java`.
2. **Product Service Layer:** Embed rule and LLM logic directly inside `ProductService.java`.
3. **Dedicated Strategy Component (`CommerceAdvisor` Hierarchy):** Encapsulate algorithms behind a unified interface with discrete implementations (`RuleBasedCommerceAdvisor`, `AiCommerceAdvisor`).

### Decision
We chose **Option 3: Dedicated Strategy Engine**. Commerce calculations are isolated in `com.zycus.stockpulse.advisor`. Neither domain entities nor service orchestrators contain hardcoded pricing rules or prompt templates.

### Tradeoffs
- **What We Gave Up:** Slightly more boilerplate classes (interfaces, registry, recommendation DTOs).
- **Gain:** Strict adherence to Single Responsibility and Open-Closed principles. Unit testing rules requires zero database mocking; Sprint 2's `CompetitorAwareStrategy` plugs in simply by implementing the interface.

---

## ADR-04: AI Strategy Contract — Unified Reasoning vs. Split Isolated Prompts

### Context
When inventory drops or demand spikes, both a pricing recommendation and a reorder quantity recommendation are required. We must decide whether to invoke the LLM once with a combined prompt or make two isolated API calls.

### Options
1. **Split Isolated Calls:** One prompt for pricing and a separate prompt for reorder replenishment.
2. **Unified Advisor Call:** A single structured prompt providing product context, peer averages, and trigger situation, requesting both pricing and reorder JSON objects in a single inference pass.

### Decision
We chose **Option 2: Unified Advisor Call** for the automated loop, while exposing independent manual endpoints for on-demand requests.

### Tradeoffs
- **What We Gave Up:** Granular per-recommendation model tuning.
- **Gain:** 
  1. *50% Latency & Token Reduction:* One roundtrip to Gemini/Groq instead of two.
  2. *Holistic Reasoning:* The LLM reasons over pricing and inventory together (e.g., if reorder lead time is 14 days, the price increase must be higher to protect scarce stock).

---

## ADR-05: Runtime Strategy Switchability — Centralized Strategy Registry

### Context
The brief requires switching between rule-based and AI-powered commerce strategies at runtime without service restarts or code redeployments.

### Options
1. **Spring Profile Reloading:** Restarting application with `--spring.profiles.active=ai`.
2. **Centralized Strategy Registry (`AdvisorRegistry`):** A Spring bean maintaining a thread-safe map of strategy implementations, with an active pointer switchable via REST (`PUT /config/strategy`).

### Decision
We chose **Option 2: Centralized Strategy Registry**. Both HTTP on-demand endpoints and async background event listeners retrieve the currently active advisor via `advisorRegistry.getActiveAdvisor()`.

### Tradeoffs
- **What We Gave Up:** Profile-based configuration isolation.
- **Gain:** Instantaneous switching via UI toggle with zero downtime.

---

## ADR-06: LLM Failure Handling & Resilience — Fail-Safe Circuit Breaker to Rule Baseline

### Context
External LLMs (Gemini, Groq, Ollama) can fail due to rate limits (HTTP 429), timeouts, malformed JSON, or out-of-bounds price outputs. An inventory alert must **never** be silently dropped.

### Options
1. **Fail-Closed:** Log the error and abort suggestion creation.
2. **Retry Loop with Exponential Backoff:** Retry 3-5 times synchronously.
3. **Fail-Safe Fallback to Rule-Based Advisor:** Catch all LLM failures and immediately delegate recommendation generation to `RuleBasedCommerceAdvisor`.

### Decision
We chose **Option 3: Fail-Safe Fallback to Rule-Based Advisor** coupled with strict output bounds validation (`price > 0`, `qty >= 1`). If the LLM generates an invalid or absurd recommendation, the system records a rule-based recommendation marked with: `"[Fallback Applied]: ..."` in the reasoning field.

### Tradeoffs
- **What We Gave Up:** Complex retries on dead LLM endpoints.
- **Gain:** 100% guarantee that every low-stock or spike event produces actionable merchandising suggestions.

---

## ADR-07: Extensibility Seams & Deliberate Exclusions (Sprint 2/3 Readiness)

### Context
Architecture must account for future roadmap requirements without prematurely implementing unneeded complexity.

### Forward-Compatible Seams Included in Sprint 1:
1. **Sprint 2 Margin & Catalog Fields:** Nullable columns `costPrice`, `marginFloor`, and `supplierId` are pre-modeled on the `Product` entity.
2. **Category Peering Metrics:** `CategoryAnalyticsService` calculates peer velocity averages, creating the seam for category-level pricing rules.
3. **Pluggable Interface Seam:** Implementing `CompetitorAwareStrategy` in Sprint 2 requires only adding a new bean to `AdvisorRegistry`.

### Deliberate Exclusions:
1. **Customer Checkout & Shopping Cart:** ShopStream is an internal advisory cockpit; customer storefronts integrate via catalog read APIs.
2. **Automated Purchase Order Dispatching:** Reorder suggestions require explicit human approval (`ACCEPTED`); auto-PO dispatch is deferred to Sprint 3.
3. **Competitor Web Scraping:** Real-time web scraping workers are excluded in favor of clean strategy mocks until Sprint 2.
