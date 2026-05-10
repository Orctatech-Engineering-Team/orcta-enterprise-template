# Backend — Orcta Enterprise Template

Hono API server with Drizzle ORM, PostgreSQL, and DDD+Hexagonal architecture.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start PostgreSQL
docker compose up postgres -d

# Generate and run migrations
pnpm db:generate && pnpm db:migrate

# Start dev server with hot reload
pnpm dev
```

## Architecture

```
src/
├── domain/              # Pure business logic — ZERO external deps
│   ├── task/            # [EXAMPLE] Task bounded context
│   └── shared/          # Result<T,E>, branded types, pagination
├── application/         # Use cases (factory functions, not classes)
├── api/http/            # Controllers, middleware, routes
├── infrastructure/      # Postgres repos, event publisher, logging
├── bootstrap/           # Composition root
│   ├── Container.ts     # Shared infra + delegates to composers
│   └── composers/       # One file per bounded context (e.g. task.ts)
├── config/              # Env loading, DB connection
└── main.ts              # Entry point
```

## Key Patterns

- **Use cases**: Factory functions, not classes. Railway-oriented with `if (!result.ok) return result`
- **Repository**: `EntityRepository` base class (one layer, not two). `save()` accepts `tx?: unknown`
- **Event publishing**: Batch INSERT (single query for all events)
- **Controllers**: Centralized `toHttpResponse()` maps `Result<T>` to HTTP status codes
- **DI**: Context-level composers (`composers/task.ts`) wired in `Container.ts`

## Adding a New Bounded Context

1. Create domain entities, repository interface, events in `src/domain/{context}/`
2. Create use cases as factory functions in `src/application/{context}/`
3. Create controller + routes in `src/api/http/{context}/`
4. Create Postgres repo + schema in `src/infrastructure/`
5. Create `src/bootstrap/composers/{context}.ts`
6. Call the composer from `createContainer` in `Container.ts`
