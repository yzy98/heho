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
- Workspace and member foundation
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
Monorepo:        pnpm + Turborepo
Language:        TypeScript
Dashboard:       Next.js / React
API Server:      Hono on Node.js
Worker:          Node.js background worker
Database:        PostgreSQL
Vector Search:   pgvector
ORM:             Drizzle ORM
Queue:           Redis + BullMQ
File Storage:    S3-compatible storage, MinIO for local self-host
Auth:            Better Auth
Widget:          Vite library build, Shadow DOM
React Package:   React chatbot component
SDK:             Typed TypeScript client
Deployment:      Docker Compose first
```

Why this stack:

- PostgreSQL + pgvector keeps relational metadata, chunks, chat logs, and vectors easy to inspect and back up.
- Hono on Node.js keeps the API lightweight while remaining self-host friendly.
- Redis + BullMQ keeps ingestion, scraping, chunking, and embedding out of request/response paths.
- S3-compatible storage lets teams use local MinIO, AWS S3, Cloudflare R2, Tigris, or similar storage.
- A vanilla widget plus React wrapper makes the chatbot usable on almost any website.

## Suggested Monorepo Structure

```txt
apps/
  dashboard      # Admin console
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

### Workspace

A workspace represents a company or tenant. It owns chatbots, knowledge sources, provider configs, embed keys, chat logs, and usage.

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
workspace
workspace_member

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
  -> workspace_member
      -> workspace
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

The workspace is the tenant boundary. All chatbot, knowledge, conversation, and usage data belongs to a workspace.

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
- Admin APIs must require authenticated workspace membership.
- RAG traces must never leak data across workspaces.
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
docker compose up
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
should end with a working checkpoint that can be run locally.

### Day 1: Project Skeleton

- [ ] Scaffold monorepo basic skeleton.
- [ ] Configure typescript, turbo, biome and zed setting.
- [ ] Add root scripts and verify.

### Day 2: Local Runtime

- [ ] Add Docker Compose for local self-hosting:
  - [ ] PostgreSQL with pgvector
  - [ ] Redis
  - [ ] API server
  - [ ] Worker
  - [ ] Dashboard
- [ ] Set up `.env` and `.env.example` with required local variables.
- [ ] Confirm the local stack boots and services can reach PostgreSQL and Redis.

### Day 3: Database Foundation

- [ ] Implement Drizzle schema:
  - [ ] Better Auth tables
  - [ ] `workspace`
  - [ ] `workspace_member`
  - [ ] `chatbot`
  - [ ] `llm_provider`
  - [ ] `knowledge_source`
  - [ ] `knowledge_chunk`
  - [ ] `embed_key`
  - [ ] `chat_session`
  - [ ] `chat_message`
  - [ ] `rag_trace`
  - [ ] `usage_event`
- [ ] Add migrations and migration scripts.
- [ ] Run migrations against local PostgreSQL.
- [ ] Verify pgvector extension and vector columns work.

### Day 4: Auth and Workspace Bootstrap

- [ ] Wire Better Auth into the API and dashboard.
- [ ] Add dashboard sign-in page.
- [ ] Auto-create a default workspace for the first signed-in user.
- [ ] Add minimal workspace membership roles:
  - [ ] `owner`
  - [ ] `member`
- [ ] Add `/workspaces/current` API.
- [ ] Show the current workspace in the dashboard shell.

### Day 5: Chatbot and Provider Setup

- [ ] Add chatbot CRUD API and dashboard form.
- [ ] Add OpenAI-compatible provider API and dashboard form.
- [ ] Encrypt provider API keys with `APP_ENCRYPTION_KEY`.
- [ ] Store provider config:
  - [ ] `base_url`
  - [ ] `api_key`
  - [ ] `chat_model`
  - [ ] `embedding_model`
- [ ] Add a dashboard onboarding checklist showing chatbot and provider setup status.

### Day 6: Embed Keys and Domain Allowlist

- [ ] Generate `pk_*` public embed keys.
- [ ] Store embed key hashes, not raw keys.
- [ ] Store key prefixes for dashboard display.
- [ ] Add optional domain allowlist per embed key.
- [ ] Add embed key dashboard page.
- [ ] Show local install snippet for the selected chatbot.

### Day 7: Text Source Ingestion

- [ ] Add knowledge source API and dashboard page.
- [ ] Support `text` sources.
- [ ] Add BullMQ ingestion queue.
- [ ] Implement deterministic chunking in `packages/rag`.
- [ ] Generate embeddings through the configured OpenAI-compatible provider.
- [ ] Store chunks in PostgreSQL and vectors in pgvector.
- [ ] Mark sources as `ready` or `failed`.
- [ ] Show indexed chunks in the dashboard.

### Day 8: URL Source Ingestion

- [ ] Support `url` sources.
- [ ] Fetch URL content server-side.
- [ ] Strip scripts, styles, and obvious navigation noise.
- [ ] Extract title and readable body text.
- [ ] Reuse the Day 7 ingestion pipeline.
- [ ] Show URL source status, indexed chunks, and ingestion errors in the dashboard.

### Day 9: Retrieval and Prompt Assembly

- [ ] Embed visitor questions.
- [ ] Retrieve top chunks from pgvector.
- [ ] Map retrieved chunks back to sources.
- [ ] Build prompt assembly in `packages/rag`.
- [ ] Include source titles and citation markers in the prompt context.
- [ ] Add retrieval test endpoint or internal debug action for dashboard validation.

### Day 10: Public Widget Chat API

- [ ] Implement public widget API:
  - [ ] `GET /widget/config?key=pk_xxx`
  - [ ] `POST /widget/sessions`
  - [ ] `POST /widget/messages`
- [ ] Validate embed key hash.
- [ ] Validate domain allowlist.
- [ ] Create or reuse chat sessions.
- [ ] Save visitor and assistant messages.
- [ ] Return non-streaming MVP response:
  - [ ] `answer`
  - [ ] `citations`
  - [ ] `traceId`

### Day 11: Transparent RAG Trace

- [ ] Store RAG trace for every widget answer:
  - [ ] Visitor question
  - [ ] Retrieved chunks
  - [ ] Retrieval scores
  - [ ] Prompt preview
  - [ ] Model name
  - [ ] Token usage when available
  - [ ] Latency
  - [ ] Citations
- [ ] Add chat logs page.
- [ ] Add RAG trace detail page.
- [ ] Add usage events for chat, embedding, retrieval, and ingestion.

### Day 12: Website Widget

- [ ] Build `packages/widget`:
  - [ ] Vanilla JavaScript build
  - [ ] Shadow DOM isolation
  - [ ] Floating button
  - [ ] Chat panel
  - [ ] Welcome message
  - [ ] Message input
  - [ ] Loading state
  - [ ] Answer rendering
  - [ ] Citations list
  - [ ] Error state
  - [ ] Basic theme variables
- [ ] Add local embed snippet support:

  ```html
  <script
    src="http://localhost:3000/widget.js"
    data-chatbot-key="pk_xxx"
  ></script>
  ```

### Day 13: Demo and Self-Host Docs

- [ ] Add demo assets:
  - [ ] Demo HTML page with widget installed
  - [ ] Sample text knowledge source
- [ ] Add self-host setup docs:
  - [ ] `cp .env.example .env`
  - [ ] `docker compose up`
  - [ ] `pnpm db:migrate`
  - [ ] Dashboard URL
  - [ ] Widget demo URL
- [ ] Polish dashboard empty states and error states.
- [ ] Make ingestion failure messages visible.

### Day 14: End-to-End Hardening

- [ ] Run acceptance test:
  - [ ] Admin signs in
  - [ ] Default workspace is created
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
- [ ] Run required checks:
  - [ ] `pnpm check`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm build`
- [ ] Fix blocking issues only.
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
