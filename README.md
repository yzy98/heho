# Heho

Open-source, self-hosted AI chatbots for company websites, with transparent RAG and bring-your-own LLM providers.

Heho helps teams deploy an embeddable AI chatbot on their own infrastructure. Companies manage agents, knowledge sources, model providers, embed keys, chat logs, and RAG traces from a web dashboard, then install the chatbot on their website through a script tag, React component, or SDK.

Unlike closed chatbot SaaS tools, Heho is designed around control and inspectability: teams can see what documents were indexed, how they were chunked, which chunks were retrieved, what prompt was sent, which model answered, which sources were cited, and how many tokens were used.

## Why Heho?

Many teams want an AI support chatbot, but do not want to send their knowledge base, provider credentials, and customer conversations into a black-box SaaS product.

Heho is built for teams that want:

- **Self-hosting**: deploy on your own infrastructure with Docker.
- **Transparent RAG**: inspect sources, chunks, retrieval scores, prompts, citations, and token usage.
- **BYO LLM provider**: use OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, Ollama, vLLM, or any OpenAI-compatible endpoint.
- **Embeddable website chat**: install with a lightweight script, React component, or headless SDK.
- **Developer-first integration**: own the backend, database, widget behavior, and deployment path.
- **Business control**: keep provider keys, documents, chat logs, and usage data under your control.

## Product Overview

Heho is a B2B AI chatbot platform for company websites.

The core flow:

```txt
Admin dashboard
  -> create chatbot
  -> configure LLM provider
  -> add knowledge sources
  -> inspect chunks and RAG traces
  -> generate public embed key
  -> install widget on company website
  -> visitors ask questions
  -> chatbot answers with citations
```

Heho is not trying to be a general AI workflow platform. It is focused on one job:

> A self-hosted website chatbot that makes RAG transparent and debuggable.

## MVP

The first MVP should prove one thing:

> A company can self-host a website AI chatbot and clearly understand why each answer was generated.

### MVP User Flow

1. Admin starts the app locally or on a server.
2. Admin signs in to the dashboard.
3. Admin creates a chatbot.
4. Admin configures an OpenAI-compatible LLM provider.
5. Admin adds a text or URL knowledge source.
6. Heho chunks the content, embeds it, and stores it.
7. Admin inspects indexed chunks in the dashboard.
8. Admin generates a public embed key.
9. Company website installs the chatbot widget.
10. Visitor asks a question.
11. Backend retrieves relevant chunks.
12. LLM answers with source citations.
13. Dashboard shows chat logs, retrieved chunks, prompt preview, and token usage.

### MVP Includes

- Dashboard authentication
- Organization and member foundation
- Chatbot creation and configuration
- OpenAI-compatible LLM provider configuration
- Text and URL knowledge sources
- Chunking and embeddings
- Vector retrieval
- Floating website chatbot widget
- Public embed key with domain allowlist
- Chat sessions and messages
- Source citations
- RAG trace viewer
- Token and usage events
- Docker Compose self-host setup

### MVP Does Not Include

- Workflow canvas
- Multi-agent orchestration
- Human support handoff
- Ticketing system
- Slack, Discord, WhatsApp, or email channels
- Advanced PDF/DOCX parsing
- Fine-tuning
- Hosted cloud billing
- Complex enterprise RBAC
- Agent marketplace

## Tech Stack

Heho should be optimized for self-hosting first.

Recommended stack:

```txt
Monorepo:         pnpm + Turborepo
Language:         TypeScript
Dashboard:        Vite + React
Dashboard Router: TanStack Router
Server State:     TanStack Query
API Server:       Hono on Node.js
Worker:           Node.js background worker
Database:         PostgreSQL
Vector Search:    pgvector
ORM:              Drizzle ORM
Queue:            Redis + BullMQ
File Storage:     S3-compatible storage, MinIO for local self-host
Auth:             Better Auth
Widget:           Vite library build, Shadow DOM
React Package:    React chatbot component
SDK:              Typed TypeScript client
Deployment:       Docker Compose first
```

Why this stack:

- PostgreSQL + pgvector keeps relational metadata, chunks, chat logs, and vectors easy to inspect and back up.
- Hono on Node.js keeps the API lightweight while remaining self-host friendly.
- Vite keeps the dashboard a lightweight static client while Hono remains the
  single server-side application.
- TanStack Router provides type-safe dashboard routes and protected layouts,
  while TanStack Query manages API-backed server state.
- Redis + BullMQ keeps ingestion, scraping, chunking, and embedding out of request/response paths.
- S3-compatible storage lets teams use local MinIO, AWS S3, Cloudflare R2, Tigris, or similar storage.
- A vanilla widget plus React wrapper makes the chatbot usable on almost any website.

## Suggested Monorepo Structure

```txt
apps/
  dashboard      # Vite + React admin console
  api            # Hono API server
  worker         # Ingestion, embedding, indexing jobs

packages/
  db             # Drizzle schema and migrations
  ai             # LLM and embedding provider adapters
  rag            # Chunking, retrieval, prompt assembly, citations
  widget         # Vanilla floating chatbot widget
  react          # React ChatbotWidget wrapper
  sdk            # Typed API client
  ui             # Shared UI components
```

## Core Concepts

### Organization

Heho uses the Better Auth organization plugin as its company and tenant model.
An organization owns chatbots, knowledge sources, provider configs, embed keys,
chat logs, and usage. Better Auth members link dashboard users to organizations;
Heho does not maintain an additional tenant or membership model.

### Chatbot

A chatbot is the website-facing AI assistant. It contains system instructions, model defaults, theme settings, and retrieval settings.

### LLM Provider

An LLM provider stores the configuration needed to call a model provider.

The MVP should support OpenAI-compatible configuration:

```txt
base_url
api_key
chat_model
embedding_model
```

Provider keys must be encrypted at rest and never exposed to the browser widget.

### Knowledge Source

A knowledge source is content that the chatbot can retrieve from.

MVP source types:

```txt
text
url
```

Future source types:

```txt
file
sitemap
notion
github
zendesk
intercom
confluence
```

### RAG Trace

A RAG trace records the answer path:

```txt
question
retrieved chunks
retrieval scores
prompt preview
model response
citations
token usage
latency
```

This is a core differentiator. Heho should make every answer inspectable.

### Embed Key

Websites should not use secret keys.

Heho should use two key types:

```txt
public embed key: pk_xxx
  Used by browser widgets.
  Can be domain-restricted and rate-limited.

secret API key: sk_xxx
  Used only for server-to-server integrations.
  Must never be exposed in frontend code.
```

## Minimal Database Model

Initial entities:

```txt
user
organization
member

chatbot
llm_provider
knowledge_source
knowledge_chunk

embed_key
chat_session
chat_message
rag_trace
usage_event
```

High-level relationships:

```txt
user
  -> member
      -> organization
          -> chatbot
          -> llm_provider
          -> knowledge_source
              -> knowledge_chunk
          -> embed_key
          -> chat_session
              -> chat_message
              -> rag_trace
          -> usage_event
```

The Better Auth organization is the tenant boundary. All chatbot, knowledge,
conversation, and usage data belongs to an organization.

## Widget Integration

### Script Tag

```html
<script
  src="https://cdn.example.com/heho-widget.js"
  data-chatbot-key="pk_xxx"
  data-position="bottom-right"
></script>
```

### React

```tsx
import { ChatbotWidget } from "@heho/react";

export function App() {
  return (
    <ChatbotWidget
      chatbotKey="pk_xxx"
      position="bottom-right"
      theme="light"
    />
  );
}
```

### Headless SDK

```ts
import { createHehoClient } from "@heho/sdk";

const heho = createHehoClient({
  chatbotKey: "pk_xxx",
});

const response = await heho.chat.sendMessage({
  sessionId: "session_xxx",
  message: "How do I reset my password?",
});
```

## Security Principles

- Public embed keys must support domain allowlists.
- Provider API keys must be encrypted at rest.
- Widget requests must be rate-limited.
- Chatbot access must be scoped by embed key.
- Admin APIs must require authenticated organization membership.
- RAG traces must never leak data across organizations.
- Secret API keys must only be used server-side.

## RAG Pipeline

MVP pipeline:

```txt
source input
  -> normalize
  -> chunk
  -> embed
  -> store chunk metadata in PostgreSQL
  -> store vector in pgvector
  -> retrieve by question embedding
  -> assemble prompt
  -> call LLM provider
  -> return answer with citations
  -> save trace and usage
```

The pipeline should be implemented directly in `packages/rag` rather than hidden behind a large framework. LangChain or LlamaIndex can be optional adapters later, but transparent RAG should remain a first-class internal design goal.

## Self-Hosting Goal

The target setup should eventually be:

```bash
git clone https://github.com/your-org/heho
cd heho
cp .env.example .env
colima start
pnpm infra:up
pnpm infra:check
pnpm dev
```

Then open:

```txt
http://localhost:3000
```

The local stack should include:

```txt
dashboard
api
worker
postgres + pgvector
redis
minio
```

## Local Development Flow

Heho uses Colima and Docker Compose for local infrastructure, while app code
runs through pnpm and Turborepo on the host machine.

```txt
Colima / Docker Compose
  -> PostgreSQL + pgvector
  -> Redis

pnpm / Turborepo
  -> dashboard (Vite on localhost:3000)
  -> api (Hono on localhost:4000)
  -> worker
  -> packages
```

The dashboard and API use a same-origin path contract:

```txt
/       -> dashboard
/api/*  -> Hono API
```

During local development, the Vite development server proxies `/api` to the
Hono API on `http://localhost:4000`. The dashboard calls relative `/api` URLs,
including Better Auth at `/api/auth/*`, so authentication cookies remain
same-origin and the browser client does not depend on cross-origin cookie
configuration.

In production, a reverse proxy or the self-host deployment serves the static
dashboard and forwards `/api/*` to Hono under the same public origin.

Start a development session:

```bash
colima start
pnpm infra:up
pnpm infra:check
pnpm dev
```

Useful infrastructure commands:

```bash
pnpm infra:ps          # Show running containers
pnpm infra:logs        # Follow infrastructure logs
pnpm infra:postgres    # Open psql for the local Heho database
pnpm infra:redis       # Open redis-cli
pnpm infra:down        # Stop containers but keep local data
```

End a development session:

```bash
pnpm infra:down
colima stop
```

Reset local infrastructure data only when you intentionally want to delete the
local PostgreSQL and Redis volumes:

```bash
pnpm infra:reset:danger
```

Colima is the recommended local runtime for macOS development, but it is not a
hard project dependency. Developers using Docker Desktop can still use the same
`pnpm infra:*` scripts.

## Business Model

Heho can be open-source while still supporting a commercial business.

Recommended model:

### Open-source Core

- Self-hosted dashboard
- Chatbot widget
- Basic RAG
- BYO provider
- Basic traces
- Basic usage tracking

### Paid Cloud

- Hosted infrastructure
- Managed database and vector store
- Backups and upgrades
- Monitoring
- Higher limits
- Managed file parsing

### Enterprise

- SSO/SAML
- Advanced RBAC
- Audit logs
- Data retention policies
- PII redaction
- Advanced analytics
- SLA support
- Private deployment support
- Custom integrations

## Positioning

Heho is not:

- a closed chatbot SaaS
- a generic workflow builder
- a multi-agent playground
- a black-box RAG product

Heho is:

> An open-source, self-hosted AI chatbot platform for company websites, with transparent RAG, BYO LLM providers, and embeddable widgets.

## Status

This repository is currently at the project planning stage.

Planned first milestone:

```txt
Docker Compose self-host MVP
  -> dashboard login
  -> create chatbot
  -> configure provider
  -> add text/URL source
  -> inspect chunks
  -> embed widget
  -> answer visitor questions with citations
  -> inspect RAG trace
```

## Development Plan

The first development target is a tight two-week MVP focused on one complete
flow:

```txt
self-host Docker stack
  -> admin dashboard
  -> configure LLM provider
  -> create chatbot
  -> add text/URL knowledge source
  -> index into pgvector
  -> generate public embed key
  -> install widget
  -> visitor asks question
  -> chatbot answers with citations
  -> dashboard shows RAG trace
```

The priority is an end-to-end product loop, not a broad platform. Each day
must end with:

- A locally runnable product checkpoint.
- An observable acceptance result.
- Relevant automated checks passing.

Database schemas and migrations are introduced by the vertical slice that
first needs them. Security and tenant isolation are acceptance requirements,
not deferred hardening tasks.

### Day 1: Project Skeleton

- [x] Scaffold monorepo basic skeleton.
- [x] Configure typescript, turbo, biome and zed setting.
- [x] Add root scripts and verify.

### Day 2: Local Runtime && Database foundation

- [x] Add Docker Compose for local self-hosting:
  - [x] PostgreSQL with pgvector
  - [x] Redis
- [x] Set up `.env` and `.env.example` with required local variables.
- [x] Confirm the local stack boots and services can reach PostgreSQL and Redis.
- [x] Init `packages/db` using drizzle ORM and PostgreSQL.
- [x] Add db related scripts: push, generate, migrate and studio.
- [x] Create simple table and apply changes to local database
- [x] Replace test `users` table with [Better-Auth](https://better-auth.com/docs/installation#create-database-tables) required schemas.
- [x] Add [organization-related schemas](https://better-auth.com/docs/plugins/organization#schema).
- [x] Draw ERD and implement `llmProvider` and `chatbot` schemas.

### Day 3: Auth and Organization Onboarding

- [x] Add the Hono API and Vite + React dashboard app foundations.
- [x] Configure TanStack Router, TanStack Query, and the local `/api` proxy.
- [x] Configure Better Auth on the API with the existing Drizzle schemas.
- [x] Add the Better Auth route handler and dashboard auth client.
- [x] Add a minimal email/password sign-up and sign-in page.
- [x] Add explicit Organization onboarding after sign-up/sign-in:
  - [x] `GET /organizations/current` is read-only and never creates data.
  - [x] A signed-in user without an Organization is redirected to an
        Organization onboarding page.
  - [x] The onboarding form collects Organization `name` and `slug`.
  - [x] `POST /organizations` creates the initial Organization through the
        Better Auth organization plugin.
  - [x] The creator becomes the Organization `owner`.
  - [x] Repeated or concurrent creation requests do not create duplicates.
- [x] Restrict MVP organization membership roles to:
  - [x] `owner`
  - [x] `member`
- [x] Add authenticated `/organizations/current`.
- [x] Derive the current organization from the authenticated Better Auth
      membership; never trust a client-provided organization ID.
- [x] Add authenticated `POST /organizations`:
  - [x] Validate `name` and `slug`.
  - [x] Enforce the MVP single-Organization initialization rule.
  - [x] Use server-side `auth.api.createOrganization` with `userId`; do not
        insert `organization` or `member` rows manually.
- [x] Show the current organization in the dashboard shell after onboarding.
- [x] Acceptance:
  - [x] A new user can sign up, sign in, fill Organization onboarding, and see
        the created Organization.
  - [x] A returning user with membership sees their current Organization.
  - [x] A signed-in user without membership is redirected to onboarding or a
        membership-required state.
  - [x] An unauthenticated request to `/organizations/current` is rejected.
  - [x] `GET /organizations/current` does not create an Organization.
  - [x] Duplicate or concurrent `POST /organizations` calls do not create
        duplicate Organizations.
- [x] Run:
  - [x] `pnpm check`
  - [x] `pnpm typecheck`
  - [x] Relevant auth and organization tests.

### Day 4: LLM Provider Setup

- [x] Define supported chat and embedding model catalogs shared by the API and
      dashboard.
- [x] Model one `llm_provider` row as one capability and credential:
  - [x] `chat`
  - [x] `embedding`
- [x] Store the Provider name, implementation, model, optional custom base URL,
      and encrypted API key.
- [x] Pass custom base URLs to AI SDK provider factories while preserving each
      provider's default URL when none is configured.
- [x] Encrypt Provider API keys with `APP_ENCRYPTION_KEY` using compact JWE,
      direct encryption, and `A256GCM`.
- [x] Add authenticated Provider APIs:
  - [x] `GET /llm-providers`
  - [x] `POST /llm-providers`
- [x] Derive `organizationId` from the authenticated user's membership; never
      accept it from the dashboard.
- [x] Allow all organization members to list Providers and restrict creation to
      the organization `owner`.
- [x] Return safe Provider projections without API keys, encrypted credentials,
      or organization IDs.
- [x] Add the dashboard Provider list, empty/loading/error states, and responsive
      creation dialog.
- [x] Infer dashboard request and response types from the Hono client and
      invalidate the organization-scoped Provider query after creation.
- [x] Acceptance:
  - [x] An owner can create chat and embedding Provider configurations.
  - [x] Members can list Providers but cannot create them.
  - [x] Provider credentials are encrypted at rest and never returned to the
        dashboard.
  - [x] Provider reads and writes are scoped to the authenticated user's
        organization.
- [x] Run:
  - [x] `pnpm check`
  - [x] `pnpm typecheck`
  - [x] Provider API, encryption, authorization, and tenant-isolation tests.

Chatbot API and dashboard work are intentionally deferred to Day 5.

### Day 5: Chatbot Setup

- [ ] Update the `chatbot` schema for capability-specific Provider references:
  - [ ] `chat_provider_id`
  - [ ] `embedding_provider_id`
- [ ] Remove duplicated chat and embedding model fields from `chatbot`; each
      selected Provider row already owns its capability, model, and credential.
- [ ] Preserve Chatbots when a referenced Provider is deleted by setting the
      corresponding Provider reference to `null`.
- [ ] Add authenticated Chatbot APIs:
  - [ ] `GET /chatbots`
  - [ ] `POST /chatbots`
- [ ] Derive `organizationId` from the authenticated user's membership; never
      accept it from the dashboard.
- [ ] Allow all organization members to list Chatbots and restrict creation to
      the organization `owner`.
- [ ] Validate that selected Providers:
  - [ ] Belong to the current organization.
  - [ ] Match the required `chat` or `embedding` capability.
- [ ] Add the dashboard Chatbot list, empty/loading/error states, and responsive
      creation form.
- [ ] Limit the first Chatbot slice to create and list; defer update, delete,
      model execution, RAG, and widget behavior.
- [ ] Acceptance:
  - [ ] An owner can create a Chatbot using chat and embedding Providers from
        the current organization.
  - [ ] Members can list Chatbots but cannot create them.
  - [ ] Cross-organization and capability-mismatched Provider references are
        rejected.
  - [ ] Chatbot responses do not expose Provider credentials or organization
        IDs.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] Chatbot API, authorization, capability, and tenant-isolation tests.

### Day 6: Embed Keys and Domain Allowlist

- [ ] Add the embed key schema and migration.
- [ ] Generate `pk_*` public embed keys.
- [ ] Store embed key hashes, not raw keys.
- [ ] Store key prefixes for dashboard display.
- [ ] Add optional domain allowlist per embed key.
- [ ] Add embed key dashboard page.
- [ ] Show local install snippet for the selected chatbot.
- [ ] Enforce organization membership on embed key management.
- [ ] Acceptance:
  - [ ] A key is displayed once after creation.
  - [ ] Only its hash and prefix remain stored.
  - [ ] The key resolves only to its assigned chatbot and organization.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] Relevant embed key and tenant-isolation tests.

### Day 7: Thin End-to-End Text RAG Slice

- [ ] Add the minimal schemas and migrations for:
  - [ ] `knowledge_source`
  - [ ] `knowledge_chunk`
  - [ ] `chat_session`
  - [ ] `chat_message`
  - [ ] `rag_trace`
- [ ] Add a minimal text knowledge source API and dashboard form.
- [ ] Support `text` sources.
- [ ] Implement deterministic chunking in `packages/rag`.
- [ ] Generate embeddings through the configured OpenAI-compatible provider.
- [ ] Store chunks in PostgreSQL and vectors in pgvector.
- [ ] Mark sources as `ready` or `failed`.
- [ ] Embed visitor questions.
- [ ] Retrieve top chunks from pgvector.
- [ ] Map retrieved chunks back to sources.
- [ ] Assemble the prompt in `packages/rag`.
- [ ] Include source titles and citation markers in the prompt context.
- [ ] Call the configured provider and save the visitor and assistant messages.
- [ ] Save a minimal RAG trace in the same request.
- [ ] Add an authenticated dashboard test action that returns:
  - [ ] `answer`
  - [ ] `citations`
  - [ ] `traceId`
- [ ] Show indexed chunks and the resulting trace in the dashboard.
- [ ] Acceptance:
  - [ ] An owner can add text, index it, ask a question, and receive a cited answer.
  - [ ] The answer, retrieved chunks, and trace belong to the same organization.
  - [ ] Failed ingestion exposes an actionable error.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] RAG tests with deterministic provider and embedding adapters.

### Day 8: Background Ingestion and URL Adapter

- [ ] Add BullMQ ingestion queue and worker processing.
- [ ] Move text ingestion behind the queue without changing its observable result.
- [ ] Add the URL knowledge source adapter:
  - [ ] Fetch URL content server-side.
  - [ ] Strip scripts, styles, and obvious navigation noise.
  - [ ] Extract title and readable body text.
  - [ ] Reuse the Day 7 ingestion pipeline.
- [ ] Show queued, processing, ready, and failed states in the dashboard.
- [ ] Make ingestion jobs idempotent and safe to retry.
- [ ] Acceptance:
  - [ ] Text and URL sources reach `ready` through the worker.
  - [ ] Retrying a job does not create duplicate chunks.
  - [ ] URL ingestion errors are visible in the dashboard.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] Relevant queue, retry, text, and URL ingestion tests.

### Day 9: Public Chat API with Trace

- [ ] Implement:
  - [ ] `GET /widget/config?key=pk_xxx`
  - [ ] `POST /widget/sessions`
  - [ ] `POST /widget/messages`
- [ ] Validate the embed key hash.
- [ ] Validate the request origin against the domain allowlist.
- [ ] Add basic rate limiting for public widget requests.
- [ ] Create or reuse chat sessions.
- [ ] Reuse the Day 7 RAG module for every visitor message.
- [ ] Store the complete MVP RAG trace:
  - [ ] Visitor question
  - [ ] Retrieved chunks
  - [ ] Retrieval scores
  - [ ] Prompt preview
  - [ ] Model name
  - [ ] Token usage when available
  - [ ] Latency
  - [ ] Citations
- [ ] Return:
  - [ ] `answer`
  - [ ] `citations`
  - [ ] `traceId`
- [ ] Acceptance:
  - [ ] A valid key and allowed origin receive a cited answer.
  - [ ] Invalid keys, blocked origins, and rate-limit violations are rejected.
  - [ ] No public request can read data from another organization.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] Public chat, domain allowlist, rate-limit, and tenant-isolation tests.

### Day 10: Minimal Website Widget

- [ ] Build the first runnable `packages/widget` slice:
  - [ ] Vanilla JavaScript build.
  - [ ] Shadow DOM isolation.
  - [ ] Floating button
  - [ ] Chat panel
  - [ ] Message input
  - [ ] Loading state
  - [ ] Answer rendering
  - [ ] Citations list
  - [ ] Error state
- [ ] Load chatbot configuration through the public embed key.
- [ ] Connect the widget to the Day 9 public chat API.
- [ ] Add local embed snippet support:

  ```html
  <script
    src="http://localhost:3000/widget.js"
    data-chatbot-key="pk_xxx"
  ></script>
  ```

- [ ] Acceptance:
  - [ ] The widget loads on a plain local HTML page.
  - [ ] A visitor can ask a question and see a cited answer.
  - [ ] Loading, API failure, and blocked-domain states are visible.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm build`
  - [ ] Widget integration test against the public API.

### Day 11: Dashboard Observability

- [ ] Add chat logs page.
- [ ] Add RAG trace detail page.
- [ ] Show:
  - [ ] Visitor and assistant messages
  - [ ] Retrieved chunks and scores
  - [ ] Prompt preview
  - [ ] Model and token usage
  - [ ] Latency and citations
- [ ] Add the `usage_event` schema and migration.
- [ ] Record usage events for chat, embedding, retrieval, and ingestion.
- [ ] Acceptance:
  - [ ] An owner can open a widget conversation and inspect why its answer was generated.
  - [ ] Trace and usage queries are restricted to the current organization.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] Relevant trace, usage, and tenant-isolation tests.

### Day 12: Product Completion Pass

- [ ] Add widget welcome message and basic theme variables.
- [ ] Add dashboard empty states and actionable error states.
- [ ] Complete the onboarding checklist for:
  - [ ] Provider configured
  - [ ] Chatbot created
  - [ ] Knowledge source ready
  - [ ] Embed key created
  - [ ] Widget installed
- [ ] Verify all provider credentials remain server-only.
- [ ] Verify every admin query derives the current organization from Better
      Auth membership.
- [ ] Acceptance:
  - [ ] A new owner can complete setup without manual database operations.
  - [ ] The dashboard clearly identifies the next incomplete setup step.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm build`

### Day 13: Demo and Self-Host Documentation

- [ ] Add demo assets:
  - [ ] Demo HTML page with widget installed
  - [ ] Sample text knowledge source
- [ ] Add self-host setup docs:
  - [ ] `cp .env.example .env`
  - [ ] `colima start`
  - [ ] `pnpm infra:up`
  - [ ] `pnpm infra:check`
  - [ ] `pnpm db:migrate`
  - [ ] Dashboard URL
  - [ ] Widget demo URL
- [ ] Document required environment variables and secure key generation.
- [ ] Verify the documented setup from a clean local checkout.
- [ ] Acceptance:
  - [ ] A developer can follow the documentation and run the complete demo.
  - [ ] The demo includes a cited answer and an inspectable RAG trace.
- [ ] Run:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm build`

### Day 14: End-to-End Hardening

- [ ] Run acceptance test:
  - [ ] Admin signs in
  - [ ] Default organization is created
  - [ ] Admin creates chatbot
  - [ ] Admin saves provider config
  - [ ] Admin adds text source
  - [ ] Source is indexed into chunks
  - [ ] Admin creates embed key
  - [ ] Widget loads with public key
  - [ ] Visitor asks question
  - [ ] Answer includes citations
  - [ ] Dashboard shows chat log
  - [ ] Dashboard shows RAG trace
  - [ ] Wrong domain is rejected when allowlist is set
- [ ] Test retry and failure paths:
  - [ ] Repeated organization bootstrap
  - [ ] Repeated ingestion job
  - [ ] Provider failure
  - [ ] Invalid embed key
  - [ ] Cross-organization access attempt
- [ ] Run the complete required checks:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm build`
- [ ] Run the full automated test suite.
- [ ] Fix release-blocking issues only.
- [ ] Tag the result as the first local MVP milestone.

### Deferred Until After MVP

- [ ] Streaming responses
- [ ] React package
- [ ] File uploads
- [ ] Sitemap ingestion
- [ ] SSO/SAML
- [ ] Advanced RBAC
- [ ] Billing
- [ ] Hosted cloud
- [ ] Human support handoff
- [ ] Workflow canvas
- [ ] Multi-agent orchestration
