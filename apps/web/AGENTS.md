# AGENTS.md — Web

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
- Prefer incremental delivery over big-bang

## Commands

```bash
pnpm dev              # Start dev server (vite dev)
pnpm build           # Build + type-check
pnpm preview         # Preview production build
```

## Stack

- **TanStack Start** — Full-stack React framework
- **TanStack Router** — Type-safe routing with file-based routes
- **TanStack Query** — Data fetching + caching (server state)
- **React 19** — UI library
- **Tailwind CSS v4** — Styling (via `@tailwindcss/vite` plugin)
- **Vite** — Build tool

## Philosophy (from philosophy.md)

### Design Tokens
- All visual values MUST come from CSS custom properties tokens
- No hardcoded colors, spacing, or font sizes in components
- Semantic tokens (`--color-*`, `--space-*`, `--font-size-*`) over raw values
- Components use tokens; tokens reference palette values

### Component Levels (dependency rule)
1. **Primitives** — Button, Input, Badge, Avatar. No business logic, no external data
2. **Compositions** — FormField, DataTable. Primitives assembled, still no external data
3. **Features** — OrderCard, PaymentMethodSelector. Connected to app state or API
4. **Pages** — Compose features into complete views

**Rule:** Dependencies flow DOWN only. A Primitive never imports a Feature.

### State Management (four categories, four tools)
- **Server state** → TanStack Query (async, stale, shared)
- **Global client state** → Zustand (sync, app-owned)
- **Local component state** → useState (single component)
- **URL state** → search params (shareable, survives refresh)

### Platform First
Before reaching for a library, ask: what does the browser already provide?
- Fetch instead of axios
- CSS custom properties instead of CSS-in-JS
- IntersectionObserver instead of scroll libraries
- Dialog element instead of modal libraries

### Performance
- Images: always explicit width/height (prevents CLS), use `loading="lazy"`
- Lists >50 items: virtualize with react-window
- Animations: use `transform` and `opacity` only (GPU-accelerated)
- Code split routes with `React.lazy`

### Accessibility (non-negotiable)
- All images have descriptive alt attributes
- All interactive elements keyboard accessible
- All form fields have connected labels (htmlFor/id)
- Focus managed for modals and dynamic content
- Touch targets minimum 44x44px on mobile

## Routing

File-based routing in `src/routes/`. Route tree generated in `src/routeTree.gen.ts`.

- File naming: `route-name.tsx` creates `/route-name`
- Dynamic segments: `users.$userId.tsx` creates `/users/:userId`
- Layouts: `_pathlessLayout.tsx`, `_nested-layout.tsx`
- API routes: `api/*.ts` for server endpoints

## Path Aliases

- `~/` → `src/*` (use for imports within src)

## Entry Point

- `src/router.tsx` — Router + QueryClient setup
- `src/routes/__root.tsx` — Root layout component

## After Changes

Run type-check if available:
```bash
# Install dependencies first if needed
pnpm install
pnpm build
```