# Orcta Enterprise Template

A production-ready TypeScript monorepo template following **Domain-Driven Design** + **Hexagonal Architecture** principles. Includes a working Task Management example domain to demonstrate all patterns.

## What You Get

| Layer | Tech | Purpose |
|---|---|---|
| **Runtime** | Bun | Native TypeScript execution, no build step |
| **API** | Hono | Lightweight, typed, composable HTTP framework |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe queries, visible SQL, easy migrations |
| **Validation** | Zod | Runtime input validation |
| **Logging** | Pino | Structured JSON logging with sampling |
| **Testing** | Vitest | Fast tests with zero mocks (in-memory test doubles) |
| **Frontend** | TanStack Start + React 19 | Full-stack TypeScript with SSR |
| **Mobile** | Expo / React Native | Cross-platform mobile app |
| **Monorepo** | pnpm + Turborepo | Fast, parallel task execution |

## Patterns Demonstrated

The included Task Management domain shows:

- **Discriminated Unions** — State machines where illegal states are unrepresentable
- **Result<T,E>** — Typed error handling, no exceptions in domain logic
- **Branded Types** — Compile-time ID safety (TaskId != string)
- **CQRS** — Domain entities for writes, direct SQL for reads (3-5x faster lists)
- **Domain Events** — Decoupled side effects via typed, versioned events
- **Repository Pattern** — Interface in domain, Postgres implementation in infra, in-memory for tests
- **Manual DI** — Context-level composers (`composers/task.ts`), compile-time safe, zero framework magic
- **Use Cases as Functions** — Factory functions, not classes. Railway-oriented error handling
- **Batch Events** — Domain events published in a single INSERT, not N round trips
- **Observability** — Every request generates correlated HTTP + domain events

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start PostgreSQL
docker compose up postgres -d

# Run migrations
cd apps/backend && pnpm db:generate && pnpm db:migrate && cd ../..

# Start development (backend + frontend)
pnpm dev

# Run tests
pnpm test
```

## Using as a Template

1. **Delete the example**: Remove `apps/backend/src/domain/task/` and corresponding application/API/infrastructure files
2. **Add your domain**: Create entities with discriminated union states, repository interfaces, domain events
3. **Wire it up**: Create `src/bootstrap/composers/{context}.ts`, call it from `Container.ts`, update `app.ts` and `schema.ts`
4. **Test**: Use `InMemoryTaskRepository` as a template for your test doubles
5. **Read the handbook**: See [ENGINEERING_HANDBOOK.md](ENGINEERING_HANDBOOK.md) for full design principles

## Architecture

```
src/
├── domain/              # Business logic — ZERO external dependencies
│   ├── task/           # [EXAMPLE] Delete and replace with your domain
│   └── shared/         # Result<T,E>, branded types, pagination
├── application/         # Use cases (factory functions)
├── api/http/           # Controllers, middleware, routes
├── infrastructure/      # DB repos, event publisher, logging
├── bootstrap/          # Composition root
│   ├── Container.ts    # Shared infra + delegates to composers
│   └── composers/      # One file per bounded context
├── config/             # Env loading, DB connection
└── main.ts             # Entry point
```

## Commands

```bash
pnpm dev              # Start all apps (backend + frontend)
pnpm test             # Run all tests
pnpm build            # Type-check all packages
pnpm lint             # Lint all packages
pnpm format           # Format code
pnpm type-check       # Explicit type checking
```

## License

Proprietary — All Rights Reserved. See LICENSE file for details.
