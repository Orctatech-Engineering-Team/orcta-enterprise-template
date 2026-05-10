# AGENTS.md — Orcta Enterprise Template

## Workflow

### Always Use These Skills
- **code-review** — Review all changes before committing/submitting
- **code-simplifier** — Refactor for clarity before finalizing

### Iterative Process
1. **Research** — Understand existing code, patterns, and conventions
2. **Design** — Plan in design space, share proposed approach first
3. **Critique** — Discuss tradeoffs, get alignment before coding
4. **Implement** — Small, verifiable increments
5. **Review** — Use code-review skill, iterate based on feedback
6. **Simplify** — Use code-simplifier skill to clean up
7. **Repeat** — Redesign if better approach emerges

### Design First
- Share your design/plan before implementing substantial changes
- Ask "Does this align with existing patterns?"
- Prefer incremental delivery over big-bang solutions

## Commands

Turbo repo monorepo using pnpm workspaces.

### Apps

- **backend** (`apps/backend/`) — Hono API server, Drizzle ORM, PostgreSQL (in progress)
- **web** (`apps/web/`) — TanStack Start React frontend (in progress)
- **orcta-go** (`apps/orcta-go/`) — Mobile App (in progress)

```bash
pnpm dev              # Start all apps (backend + web) with hot reload
pnpm test             # Run all tests (vitest)
pnpm build            # Type-check all packages
pnpm type-check       # Explicit type checking
pnpm db:generate      # Generate Drizzle migrations (backend)
pnpm db:migrate       # Run Drizzle migrations (backend)
pnpm lint             # Lint all packages
pnpm format           # Format code
```

## Run Single Package

```bash
cd apps/backend && pnpm dev              # Backend only
cd apps/backend && pnpm test             # Backend tests only
cd apps/web && pnpm dev                  # Web frontend only
```

## Database

- **PostgreSQL** via Drizzle ORM (not Prisma)
- Requires running PostgreSQL (see docker-compose.yml)
- Must run `db:generate` before `db:migrate` after schema changes
- **`EntityRepository`** base class encapsulates Drizzle CRUD (one repository layer, not two)
- Repository `save()` accepts optional `tx?: unknown` for transaction propagation

## Docker

```bash
# Start PostgreSQL only
docker compose up postgres

# Start full stack (backend + PostgreSQL)
docker compose up backend

# Start all services
docker compose up --build
```

## Runtime

- **Bun** (not Node.js) — runs `.ts` files natively, no compilation step
- Backend entry: `apps/backend/src/main.ts`
- Use `bun run dev` in backend, not `bun run start`

## Architecture

- **DDD + Hexagonal**: Domain → Application → API/Infrastructure
- **Bounded contexts**: Task (exemplar), one `composers/` file per context
- **Use cases**: factory functions, not classes. Railway-oriented with explicit `if (!result.ok) return result` checks
- **Transactional boundaries**: use case wraps `save` + `publishAll` in a single transaction; `tx?: unknown` passed through repository and publisher
- **Event publishing**: batch INSERT (single query for all events, not N round trips)
- **Controller → HTTP mapping**: centralized `toHttpResponse()` helper maps `Result<T>` to status codes
- **Manual DI** via `apps/backend/src/bootstrap/Container.ts` (shared infra) → `composers/task.ts` (context wiring)

## Observability

Every request generates two event types with `request_id` correlation:
1. **HTTP events** — latency, status, metadata
2. **Domain events** — business operations (OrderPlaced, RiderAssigned, etc.)

Key files:
- `src/infrastructure/logging/http-event.ts`
- `src/infrastructure/logging/domain-event.ts`
- `src/api/http/middleware/logging.ts`
- `src/infrastructure/events/PostgresEventPublisher.ts`

## Testing

- Zero mocks — use in-memory test doubles (e.g. `InMemoryTaskRepository`, `InMemoryEventPublisher`)
- Tests colocated with source (`__tests__/` folders)
- Run specific test: `pnpm test src/domain/task/__tests__/Task.test.ts`

## Environment

Copy `.env.example` to `.env` and set:
- `DATABASE_URL`
- `API_KEYS` (comma-separated)

## After Changes

Run lint and typecheck before submitting:
```bash
pnpm lint
pnpm type-check
```
