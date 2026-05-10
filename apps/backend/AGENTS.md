# AGENTS.md — Backend

## Workflow

### Always Use These Skills
- **code-review** — Review all changes before committing/submitting  
- **code-simplifier** — Refactor for clarity before finalizing

### Iterative Process
1. **Research** — Understand existing code, patterns, conventions
2. **Design** — Plan in design space, share proposed approach first
3. **Critique** — Discuss tradeoffs, get alignment before coding
4. **Implement** — Small, verifiable increments
5. **Review** — Use code-review skill, iterate
6. **Simplify** — Use code-simplifier skill to clean up
7. **Repeat** — Redesign if better approach emerges

### Design First
- Share design/plan before substantial changes
- Ask "Does this align with existing patterns?"
- Prefer incremental delivery over big-bang

## Commands

```bash
bun run dev              # Start with hot reload (bun run --watch src/main.ts)
bun run test            # Run tests (vitest run)
bun run test:watch     # Watch mode
bun run build          # Type-check (tsc --noEmit)
bun run type-check     # Type-check
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate    # Run migrations
bun run lint
bun run format
```

## Entry Point

- `src/main.ts` — Application bootstrap with config loading, DB connection, DI container
- `src/index.ts` — Re-exports container types

## Architecture

- **DDD + Hexagonal**: Domain → Application → API/Infrastructure
- **Manual DI** in `src/bootstrap/Container.ts` (THE composition root)
- **Bounded contexts**: Order, Dispatch, Tracking, Payment
- **No framework DI** — pure manual dependency injection, compile-time safe

## Path Aliases

Use these instead of relative imports:
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@api/*` → `src/api/*`
- `@config/*` → `src/config/*`
- `@bootstrap/*` → `src/bootstrap/*`
- `@/*` → `src/*`

## Testing

- Zero mocks — use in-memory test doubles
- Tests colocated with source in `__tests__/` folders
- Run specific test: `bun test src/domain/order/entities/__tests__/Order.test.ts`

## Database

- **Drizzle ORM** (not Prisma)
- Migrations in `drizzle/` folder
- Schema in `src/infrastructure/schema/schema.ts`
- Generate before migrate: `bun run db:generate` → `bun run db:migrate`

## Observability

Two event types per request with `request_id` correlation:
1. **HTTP events** — `src/infrastructure/logging/http-event.ts`
2. **Domain events** — `src/infrastructure/logging/domain-event.ts`

Middleware: `src/api/http/middleware/logging.ts`

## Environment

`.env` file required:
- `DATABASE_URL`
- `PAYSTACK_SECRET_KEY`
- `COMMISSION_RATE_BPS` (default 2000)
- `DEFAULT_CURRENCY` (default GHS)
- `PORT` (default 3000)
- `HOST` (default 0.0.0.0)

## After Changes

Run lint and typecheck:
```bash
bun run lint
bun run type-check
```