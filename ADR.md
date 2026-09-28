# StockPulse — Architectural Decision Record (ADR)

## Table of Contents
1. [ADR-01: Asynchronous Inventory Signals](#adr-01-asynchronous-inventory-signals)
2. [ADR-02: H2 for a Repeatable Demo](#adr-02-h2-for-a-repeatable-demo)
3. [ADR-03: React Merchandising Console](#adr-03-react-merchandising-console)
4. [ADR-04: Pluggable Commerce Advisors](#adr-04-pluggable-commerce-advisors)
5. [ADR-05: LLM Provider Boundary and Configuration](#adr-05-llm-provider-boundary-and-configuration)
6. [ADR-06: Human Approval and Recommendation Safety](#adr-06-human-approval-and-recommendation-safety)
7. [ADR-07: Domain Model and Sprint Boundaries](#adr-07-domain-model-and-sprint-boundaries)
8. [ADR-08: Local Development and Integration](#adr-08-local-development-and-integration)
9. [Known Limitations](#known-limitations)

## ADR-01: Asynchronous Inventory Signals

### Context
An order should update stock without making the caller wait for a recommendation provider. Inventory updates and simulated orders can both trigger pricing and replenishment advice.

### Options considered
- **Synchronous service flow:** evaluate the advisor as part of the order request. This is simpler, but couples request latency and success to AI-provider response time and availability.
- **Spring application event:** publish an inventory signal and handle it on a background executor. This keeps recommendation work separate from the request path without adding a broker to a small, single-process demo.
- **External message broker:** durable asynchronous delivery through Kafka or RabbitMQ. This would help with multi-instance scaling and recovery, but adds deployment and operational requirements beyond the sprint.

### Decision
Use `ApplicationEventPublisher`, `@EventListener`, and `@Async`. Stock/order services save the updated product and publish `InventorySignalEvent`; the listener checks low-stock and demand-spike conditions, checks for existing pending suggestions, asks the active advisor, then saves suggestions. The executor is configured with a bounded pool and queue.

### Tradeoffs
The HTTP path is decoupled from advisor work, but this is an in-process event flow, not a durable queue. Events can be lost if the process stops, and multiple application instances do not share event state. A production deployment would need durable messaging or a transactional outbox, plus operational monitoring and retry policy.

## ADR-02: H2 for a Repeatable Demo

### Context
The project needs a relational store for products and suggestion lifecycles, while remaining quick to run during a short hackathon walkthrough.

### Options considered
- **PostgreSQL:** durable data, production-like operations, and strong concurrent access; requires a database service, credentials, and schema setup.
- **In-memory H2:** JPA-backed relational persistence with no external service; data disappears when the backend stops.
- **No database:** simplest setup, but weakens entity relationships, persistence behavior, and the end-to-end approval flow.

### Decision
Use Spring Data JPA with in-memory H2. Hibernate creates the schema at startup and `data.sql` seeds eight repeatable products, including low-stock and demand-spike demo cases.

### Tradeoffs
Restarting the backend resets products and suggestions. H2 removes local setup friction, not the need for production database planning. Moving to PostgreSQL requires reviewing dialect, schema migration, transaction behavior, and deployment configuration; it is not guaranteed to be a property-only production switch.

## ADR-03: React Merchandising Console

### Context
The main user is a merchandiser reviewing recommendations and testing inventory scenarios, not a shopper completing checkout.

### Options considered
- **Server-rendered pages:** fewer frontend moving parts, but less suited to an interactive dashboard receiving background-generated suggestions.
- **React single-page app:** separate UI and REST API, with local interaction state and a focused console experience.
- **WebSockets or server-sent events:** push updates immediately, at the cost of connection and reconnection handling on both sides.
- **Polling:** simple REST requests on an interval; updates arrive within a few seconds rather than immediately.

### Decision
Use React 19, TypeScript, Vite, and Lucide React for the console. It calls the Spring REST API and polls pending suggestions every three seconds while the page is visible. Suggestion actions update the interface optimistically and refetch if the request fails. The dev servers use ports 5173 and 8080.

### Tradeoffs
Polling is easy to operate for this workload, but adds periodic requests and has a bounded delay before new suggestions appear. Push transport can be considered if the product needs lower latency or more clients. This is an internal merchandising console, so a customer storefront, cart, and payment flow are outside this sprint.

## ADR-04: Pluggable Commerce Advisors

### Context
Pricing and reorder rules should be testable independently of persistence and replaceable as recommendation approaches evolve.

### Options considered
- **Embed logic in entities:** keeps behavior near the data, but mixes external AI concerns and policy calculations into persistence objects.
- **Put all logic in product services:** quick initially, but couples orchestration, recommendation policy, and storage.
- **Advisor interface and implementations:** isolates recommendation logic behind a contract, at the cost of a few additional types.

### Decision
Use the `CommerceAdvisor` contract with rule-based and AI implementations, selected through `AdvisorRegistry`. Rule-based mode is the default. The console/API can switch between `RULE_BASED` and `AI` at runtime without restarting the app.

### Tradeoffs
The registry keeps strategy selection out of service orchestration, but the current switch is in-memory and resets on restart. The UI switch selects AI versus rules; it does not select Gemini, Groq, Ollama, or another model. Adding another commerce strategy requires an implementation of the advisor contract and registry availability.

## ADR-05: LLM Provider Boundary and Configuration

### Context
The project brief names Gemini 1.5 Flash, Llama 3.1 through Groq, and a locally hosted Ollama model as provider options, while the hackathon supplied a specific model/gateway. Provider-specific HTTP details should not leak into recommendation policy.

### Options considered
- **Bind the application to one provider:** less adapter code, but harder to use the supplied gateway or change providers.
- **Provider-aware gateway:** isolate HTTP request formats behind `LLMGateway`, while the advisor consumes parsed recommendation objects.
- **Require an external AI service for all operation:** keeps behavior uniform, but makes a quota, network, or credential problem block the demo and rule-based use.

### Decision
Keep provider calls behind `LLMGateway`. It has adapter paths for Gemini, Groq, Ollama, and the project-specific `qwen-cursor` gateway. The current `application.properties` selects `qwen-cursor`; the provider, model, and base URL are configured there. The API key is read from `LLM_API_KEY`, not committed as a property value. A developer or deployer configures the provider and credentials; the merchandiser only selects AI or rule-based strategy.

The advisor exposes pricing and reorder generation as separate operations. Today, the automated listener invokes both operations separately, so the AI advisor makes two gateway calls; each call uses a scenario prompt and parses a combined pricing/reorder response, then returns the relevant part. This keeps the advisor contract simple, but repeats inference work. A single combined call could reduce latency and token cost, but would need a contract and failure-handling change before being adopted.

### Tradeoffs
The provider boundary limits coupling, but it does not mean all listed models are active or interchangeable without configuration and integration testing. AI requires the matching provider/model/base URL and credentials. Rule-based mode needs no external AI service; AI generation falls back to rule-based recommendations when the call or response parsing fails. The separate inference calls add latency and usage cost. There is no retry/circuit-breaker service in this sprint.

## ADR-06: Human Approval and Recommendation Safety

### Context
Price changes and replenishment affect commercial outcomes. For this sprint, advice should be visible and explainable while a person retains the final decision.

### Options considered
- **Automatically apply recommendations:** reduces manual work, but risks applying an unsuitable price or order quantity.
- **Require human review:** makes the recommendation inspectable and supports a safe demonstration of the full workflow.

### Decision
Persist pricing and reorder suggestions as `PENDING`, with trigger reason, confidence, and reasoning. A merchandiser accepts or rejects each suggestion. Acceptance updates `currentPrice` or simulates inbound stock; rejection leaves the product values unchanged. Pending suggestions are checked to avoid creating another pending suggestion of the same type for the same product and trigger.

### Tradeoffs
Human review slows action but is appropriate before margin guardrails, supplier integration, and automated policy are available. Deduplication is an application-level check, not a database uniqueness guarantee, so concurrent event handling may still require stronger idempotency controls at scale.

## ADR-07: Domain Model and Sprint Boundaries

### Context
The current workflow needs catalog state, inventory signals, and separately actioned pricing and reorder proposals. Some next-sprint data is already foreseeable, but implementing those integrations now would expand scope.

### Options considered
- **One generic recommendation record:** reduces tables, but mixes different action fields and acceptance effects.
- **Separate pricing and reorder entities:** makes each proposal's state and accepted action explicit.
- **Implement the future competitor, supplier, and margin workflows immediately:** adds scope not needed to demonstrate the current loop.

### Decision
Use separate `PricingSuggestion` and `ReorderSuggestion` entities linked to `Product`, with explicit status and trigger enums. Product tracks SKU, category, current price, stock, reorder threshold, demand velocity, and lifecycle status. Nullable `costPrice`, `marginFloor`, and `supplierId` fields reserve a modest extension point without implementing Sprint 2 integrations.

### Tradeoffs
Separate records make approval behavior clear but require coordinating two suggestion types. The extension fields alone do not provide margin enforcement, competitor pricing, supplier data, automated purchase orders, or category pricing policy; those remain future work.

## ADR-08: Local Development and Integration

### Context
The UI and API run as separate applications during development and need a predictable local integration path.

### Options considered
- **Serve the UI through Spring Boot:** one local origin, but couples frontend build and backend iteration.
- **Separate Vite and Spring Boot dev servers:** independent hot reload and backend startup, with explicit CORS and API base URL configuration.

### Decision
Run Vite on port 5173 and Spring Boot on port 8080. The frontend defaults to `http://localhost:8080` and supports `VITE_API_BASE_URL`; Spring CORS allows the local Vite origin. The API uses `/api` routes.

### Tradeoffs
This setup is straightforward locally, but the current CORS allowlist is development-specific. Production deployments must set the real frontend origin and secure transport/configuration rather than reuse the localhost policy.