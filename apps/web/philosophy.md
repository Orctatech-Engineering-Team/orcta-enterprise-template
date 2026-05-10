## A Philosophy of Frontend Development 

### The Right Starting Point

Frontend is the most misunderstood discipline in software engineering. Backend engineers often dismiss it as "just UI." Designers often dismiss it as "just implementation." The truth is that frontend engineering done well requires mastery of five distinct disciplines simultaneously:

```
THE WEB PLATFORM    → how browsers actually work
CSS AS A SYSTEM     → layout, visual language, design tokens
COMPONENT DESIGN    → architecture, state, data flow
UX THINKING         → how humans perceive and interact
PERFORMANCE         → speed as a design constraint, not an afterthought
```

Most frontend engineers are strong in one or two of these. A frontend philosophy for Orcta means being intentional about all five — and understanding how they connect.

---

## Part 1: The Web Platform — What You Are Actually Building On

Before any framework, before any component, before any CSS — the browser is the runtime. Understanding it changes how you make every decision.

### How the Browser Renders a Page

The browser turns your HTML, CSS, and JavaScript into pixels through a specific pipeline.
```
1. PARSING
   HTML → DOM (Document Object Model) — the tree of elements
   CSS  → CSSOM (CSS Object Model) — the tree of styles
   Both must be parsed before rendering can begin

2. STYLE CALCULATION
   Browser matches CSS rules to DOM nodes
   Computes the final computed style for every element
   Expensive when selectors are overly complex

3. LAYOUT (Reflow)
   Browser calculates the position and size of every element
   Layout is triggered by: changing dimensions, adding/removing elements,
   font changes, window resize
   Layout is expensive — it cascades (one element affects its neighbours)

4. PAINT
   Browser fills in pixels for each element
   Background colours, borders, text, shadows
   Cheaper than layout but still significant

5. COMPOSITE
   Browser combines painted layers into the final image
   GPU-accelerated — the cheapest stage
   opacity and transform animate here — why they are the preferred
   animation properties (they skip layout and paint entirely)
```

**Why this matters for your code:**

```typescript
// EXPENSIVE — forces layout recalculation every iteration
// Reading offsetHeight forces the browser to calculate layout
// Then writing width triggers layout again — "layout thrashing"
elements.forEach(el => {
  const height = el.offsetHeight;     // READ — forces layout
  el.style.width = height + "px";     // WRITE — triggers layout
});

// EFFICIENT — batch reads then writes
const heights = elements.map(el => el.offsetHeight); // READ all
elements.forEach((el, i) => {
  el.style.width = heights[i] + "px"; // WRITE all — one layout recalculation
});

// BEST — use CSS for layout-dependent sizing, not JavaScript
// Let the browser handle it natively
```

### The Critical Rendering Path

The time between a user requesting a page and seeing something useful is determined by how quickly the browser can complete its first render. Understanding what blocks this path is the foundation of web performance:

```
Network request
    ↓
HTML received → Parser begins
    ↓
<link rel="stylesheet"> encountered
    → CSS download begins → BLOCKS rendering until complete
    ↓
<script> encountered (without async/defer)
    → JavaScript download begins → BLOCKS parsing AND rendering
    ↓
CSS parsed → CSSOM built
    ↓
JavaScript executes (may modify DOM and CSSOM)
    ↓
DOM + CSSOM → Render Tree
    ↓
Layout → Paint → Composite
    ↓
First Contentful Paint (FCP) — user sees something
```

**The implication:** CSS blocks rendering. JavaScript blocks parsing. Every render-blocking resource delays the moment the user sees anything. This is why:

```html
<!-- CSS in <head> — must block rendering (needed for first paint) -->
<head>
  <link rel="stylesheet" href="critical.css">
  <!-- Non-critical CSS loaded asynchronously -->
  <link rel="stylesheet" href="non-critical.css"
        media="print" onload="this.media='all'">
</head>

<!-- Scripts at end of body or with defer — do not block parsing -->
<body>
  <!-- content -->
  <script src="app.js" defer></script>
  <!-- defer: downloads in parallel, executes after HTML parsed -->
  <!-- async: downloads in parallel, executes immediately when ready -->
  <!-- type="module": deferred by default -->
</body>
```

### Web Standards — Building on the Platform, Not Around It

The most important principle in modern frontend engineering:

> **Use the platform first. Reach for a library only when the platform is genuinely insufficient.**

The web platform has evolved dramatically. Things that required jQuery in 2010 or a custom library in 2015 are now native browser APIs. Engineers who do not know the platform reach for libraries unnecessarily, adding weight, adding dependencies, and adding failure points.

```typescript
// Things that no longer need a library:

// Fetch (no axios needed for basic cases)
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(order),
});

// CSS custom properties (no CSS-in-JS needed for theming)
:root { --color-primary: #0D7377; }
.button { background: var(--color-primary); }

// CSS Grid and Flexbox (no layout library needed)
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

// IntersectionObserver (no scroll library needed for lazy loading)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) loadImage(entry.target);
  });
});

// CSS animations (no animation library needed for simple cases)
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.element { animation: fadeIn 200ms ease-out; }

// Dialog element (no modal library needed)
<dialog id="confirm-modal">...</dialog>
document.getElementById("confirm-modal").showModal();

// Form validation (no validation library needed for basic cases)
<input type="email" required minlength="5" maxlength="100">
```

This is not anti-library dogma. Tanstack Query, Radix UI, Framer Motion — these solve real problems the platform does not. The discipline is knowing the platform well enough to know when you actually need the library.

---

## Part 2: CSS as a System

CSS is the most underestimated language in frontend development. It is also the one most commonly written without a mental model, producing codebases where making one change breaks something unrelated three pages away.

The mental model: **CSS is not a list of rules. It is a system with explicit mechanisms for cascade, specificity, inheritance, and layout.** Understanding the system is what makes CSS predictable.

### The Cascade — How CSS Actually Resolves Styles

When multiple rules apply to the same element, the cascade determines which wins. In order of priority:

```
1. !important declarations (avoid — breaks the cascade system)
2. Inline styles (style="...")
3. ID selectors (#element)
4. Class selectors (.element), attribute selectors ([type="text"]), pseudo-classes (:hover)
5. Element selectors (div, p, h1), pseudo-elements (::before)
6. Universal selector (*), combinators (+, >, ~)
```

The higher the specificity, the harder it is to override. This is why CSS becomes unmaintainable when engineers reach for higher-specificity selectors to override styles they do not understand:

```css
/* The specificity arms race — how CSS becomes unmaintainable */
.button { color: blue; }                    /* specificity: 0,1,0 */
.header .button { color: red; }             /* specificity: 0,2,0 — overrides */
#nav .header .button { color: green; }      /* specificity: 1,2,0 — overrides */
#nav .header .button.active { color: purple; } /* getting ridiculous */
body #nav .header .button.active { color: orange !important; } /* broken */

/* The correct approach: keep specificity flat and consistent */
.button { color: blue; }
.button--primary { color: red; }    /* modifier class, same specificity */
.button--active { color: green; }   /* another modifier, same specificity */
```

### Design Tokens — The Foundation of the Orcta Design System

Design tokens are the atomic values of your visual language. They are the single source of truth for every colour, spacing value, typography size, border radius, and shadow in your system. Every visual decision in every component traces back to a token.

```css
/* tokens.css — the foundation of the Orcta Design System */
:root {
  /* ─── Colour Palette ─── */
  /* Raw values — not used directly in components */
  --palette-navy-900: #0D1B2A;
  --palette-navy-800: #16213E;
  --palette-teal-600: #0D7377;
  --palette-teal-500: #14919B;
  --palette-gold-400: #E8C547;
  --palette-red-500: #E94560;
  --palette-green-600: #276749;
  --palette-grey-50:  #F9FAFB;
  --palette-grey-100: #F3F4F6;
  --palette-grey-200: #E5E7EB;
  --palette-grey-500: #6B7280;
  --palette-grey-900: #111827;
  --palette-white:    #FFFFFF;

  /* ─── Semantic Colour Tokens ─── */
  /* These are what components use — not palette values */
  --color-brand-primary:    var(--palette-teal-600);
  --color-brand-secondary:  var(--palette-navy-900);
  --color-accent:           var(--palette-gold-400);

  --color-surface-page:     var(--palette-grey-50);
  --color-surface-card:     var(--palette-white);
  --color-surface-overlay:  var(--palette-navy-900);

  --color-text-primary:     var(--palette-grey-900);
  --color-text-secondary:   var(--palette-grey-500);
  --color-text-inverse:     var(--palette-white);
  --color-text-brand:       var(--palette-teal-600);

  --color-border-default:   var(--palette-grey-200);
  --color-border-strong:    var(--palette-grey-500);
  --color-border-brand:     var(--palette-teal-600);

  --color-status-success:   var(--palette-green-600);
  --color-status-warning:   var(--palette-gold-400);
  --color-status-error:     var(--palette-red-500);

  /* ─── Spacing Scale ─── */
  /* 4px base unit — everything is a multiple of 4 */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ─── Typography Scale ─── */
  --font-family-sans:  "Inter", system-ui, -apple-system, sans-serif;
  --font-family-serif: "Georgia", "Times New Roman", serif;
  --font-family-mono:  "JetBrains Mono", "Fira Code", monospace;

  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  1.875rem;  /* 30px */
  --font-size-4xl:  2.25rem;   /* 36px */
  --font-size-5xl:  3rem;      /* 48px */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold: 600;
  --font-weight-bold:    700;

  --line-height-tight:  1.25;
  --line-height-normal: 1.5;
  --line-height-loose:  1.75;

  /* ─── Border Radius ─── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;  /* pill shape */

  /* ─── Shadows ─── */
  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* ─── Motion ─── */
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);  /* entering */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);  /* leaving */

  /* ─── Z-Index Scale ─── */
  --z-below:   -1;
  --z-base:     0;
  --z-raised:   10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
}
```

**Why semantic tokens over palette values directly:**

```css
/* WRONG — component uses palette value directly */
.button-primary {
  background: #0D7377; /* hardcoded — if the brand colour changes, hunt everywhere */
}

/* CORRECT — component uses semantic token */
.button-primary {
  background: var(--color-brand-primary); /* change once in tokens, applies everywhere */
}

/* CORRECT — dark mode with zero component changes */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface-page:  var(--palette-navy-900);
    --color-surface-card:  var(--palette-navy-800);
    --color-text-primary:  var(--palette-grey-50);
    /* All components automatically reflect dark mode
       because they use semantic tokens, not palette values */
  }
}
```

### CSS Layout — Grid and Flexbox as a System

The two layout systems serve different purposes and are used together, not interchangeably:

```css
/*
  FLEXBOX: one-dimensional layout
  Use when: laying out items in a row OR a column
  Strength: distributing space between items, aligning items on one axis
*/

/* Navigation bar — items in a row, space between */
.navbar {
  display: flex;
  justify-content: space-between;  /* main axis — horizontal */
  align-items: center;             /* cross axis — vertical */
  gap: var(--space-4);
}

/* Card content — items in a column */
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Button — icon and text in a row, centred */
.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

/*
  CSS GRID: two-dimensional layout
  Use when: laying out items in rows AND columns simultaneously
  Strength: page-level layout, complex grids, overlapping elements
*/

/* Page layout */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 280px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* Responsive card grid */
.card-grid {
  display: grid;
  /* auto-fill: creates as many columns as fit
     minmax(280px, 1fr): each column at least 280px, expands to fill space
     No media queries needed — responsiveness is intrinsic */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Delivery order card — positioned elements */
.order-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--space-2) var(--space-4);
}
```

### CSS Architecture — The BEM + Utility Hybrid

For the Orcta Design System, the right CSS architecture is a hybrid:

```
COMPONENT LAYER  → BEM naming for complex, stateful components
UTILITY LAYER    → utility classes for spacing, typography, colour
TOKEN LAYER      → CSS custom properties for all values
```

```css
/* ─── BEM Component ─── */
/* Block: the component */
.delivery-card { }

/* Element: part of the component */
.delivery-card__header { }
.delivery-card__status { }
.delivery-card__address { }
.delivery-card__meta { }

/* Modifier: variation of the component or element */
.delivery-card--urgent { border-left: 4px solid var(--color-status-error); }
.delivery-card__status--delivered { color: var(--color-status-success); }
.delivery-card__status--in-transit { color: var(--color-brand-primary); }

/* ─── Utility Classes ─── */
/* For spacing, typography — things that vary per usage context */
.mt-4  { margin-top: var(--space-4); }
.px-6  { padding-left: var(--space-6); padding-right: var(--space-6); }
.text-sm { font-size: var(--font-size-sm); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.text-secondary { color: var(--color-text-secondary); }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
```

---

## Part 3: Component Architecture

### The Component Design Hierarchy

Every component in the Orcta Design System belongs to one of five levels. Understanding the level determines the design constraints:

```
Level 1: TOKENS
  CSS custom properties — not components, but the foundation
  Examples: --color-brand-primary, --space-4, --radius-md

Level 2: PRIMITIVES
  Single-purpose, no business logic, no external data dependencies
  Fully accessible, fully themeable, exhaustively tested
  Examples: Button, Input, Badge, Avatar, Spinner, Icon

Level 3: COMPOSITIONS
  Primitives assembled into patterns
  No business logic, no external data
  Examples: FormField (Label + Input + ErrorMessage),
            DataTable (table + sorting + pagination),
            SearchInput (Input + Icon + clear button)

Level 4: FEATURES
  Business logic enters here
  Connected to application state or API
  Examples: OrderCard, RiderLocationMap, PaymentMethodSelector

Level 5: PAGES / SCREENS
  Compose features into complete views
  Connected to routing, layout, authentication
  Examples: CustomerDashboard, RiderDeliveryScreen, OpsOrderList
```

**The rule:** components at lower levels must never depend on components at higher levels. A Primitive must never import a Feature. A Composition must never import a Page. Dependencies flow downward only — exactly like the dependency rule in the backend.

### Primitives — Built Right From the Start

```tsx
// Button — a properly built primitive
// Accessible, variant-complete, loading-aware, icon-capable

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        "orcta-button",
        `orcta-button--${variant}`,
        `orcta-button--${size}`,
        loading && "orcta-button--loading",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="orcta-button__icon orcta-button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      <span className="orcta-button__label">
        {children}
      </span>

      {!loading && rightIcon && (
        <span className="orcta-button__icon orcta-button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";
```

```css
/* button.css */
.orcta-button {
  /* Reset */
  appearance: none;
  border: none;
  cursor: pointer;
  text-decoration: none;

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  /* Typography */
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  white-space: nowrap;

  /* Interaction */
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);

  /* Focus — visible for keyboard navigation */
  border-radius: var(--radius-md);
  outline: none;
}

.orcta-button:focus-visible {
  /* :focus-visible shows only for keyboard navigation, not mouse clicks */
  box-shadow: 0 0 0 3px var(--color-brand-primary), 0 0 0 1px white;
}

.orcta-button:active:not(:disabled) {
  transform: scale(0.98); /* subtle press feedback */
}

/* Variants */
.orcta-button--primary {
  background: var(--color-brand-primary);
  color: var(--color-text-inverse);
}
.orcta-button--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-brand-primary) 85%, black);
}

.orcta-button--secondary {
  background: transparent;
  color: var(--color-brand-primary);
  box-shadow: inset 0 0 0 1.5px var(--color-brand-primary);
}

.orcta-button--ghost {
  background: transparent;
  color: var(--color-text-primary);
}
.orcta-button--ghost:hover:not(:disabled) {
  background: var(--color-surface-page);
}

.orcta-button--danger {
  background: var(--color-status-error);
  color: var(--color-text-inverse);
}

/* Sizes */
.orcta-button--sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
}
.orcta-button--md {
  height: 40px;
  padding: 0 var(--space-4);
  font-size: var(--font-size-base);
}
.orcta-button--lg {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--font-size-lg);
}

/* States */
.orcta-button:disabled,
.orcta-button--loading {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### State Management — The Right Mental Model

State in a frontend application has four distinct categories. Mixing them up is the primary source of unnecessary complexity:

```typescript
/*
  CATEGORY 1: SERVER STATE
  Data that lives on the server. You are caching a copy locally.
  Characteristics: async, potentially stale, shared across components
  Tool: TanStack Query

  CATEGORY 2: GLOBAL CLIENT STATE
  State owned by the frontend, needed across many components
  Characteristics: synchronous, always fresh, belongs to the app
  Tool: Zustand (simple) or Jotai (atomic)

  CATEGORY 3: LOCAL COMPONENT STATE
  State owned by a single component, not needed elsewhere
  Characteristics: synchronous, transient, belongs to the component
  Tool: useState, useReducer

  CATEGORY 4: URL STATE
  State that should survive a page refresh and be shareable
  Characteristics: serialised in the URL, affects navigation
  Tool: URL search params, React Router
*/

// Example: Orcta Go customer dashboard

// Server state — order data lives on the server
const { data: orders, isLoading, error } = useQuery({
  queryKey: ["orders", "active", customerId],
  queryFn: () => api.getActiveOrders(customerId),
  staleTime: 30_000,           // consider fresh for 30 seconds
  refetchInterval: 60_000,     // background refresh every 60 seconds
});

// Global client state — authenticated user, persisted across pages
const { user, setUser } = useAuthStore();

// Local component state — whether a modal is open
const [isConfirmOpen, setIsConfirmOpen] = useState(false);

// URL state — current filter applied to the orders list
const [searchParams, setSearchParams] = useSearchParams();
const statusFilter = searchParams.get("status") ?? "all";
// URL: /dashboard?status=in_transit — shareable, survives refresh
```

### TanStack Query — The Correct Approach to Server State

```typescript
// api/orders.ts — pure fetch functions, no state management
export const ordersApi = {
  getActive: (customerId: string) =>
    fetch(`/api/orders?customerId=${customerId}&status=active`)
      .then(r => r.json()) as Promise<Order[]>,

  place: (request: PlaceOrderRequest) =>
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }).then(r => r.json()) as Promise<PlaceOrderResponse>,

  cancel: (orderId: string, reason: string) =>
    fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }).then(r => r.json()),
};

// hooks/useOrders.ts — query hooks
export function useActiveOrders(customerId: string) {
  return useQuery({
    queryKey: ["orders", "active", customerId],
    queryFn: () => ordersApi.getActive(customerId),
    staleTime: 30_000,
    // Automatic background refetch, retry on failure,
    // deduplication of concurrent requests — all free
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.place,
    onSuccess: (newOrder) => {
      // Invalidate and refetch active orders — list is now stale
      queryClient.invalidateQueries({ queryKey: ["orders", "active"] });

      // Optimistic update — add the new order to the cache immediately
      queryClient.setQueryData(
        ["orders", newOrder.id],
        newOrder
      );
    },
    onError: (error) => {
      // Handle error at the query layer — not the component layer
      toast.error(getErrorMessage(error));
    },
  });
}

// Component — clean, focused on rendering
function OrderList({ customerId }: { customerId: string }) {
  const { data: orders, isLoading, error } = useActiveOrders(customerId);
  const { mutate: placeOrder, isPending } = usePlaceOrder();

  if (isLoading) return <OrderListSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!orders?.length) return <EmptyState />;

  return (
    <ul className="order-list">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  );
}
```

---

## Part 4: UX Principles — Designing for Humans

### The Foundational Laws

These are not opinions. They are empirically validated patterns of human cognition that directly affect how your users experience your interfaces.

**Hick's Law:** the time to make a decision increases logarithmically with the number of options. Every option you add to a screen increases cognitive load. The discipline: show only what is needed for the current decision. Progressive disclosure — reveal complexity only when the user asks for it.

```
Orcta Go customer home screen:
WRONG: all past orders, active orders, payment methods, settings,
       notifications, rider ratings, receipt downloads — visible at once
CORRECT: active delivery (if one exists) prominently, then recent orders,
         then a clear CTA to request a new delivery
```

**Fitts's Law:** the time to reach a target is a function of its size and distance. Large touch targets that are close to where the thumb naturally rests are easier to hit. Small targets in the corners of the screen are hard to hit.

```css
/* Minimum touch target size — WCAG 2.1 recommendation */
.touch-target {
  min-height: 44px; /* iOS HIG minimum */
  min-width: 44px;
  /* If the visible element is smaller, extend the touch area */
  padding: var(--space-3);
}

/* Thumb zone on mobile — bottom centre is easiest to reach */
/* Primary actions belong in the bottom navigation or floating action button */
/* Secondary actions can be in the top right */
/* Destructive actions should require deliberate effort to reach */
```

**Jakob's Law:** users spend most of their time on other apps. They expect your app to work like the apps they already know. Novelty in UI patterns is almost always a net negative. Save creative energy for your product concept, not your UI conventions.

```
Use platform conventions:
  Pull-to-refresh for list updates
  Swipe to go back on iOS
  Bottom navigation for primary sections (mobile)
  Top navigation bar for web
  Long press for contextual actions
  Shake to undo (iOS)

These work because users already know them.
Building custom versions of these costs the user learning time
and you debugging time.
```

**The Peak-End Rule:** people judge an experience primarily by how they felt at its most intense moment (peak) and at its end — not by the average of all moments. The implication: obsess over the moments that matter most.

```
For Orcta Go:
  Peak moments: the moment the rider is assigned (anxiety relief),
                the moment the package is picked up (excitement),
                the moment delivery is confirmed (satisfaction)
  End moment: the receipt and rating screen

These moments deserve disproportionate design attention.
The confirmation animation, the "Rider is 2 minutes away" notification,
the delivery completion screen — these are not nice-to-haves.
They are the moments that determine whether the user comes back.
```

### Accessibility — Not Optional

Accessibility (a11y) is frequently treated as a compliance checkbox. It is a design philosophy and, practically, it makes your product better for everyone.

The core principle: **design so that users with any combination of vision, hearing, motor, and cognitive abilities can use your product.**

For a delivery platform in Ghana, accessibility has an additional dimension: device diversity. Your users are not on the latest iPhone. They are on budget Android devices with small screens, slow processors, and variable display quality. Accessible design is also design that works on these devices.

```tsx
// Accessible image — always describe what the image conveys
<img
  src="/rider-photo.jpg"
  alt="Kwame Asante, your delivery rider"
  // Never: alt="" for informative images
  // alt="" is correct only for purely decorative images
/>

// Accessible icon button — the icon alone is not enough
<button
  aria-label="Cancel delivery"
  title="Cancel delivery"
>
  <XIcon aria-hidden="true" /> {/* hide icon from screen readers — label handles it */}
</button>

// Accessible form field — label connected to input
<div className="form-field">
  <label htmlFor="phone-input" className="form-field__label">
    Phone number
  </label>
  <input
    id="phone-input"
    type="tel"
    inputMode="numeric"     /* numeric keyboard on mobile */
    autoComplete="tel"      /* browser can fill this in */
    pattern="[+][0-9]{10,14}"
    aria-describedby="phone-hint phone-error"
    aria-invalid={hasError}
    aria-required="true"
  />
  <p id="phone-hint" className="form-field__hint">
    Include country code e.g. +233241234567
  </p>
  {hasError && (
    <p id="phone-error" className="form-field__error" role="alert">
      {errorMessage}
    </p>
  )}
</div>

// Accessible loading state
<div aria-live="polite" aria-atomic="true">
  {isLoading ? (
    <p>Finding riders near you...</p>
  ) : (
    <p>Rider assigned: {rider.name}</p>
  )}
</div>
// aria-live="polite": announces changes to screen reader users without interrupting
```

**Focus management — critical for modals and dynamic content:**

```tsx
// When a modal opens, focus must move into it
// When it closes, focus must return to the trigger element
function ConfirmCancelModal({ isOpen, onClose, onConfirm }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Move focus to the modal heading when it opens
      headingRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    // Return focus to the button that opened the modal
    triggerRef.current?.focus();
  };

  return (
    <dialog
      open={isOpen}
      aria-modal="true"
      aria-labelledby="modal-heading"
      onKeyDown={e => e.key === "Escape" && handleClose()}
    >
      <h2 id="modal-heading" ref={headingRef} tabIndex={-1}>
        Cancel your delivery?
      </h2>
      {/* ... */}
    </dialog>
  );
}
```

### Mobile UX — Specific to Orcta Go

The rider app and customer app run on mobile. The constraints are different from web:

```
THUMB REACHABILITY
  Primary actions: bottom of screen, centre — one thumb reaches easily
  Secondary actions: bottom of screen, sides — slight stretch
  Destructive actions: top of screen — requires deliberate reach

GESTURE CONVENTIONS (React Native)
  Swipe left on a list item → reveal delete/action
  Long press → contextual menu
  Pull down → refresh
  Pinch → zoom on maps
  Tap and hold → drag to reorder

NETWORK AWARENESS
  Show cached data immediately, fetch fresh data in background
  Indicate when data is stale (last updated: 2 minutes ago)
  Handle offline gracefully — Orcta Go riders go offline mid-delivery
  Queue actions when offline, execute when connection returns

FEEDBACK AND RESPONSE TIME
  < 100ms: feels instantaneous — button state changes should be here
  100-300ms: feels responsive — navigation transitions should be here
  300-1000ms: noticeable — show loading indicator after 300ms
  > 1000ms: feels slow — show progress, explain what is happening
  > 3000ms: user assumes something is broken — provide escape or retry
```

---

## Part 5: Performance — Speed as a Design Constraint

### Core Web Vitals — The Metrics That Matter

Google's Core Web Vitals are the three metrics that define perceived performance for web users:

```
LCP — Largest Contentful Paint
  What it measures: how long until the main content is visible
  Good: < 2.5 seconds
  Poor: > 4.0 seconds
  Primary cause of failure: slow server response, render-blocking resources,
                            large unoptimised images

FID — First Input Delay (being replaced by INP)
INP — Interaction to Next Paint
  What it measures: how quickly the page responds to user input
  Good: < 200ms
  Poor: > 500ms
  Primary cause of failure: long JavaScript tasks blocking the main thread

CLS — Cumulative Layout Shift
  What it measures: how much the page layout jumps around while loading
  Good: < 0.1
  Poor: > 0.25
  Primary cause of failure: images without dimensions, late-loading fonts,
                            dynamic content inserted above existing content
```

### The Image Problem

Images are the single largest contributor to slow page loads. The correct approach:

```tsx
// WRONG — no optimisation at all
<img src="/delivery-photo.jpg" />

// CORRECT — modern image optimisation
<picture>
  {/* WebP for browsers that support it — 30-50% smaller than JPEG */}
  <source
    srcSet="/delivery-photo-400.webp 400w, /delivery-photo-800.webp 800w"
    type="image/webp"
    sizes="(max-width: 600px) 400px, 800px"
  />
  {/* JPEG fallback */}
  <source
    srcSet="/delivery-photo-400.jpg 400w, /delivery-photo-800.jpg 800w"
    sizes="(max-width: 600px) 400px, 800px"
  />
  <img
    src="/delivery-photo-800.jpg"
    alt="Delivery completed by Kwame"
    width="800"      /* explicit dimensions prevent CLS */
    height="600"
    loading="lazy"   /* defer off-screen images */
    decoding="async" /* do not block main thread during decode */
  />
</picture>

// In React with Next.js or a similar framework
import Image from "next/image"; // handles all of the above automatically
<Image
  src="/delivery-photo.jpg"
  alt="Delivery completed by Kwame"
  width={800}
  height={600}
  priority={false} // lazy by default
/>
```

### JavaScript Performance — Keeping the Main Thread Free

The browser's main thread handles JavaScript execution, style calculation, layout, and paint. When JavaScript runs for a long time, it blocks everything else — including user input. This is what causes the "frozen" feeling.

```typescript
// PROBLEM: large list rendering blocks the main thread
function OrderHistory({ orders }: { orders: Order[] }) {
  // Rendering 500 orders synchronously freezes the UI for 2-3 seconds
  return (
    <ul>
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </ul>
  );
}

// SOLUTION 1: Virtualisation — only render what is visible
import { FixedSizeList } from "react-window";

function OrderHistory({ orders }: { orders: Order[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={orders.length}
      itemSize={120}  // height of each order card in pixels
      width="100%"
    >
      {({ index, style }) => (
        <OrderCard
          key={orders[index].id}
          order={orders[index]}
          style={style}  // react-window controls positioning
        />
      )}
    </FixedSizeList>
  );
  // Only renders ~5-10 visible items regardless of list length
}

// SOLUTION 2: Pagination — load in pages
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["orders", customerId],
  queryFn: ({ pageParam = 0 }) =>
    api.getOrders(customerId, { offset: pageParam, limit: 20 }),
  getNextPageParam: (lastPage, pages) =>
    lastPage.hasMore ? pages.length * 20 : undefined,
});

// SOLUTION 3: Defer non-critical work
// Use scheduler or requestIdleCallback for work that is not user-facing
const processAnalytics = useCallback(() => {
  if ("scheduler" in window) {
    // Chromium scheduler — runs when main thread is free
    scheduler.postTask(() => sendAnalytics(data), { priority: "background" });
  } else {
    requestIdleCallback(() => sendAnalytics(data));
  }
}, [data]);
```

### Code Splitting — Load Only What Is Needed

```typescript
// WRONG — everything in one bundle
import { AdminDashboard } from "./AdminDashboard";
import { CustomerDashboard } from "./CustomerDashboard";
import { RiderApp } from "./RiderApp";
// All three load on every page visit — most code never used

// CORRECT — split by route (React lazy loading)
const AdminDashboard   = lazy(() => import("./AdminDashboard"));
const CustomerDashboard = lazy(() => import("./CustomerDashboard"));
const RiderApp         = lazy(() => import("./RiderApp"));

// React Router with Suspense
function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/*" element={<CustomerDashboard />} />
        <Route path="/rider/*" element={<RiderApp />} />
      </Routes>
    </Suspense>
  );
}
// AdminDashboard bundle only downloads when a user navigates to /admin
// Customers never download the admin code — privacy + performance
```

---

## Part 6: The Orcta Frontend Philosophy — Synthesised

Everything above distilled into the principles that govern every frontend decision at Orcta:

### The Principles

**Use the platform first.** Before reaching for a library, ask what the browser or the operating system already provides. Libraries add weight, dependencies, and maintenance cost. The platform is free, already downloaded, and already trusted.

**Tokens, not values.** Every visual decision traces to a design token. No colour, spacing value, or typography size is hardcoded in a component. Components use semantic tokens. Semantic tokens reference palette tokens. The palette is the only place raw values live.

**Components have levels.** Primitives have no business logic. Compositions have no external data. Features are connected. Pages compose features. Dependencies flow downward only — a Primitive never imports a Feature.

**Server state is not client state.** Data from the API is cached, stale, and async. It is managed by TanStack Query, not useState. Global UI state is managed by Zustand. Component-local state is useState. URL state is in the URL. These are four different problems with four different tools.

**Performance is a design constraint, not an afterthought.** Images have explicit dimensions. JavaScript code splits at route boundaries. Lists virtualise when they exceed 50 items. Animations use transform and opacity only — never properties that trigger layout. Core Web Vitals are measured in CI and regressions block deployment.

**Accessibility is not a phase.** Every interactive element has a keyboard interaction. Every image has an alt attribute that describes what the image conveys. Every form field has a connected label. Focus is managed deliberately when content changes dynamically. The tab order matches the visual order.

**Mobile constraints are design inputs.** Touch targets are minimum 44px. Primary actions are in the thumb zone. Network failures are handled gracefully. Offline states are designed, not assumed away. Loading states are designed for every data-dependent screen.

---

## Part 7: The Technology Decisions — Resolved

```
Web Frontend:
  Framework:        React 18+ with TypeScript
  Routing:          React Router v6 (web) / Expo Router (React Native)
  Server State:     TanStack Query v5
  Global State:     Zustand (simple, no boilerplate)
  Forms:            React Hook Form + Zod (same Zod schemas as backend)
  Styling:          CSS Modules + CSS Custom Properties (design tokens)
                    No CSS-in-JS — it ships runtime overhead for no benefit
                    No Tailwind in Design System components — tokens are enough
                    Tailwind acceptable for page-level layout in apps
  Animation:        CSS transitions for simple interactions
                    Framer Motion for complex, gesture-based animation
  Icons:            Lucide React (consistent, tree-shakeable)
  Tables/Lists:     TanStack Table v8 for complex data tables
                    react-window for virtualised long lists
  Date/Time:        date-fns (tree-shakeable, no prototype mutation)
  HTTP Client:      native fetch + TanStack Query (no axios needed)

Mobile:
  Framework:        React Native with Expo (TypeScript)
  Navigation:       Expo Router (file-based, same mental model as Next.js)
  Maps:             react-native-maps + Google Maps (Orcta Go rider tracking)
  State:            same as web — TanStack Query + Zustand
  Storage:          Expo SecureStore (sensitive data) + MMKV (fast local storage)
  Notifications:    Expo Notifications + FCM

Build and Tooling:
  Web bundler:      Vite (fast, modern, excellent DX)
  Testing:          Vitest (unit) + React Testing Library (component)
                    Playwright (end-to-end)
  Linting:          ESLint with typescript-eslint
  Formatting:       Prettier (non-negotiable, automated)
  CI checks:        Type check + lint + unit tests + Lighthouse CI (Core Web Vitals)
```

**Why CSS Modules over CSS-in-JS:**

CSS-in-JS (Styled Components, Emotion) ships a JavaScript runtime that:
- Increases bundle size by 30-60KB
- Executes JavaScript to generate CSS on every render
- Cannot be extracted to a static CSS file
- Makes SSR more complex

CSS Modules give you locally scoped class names with zero runtime overhead. Combined with CSS custom properties for theming, they achieve everything CSS-in-JS offers at a fraction of the cost. The only thing CSS-in-JS does better is dynamic styles based on props — which is almost always better handled by CSS custom properties or data attributes anyway.

---

## Part 8: The Frontend Code Review Checklist

Added to the existing engineering checklist for all frontend PRs:

```
TOKENS AND DESIGN SYSTEM
□ No hardcoded colour values — all colours from --color-* tokens
□ No hardcoded spacing values — all spacing from --space-* tokens
□ No hardcoded font sizes — all typography from --font-size-* tokens
□ New components identified at correct level (Primitive/Composition/Feature/Page)
□ No Primitive imports a Feature or Page

ACCESSIBILITY
□ All images have descriptive alt attributes (or alt="" if decorative)
□ All interactive elements are keyboard accessible
□ All form fields have connected labels (htmlFor / id)
□ Focus management handled for modals, drawers, dynamic content
□ Error messages use role="alert" or aria-live for screen reader announcement
□ Touch targets minimum 44x44px on mobile

PERFORMANCE
□ Images have explicit width and height attributes (prevents CLS)
□ Images use loading="lazy" for below-fold content
□ New routes are code-split with React.lazy
□ Lists over 50 items use virtualisation
□ Animations use only transform and opacity (no layout-triggering properties)
□ No new synchronous expensive operations on the main thread

STATE MANAGEMENT
□ Server data managed by TanStack Query — not useState + useEffect
□ Global UI state in Zustand — not prop drilling through 3+ levels
□ URL state in search params for filterable/shareable views
□ Loading, error, and empty states all handled — never just the happy path

SECURITY
□ No sensitive data rendered into the DOM (tokens, keys, PII)
□ User-generated content rendered as text, not HTML (no dangerouslySetInnerHTML without sanitisation)
□ External links use rel="noopener noreferrer"
□ Forms have CSRF protection where applicable
```
