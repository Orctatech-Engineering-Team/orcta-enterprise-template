# Engineering Handbook

Software Design & Architecture for the African Engineering Context

*Second Edition — Including A Philosophy of Software Design*

OOP • Clean Code • Domain-Driven Design • Clean Architecture • A Philosophy of Software Design • Performance-Aware Programming • Data-Oriented Design • TypeScript • African Startup Context

## Chapter 1: The Engineering Philosophy

### The Governing Principle

"The architecture of a system should reflect the shape of its problem, not the preferences of its paradigm."

Every paradigm in this handbook is a lens, not a law. A skilled engineer picks up each lens, examines the problem
through it, takes what is useful, and puts it down. The result is never a pure anything. It is a system whose
structure honestly reflects what it needs to do.

This handbook synthesizes six bodies of thought. Where they agree, the agreement is stated as a rule. Where they
disagree, the disagreement is documented honestly and a team position is stated explicitly. The goal is judgment
— knowing which tool fits which problem — not compliance with any single authority.

| Source | Author | Primary Contribution |
|---|---|---|
| Clean Code | Robert C. Martin (Uncle Bob) | Names, function discipline, SOLID, TDD |
| A Philosophy of Software Design | John Ousterhout | Complexity theory, module depth, information hiding, strategic programming |
| Domain-Driven Design | Eric Evans | Ubiquitous language, bounded contexts, aggregate design |
| Clean Architecture | Robert C. Martin | Dependency rule, use case layer, ports and adapters |
| Performance-Aware Programming | Casey Muratori | Hardware mental model, cache efficiency, measurement discipline |
| Data-Oriented Design | Mike Acton / Richard Fabian | Data layout, SoA, hot/cold separation |

### Where the Sources Disagree — Our Positions

This handbook does not pretend the sources always agree. They do not. Below is the honest map of where they
conflict and what position this team takes. Each conflict is explained in full in the relevant chapter.

| Topic | Clean Code Says | Ousterhout Says | Team Position |
|---|---|---|---|
| Function length | Rarely exceed 20 lines. Extract aggressively. | Length is the wrong metric. Optimize for abstraction quality. | Ousterhout wins. Break at logical seams, not line thresholds. |
| Class size | Small classes. Single responsibility = single method. | Classitis is a disease. Deep classes are better than many shallow ones. | Ousterhout wins. SRP means one design decision, not one method. |
| Comments | Comments are failures. Good code documents itself. | Interface comments are irreplaceable. Document the why. | Ousterhout wins. Never comment what. Always comment why. |
| Error handling | Use exceptions. Make errors explicit everywhere. | Define errors out of existence where possible. Exception proliferation adds complexity. | Synthesis wins. Result\<T,E\> makes errors typed and visible without try/catch noise. |
| Abstraction | Extract everything. More decomposition is better. | Deep modules over shallow modules. Interface complexity is still complexity. | Ousterhout wins. Abstraction must hide more than it exposes. |
| Names | Names must be intention-revealing. | Names must be intention-revealing. | Both agree. This is a non-negotiable rule. |
| Tests | TDD. Tests are non-negotiable. | Tests are necessary but not the primary design driver. | Both agree tests are required. Neither makes test-passing the end goal. |
| Strategic thinking | Implied but not named explicitly. | Strategic over tactical. Invest upfront. Track debt explicitly. | Ousterhout wins. Named, owned as a team discipline. |

### Non-Negotiable Team Rules

> **TEAM RULE**
> These rules are not suggestions. They are the baseline every engineer on this team operates from. They are
derived from the synthesis of all six sources and represent the team's considered position after reviewing
where each source wins.

1.  The domain never imports from infrastructure. Dependencies point inward, always.
2.  Name everything in the language of the business. Technical jargon in domain code is a bug.
3.  Make illegal states unrepresentable. Use discriminated unions and branded types.
4.  Modules must be deep. Every interface must hide more complexity than it exposes.
5.  Comment the why, never the what. Interface comments are mandatory. Restating the code is

forbidden.

6.  Break functions at logical seams, not line thresholds. Coherence over count.

7.  Strategic programming is the default. Track tactical shortcuts explicitly. Repay them.
8.  Measure before optimizing. Intuition tells you where to look. The profiler tells you what is wrong.
9.  Tests are not optional. Untested domain logic is a liability regardless of how clean it looks.
10.  One language until you have a profiler-proven reason for a second.

## Chapter 2: Complexity — The Root Cause of Everything Hard

> **OUSTERHOUT**
> This chapter is drawn entirely from A Philosophy of Software Design (Ousterhout, 2018). It provides the
theoretical foundation that all other chapters build on. Read it first. Every design decision in this handbook is
ultimately a decision about managing complexity.

"Complexity is anything related to the structure of a software system that makes it hard to understand and
modify."
— John Ousterhout

This is not a vague observation. Ousterhout makes it operational. Complexity has a formula — not to be
computed literally, but to make the concept precise and actionable:

C = Σ (c_p × t_p)

For each module p:
  c_p = the complexity of that module
  t_p = the fraction of time developers spend working in it

Complexity that lives in code nobody touches is irrelevant.
Complexity in the code you touch every day is what destroys teams.

### The Three Symptoms of Complexity
Complexity manifests in exactly three ways. When you feel pain working in a codebase, you are experiencing one
of these:

1. Change Amplification
A simple change requires modifications in many different places. You change a feature flag. You find it is
referenced in 34 files. You update a fee calculation. Three other fee calculations in different services also need
updating because they duplicated the same logic.

Change amplification is the signature of missing abstraction and scattered knowledge. The design has not grouped
related things together. Every change becomes an archaeology project.

2. Cognitive Load
To make a change, a developer must hold a large amount of information in working memory at once. High
cognitive load means the system punishes new engineers and creates knowledge silos. The person who wrote it
navigates it effortlessly. Everyone else is lost.

Cognitive load is not just about individual functions being complex. It is also about the number of things you
must understand simultaneously to change anything. A system with 200 shallow classes where changing one
feature touches 15 of them has high cognitive load even if each individual class is simple.

3. Unknown Unknowns
The most dangerous form. A developer does not know that a piece of information exists or that it is relevant to the
change they are making. They make a change that looks correct. It passes tests. It causes a subtle bug in
production because there was a constraint nobody documented and nobody thought to check.

> **KEY INSIGHT**
> Unknown unknowns are why documentation and interface comments are not optional. Code can show what it
does. Only comments can show what you must know to use it safely.

### The Two Root Causes

Dependencies
A dependency exists when a piece of code cannot be understood or modified in isolation. Dependencies are
necessary — you cannot write software without them. The goal is to manage them deliberately, not to eliminate
them. Every unnecessary dependency amplifies all three symptoms of complexity.

The Dependency Rule in Clean Architecture is, at its core, a specific strategy for managing dependencies at the
architectural level. The entire architecture is designed to minimize the dependencies that matter most — the ones
between business logic and infrastructure.

Obscurity
Obscurity occurs when important information is not obvious from the code. A parameter named `time` that could
be milliseconds, seconds, or a Unix timestamp. A function with a critical side effect that nothing in its signature
hints at. A configuration value that must be set in three places simultaneously or the system silently misbehaves.

Good naming reduces obscurity. Good comments reduce obscurity. Good interface design reduces obscurity. All
three are required because they address different kinds of hidden information.

Tactical vs Strategic Programming

> **WHERE OUSTERHOUT WINS**
> This is Ousterhout's most important contribution for a startup engineering team. The pressure toward tactical
programming is constant. The consequences are predictable and severe. This team names the pattern
explicitly and treats it as a discipline, not a nice-to-have.

| Tactical Programming | Strategic Programming |
|---|---|
| Write code to make the current feature work. Find the fastest path to passing tests. Add a special case when something is complex. Add a flag when something is hard. Ship it. Move on. Each shortcut is small. The accumulation is catastrophic. | Invest time upfront to find the right design. Do not just make it work — make it clean. When you see a design problem, address it now, not later. Ask: what is the best way to structure this? Not just a way that works. |

Ousterhout's estimate from his own large systems: 10–15% more time invested upfront in getting the design right.
Return on that investment: systems that remain easy to modify for years. The teams that skip this investment do
not ship faster — they ship faster for the first three months and then slow down as complexity compounds.

### The Startup Objection
The most common pushback: we cannot afford strategic programming, we are a startup under runway pressure.

"This reasoning is self-defeating. The systems that consumed the most engineering time are precisely the ones
where tactical decisions accumulated. Teams that invested strategically shipped faster at month six, not
slower."
— Ousterhout (paraphrased)

The team position: tactical shortcuts are sometimes justified — when getting to market first is a genuine survival
constraint. When you take a tactical shortcut, you must:

1.  Name it explicitly. Do not rationalize it as good design.
2.  Record it in your issue tracker as technical debt with a specific description.
3.  Set a deadline for addressing it — not 'someday', a real sprint.
4.  Never let the same shortcut compound. First occurrence is tactical. Second occurrence is a decision to

carry the debt permanently.

## Chapter 3: Deep Modules — The Most Important Design Property

> **OUSTERHOUT**
> This chapter presents Ousterhout's most original contribution and his most direct challenge to conventional
Clean Code advice. Read it alongside Chapter 4 (Clean Code) to understand the full tension and the
synthesis.

### The Module Depth Framework
Think of every module — every class, function, or service — as a rectangle. The width is its interface: the
complexity it exposes to callers. The depth is its functionality: what it actually does internally.

```
┌──────────────────────────────────────────┐  ← WIDE interface (expensive to learn)
│            SHALLOW MODULE                │  Small functionality
└──────────────────────────────────────────┘
  Cost to learn interface ≈ Cost to implement yourself
  Net value provided: very low

┌────────────────┐  ← NARROW interface (cheap to learn)
│                │
│                │
│  DEEP MODULE   │  Large, complex functionality hidden behind simple surface
│                │
│                │
└────────────────┘
  Cost to learn interface << Cost to implement yourself
  Net value provided: high
```

"The best modules are deep: they have simple interfaces but provide substantial functionality behind those
interfaces."
— John Ousterhout

The Unix file I/O system is the canonical example of a deep module. The entire interface is five functions: open,
read, write, close, lseek. Behind those five functions: buffering, caching, permissions, file system abstraction,
device drivers, dozens of edge cases. The depth is enormous. The interface is minimal. A programmer can use the
entire file system knowing almost nothing about its implementation.

### Shallow Modules — The Clean Code Problem

> **WARNING**
> Shallow modules are the direct result of applying 'extract everything into small functions' mechanically and

without judgment. They add interface complexity without adding comprehension value. This is what
Ousterhout calls classitis.

```typescript
// The result of mechanical extraction — classitis
class TextFormatter {
  trimWhitespace(text: string): string { return text.trim(); }
}
class NumberValidator {
  isPositive(n: number): boolean { return n > 0; }
}
class StringConcatenator {
  join(a: string, b: string): string { return a + b; }
}

// These classes provide zero abstraction.
// The interface complexity (three class names, three method names)
// exceeds the implementation complexity.
// A developer must now know: TextFormatter, NumberValidator,
// StringConcatenator — to do things that need no class at all.

// Every layer of indirection that adds no depth is pure cost.
```

### Deep Module Examples in Our Codebase

#### The Order Aggregate — Deep by Design
The Order aggregate is a deep module. Its interface exposes: request(), confirm(), assignRider(), markPickedUp(),
markDelivered(), cancel(). Behind those six methods: the entire state machine, all transition guards, all invariant
checks, all domain event emission, all validation logic. A use case can place and complete a delivery knowing
only the six method names.

```typescript
// Narrow interface — six methods
const order = Order.request({ customerId, pickup, dropoff, packageDescription });
order.confirm({ fee, paymentMethod });
order.assignRider(riderId);
order.markPickedUp(riderId);
order.markDelivered(riderId, proof);

// Behind these five calls:
// - State machine enforcement (9 states, 20+ valid transitions)
// - Invariant checking (cannot assign rider to unconfirmed order, etc.)
// - Domain event emission (5 different event types)
// - Rider identity verification (only assigned rider can confirm pickup)
// - Cancellation rules (customer cannot cancel after pickup)
// All hidden. None of it bleeds into the caller.
```

#### The Result\<T,E\> Type — A Deep Interface
Result\<T,E\> has a minimal interface: ok, value, error. Behind it: the entire error-handling philosophy of the
system. Callers get type-safe error handling without try/catch noise, without remembering which functions throw
and which return null, without runtime surprises. Deep.

#### OrderReadQueries — Also Deep, Different Kind
The read query class exposes: getActiveOrdersForCustomer(), getOrderDetail(),
getConfirmedOrdersNearLocation(). Behind each method: the specific SQL, the correct index, the exact column
projections, the pagination logic. Callers know nothing about SQL, indexes, or database schema. They ask for
what they want. The module handles how.

#### The Pass-Through Anti-Pattern

> **WARNING**
> A pass-through method or class provides no new abstraction. It exists for organizational reasons, not design
reasons. It adds interface complexity without adding depth. When you find one, either give it real
responsibility or delete it.

```typescript
// Pass-through — zero value added, pure interface cost
class OrderService {
  constructor(private repo: OrderRepository) {}

  async getOrder(id: OrderId): Promise<Order | null> {
    return this.repo.findById(id); // just forwarding — no transformation, no logic
  }
}

// The question to ask: what does OrderService know that callers
// should not have to know? If the answer is nothing — delete it.
// Let callers use OrderRepository directly.

// When a Service class IS justified:
class OrderService {
  async placeAndNotify(request: PlaceOrderRequest): Promise<Result<PlaceOrderResponse>> {
    const result = await this.placeOrderUseCase.execute(request); // orchestration
    if (result.ok) await this.notificationService.sendConfirmation(result.value); // added behavior
    return result;
  }
  // This adds real depth: it knows that placing an order requires notification.
  // Callers do not need to know that.
}
```

### General-Purpose Interfaces Over Special-Purpose
When designing an interface, the temptation is to tailor it exactly to the current caller's needs. Every method is
specifically shaped for what is needed right now. The result is a collection of special-purpose methods that only
work for their original purpose.

Ousterhout's counterintuitive finding: a slightly more general-purpose interface is almost always simpler and more
powerful than a collection of special-purpose methods.

```typescript
// Special-purpose — each method exists for one specific caller need
class TextEditor {
  deleteSelectedText(): void { ... }      // for Delete key
  backspaceFromCursor(): void { ... }     // for Backspace key
  deleteWordForward(): void { ... }       // for Ctrl+Delete

  deleteWordBackward(): void { ... }      // for Ctrl+Backspace
  // Every new gesture requires a new method. Interface grows unboundedly.
}

// General-purpose — two operations, all gestures compose from them
class TextEditor {
  insert(position: Position, text: string): void { ... }
  delete(start: Position, end: Position): void { ... }
  // Backspace: delete(cursor.prev, cursor)
  // Delete key: delete(cursor, cursor.next)
  // Paste: insert(cursor, clipboard.text)
  // Undo: store inverse operations
  // The interface is smaller. The capability is larger. Deeper.
}
```

The key question when designing an interface:

> **KEY INSIGHT**
> What is the simplest interface that will cover all the needs I can anticipate? Not: what does the current caller
need right now?

## Chapter 4: Clean Code — Writing for the Human Reader

This chapter covers Robert C. Martin's Clean Code principles. Where Ousterhout's analysis has led us to update or
qualify a principle, the update is clearly marked. Where both sources agree, no qualification is needed.

### Names — Full Agreement

> **SYNTHESIS — TEAM POSITION**
> Both sources agree completely on naming. This is the one area where there is no tension. Good names are the
single highest-leverage improvement available to any codebase at zero cost.

```typescript
// Bad: what is d? days? distance? dollars?
const d = 14;
const getThem = () => data.filter(x => x[0] === 4);
async function processRecord(id: string, t: string, v: number) {}

// Good: intent is unmistakable, no comment needed
const daysSinceLastDeployment = 14;
const getFlaggedDeliveries = () => deliveries.filter(d => d.isFlagged());
async function renewPolicy(policyId: PolicyId, term: RenewalTerm): Promise<Result<void>>
{}
```

•  Classes are nouns: Customer, Order, PaymentGateway, RiderSelectionService
•  Methods are verbs: placeOrder(), calculateFee(), isEligible(), canBeAssigned()
•  Booleans read as questions: isActive(), hasExpired(), canBeAssigned()
•  If you need a comment to explain a name, the name is wrong
•  Avoid abbreviations — daysSinceDeployment not dsd, not daySinceDepl
•  Error codes in SCREAMING_SNAKE_CASE: ORDER_INVALID_STATE, PAYMENT_FAILED

### Functions — Synthesis Position

> **SYNTHESIS — TEAM POSITION**
> Clean Code says: functions should rarely exceed 20 lines. Ousterhout says: function length is the wrong
metric entirely. After review, Ousterhout wins on the principle, but Clean Code's instinct toward small
functions catches a real failure. The synthesis is the team rule.

Uncle Bob's instinct is sound: most functions that are too long are doing more than one thing. The problem is that
'too long' is not defined by line count. It is defined by coherence.

The team rule:

> **TEAM RULE**
> Break a function when it is doing two logically distinct things — when you can identify two separate levels
of abstraction within it, or two separate responsibilities. Do not break it because it crossed a line threshold. A
40-line function that is perfectly coherent and provides a genuine deep abstraction stays at 40 lines.

```typescript
// This 35-line function is coherent. It does one thing: calculate a fare.
// Breaking it into smaller pieces would not reveal structure — it would obscure it.
function calculateDeliveryFare(
  distanceKm: number,
  vehicleType: VehicleType,
  timeOfDay: TimeOfDay,
  currency: Currency,
): Money {
  const base = BASE_RATES[currency][vehicleType];
  const perKm = PER_KM_RATES[currency][vehicleType];
  const surge = getSurgeFactor(timeOfDay);
  const zoneMultiplier = getZoneMultiplier(distanceKm);

  // Tiered distance: first 3km at full rate, remainder at 80%
  const tier1 = Math.min(distanceKm, 3) * perKm;
  const tier2 = Math.max(0, distanceKm - 3) * perKm * 0.8;
  const distanceFee = tier1 + tier2;

  const rawFee = base + distanceFee;
  const surgedFee = Math.ceil(rawFee * surge * zoneMultiplier);
  const finalFee = Math.max(surgedFee, MINIMUM_FEES[currency]);

  return { amountInMinorUnits: finalFee, currency };
  // This is one coherent computation. 30 lines. Correct to keep together.
}
```

```typescript
// This function SHOULD be broken — it crosses two abstraction levels:
async function handleDeliveryRequest(request: HttpRequest) {
  // HTTP parsing (low level) mixed with business logic (high level) — wrong
  const body = JSON.parse(request.body);
  if (!body.customerId) return { status: 400, error: "missing customerId" };
  const customer = await db.query(`SELECT * FROM customers WHERE id = $1`, [body.customerId]);
  if (!customer) return { status: 404 };
  // ... more business logic ...
  // Break this: parseRequest() + validateRequest() + executeUseCase() are distinct levels
}
```

### Comments — Ousterhout Wins

**WHERE OUSTERHOUT WINS**

Clean Code says: comments are failures. Good code documents itself. After review, this is wrong in an important and specific way. Ousterhout's position is adopted. The team rule below replaces Uncle Bob's guidance.

Uncle Bob is right about one kind of comment. Ousterhout is right about another. The distinction is precise:

| | |
|---|---|
| **NEVER WRITE** — Clean Code is right | **ALWAYS WRITE** — Ousterhout is right |
| Comments that describe what the code does. If the code is clear, the comment adds noise and will eventually lie when the code changes but the comment does not. | Comments that describe what the code cannot show: why this design, what constraints apply, what the caller must know, what will break if you change this, and why this specific value. |

```typescript
// WRONG — describes what, code already shows this
// increment counter
counter++;

// WRONG — restates the function signature
// Returns the order with the given ID, or null if not found
async function findOrderById(id: OrderId): Promise<Order | null>

// RIGHT — describes why, code cannot show this
// Using random timeout between 150-300ms to prevent split votes
// during leader election (Raft §5.2). Values below 150ms risk
// false timeouts during normal heartbeat under load.
const electionTimeout = 150 + Math.random() * 150;

// RIGHT — interface comment: what caller must know
/**
 * Calculates delivery fee for a route.
 *
 * IMPORTANT: distanceKm must be road distance, not straight-line.
 * Straight-line underestimates by 20-40% in urban areas.
 * Passing straight-line distance will underprice deliveries.
 *
 * Returns null for routes exceeding 50km — caller must handle this.
 */
function calculateDeliveryFee(distanceKm: number, currency: Currency): Money | null
```

> **TEAM RULE**
> Interface comments are mandatory for every public domain method, repository interface, and use case. They
describe: what the function does, preconditions the caller must satisfy, and anything that will break if used
incorrectly. This is not optional documentation — it is part of the interface design.

### The SOLID Principles — Reinterpreted Through Depth
The SOLID principles remain valid. Ousterhout's depth framework clarifies what they mean in practice —
particularly SRP, which is the most frequently misapplied.

### SRP — Reinterpreted

> **SYNTHESIS — TEAM POSITION**
> Single Responsibility does NOT mean one method per class. It means one design decision per class — one
area of knowledge that the class encapsulates. A class with twenty methods that all relate to order pricing has
one responsibility: pricing. That is correct.

```typescript
// Misapplied SRP — one method each, classitis
class OrderValidator { validate(order: Order): void {} }
class OrderPricer   { price(order: Order): Money {} }
class OrderSaver    { save(order: Order): void {} }
class OrderNotifier { notify(order: Order): void {} }
// Four shallow classes. To understand placing an order,
// a developer must read four files. High cognitive load.
```

```typescript
// Correctly applied SRP — one design decision per class
class Order {
  // All methods here relate to ONE design decision:
  // "what makes a valid order and what transitions are allowed?"
  place(): Result<void> {}
  confirm(fee: Money, method: PaymentMethod): Result<void> {}
  cancel(reason: CancellationReason): Result<void> {}
  isActive(): boolean {}
  canBeAssigned(): boolean {}
  // This class has one responsibility: the order lifecycle.
  // It has many methods. Both are correct.
}
```

### Error Handling — The Result\<T,E\> Synthesis

> **SYNTHESIS — TEAM POSITION**
> Uncle Bob says: use exceptions, make errors visible. Ousterhout says: define errors out of existence where
possible, exception proliferation is complexity. Result<T,E> resolves the tension: errors are typed and visible
in the signature, with no try/catch noise.

#### Define Errors Out of Existence First
Before adding error handling to an interface, ask: can the interface be redesigned so this error cannot occur?
Ousterhout's principle applied to our codebase:

```typescript
// Interface that creates errors
function deleteTracking(start: number, end: number): void {
  if (start < 0) throw new Error("start must be non-negative");
  if (end > events.length) throw new Error("end out of bounds");
  // Callers must handle two error cases.
}

// Interface that defines them out of existence
function deleteTracking(start: number, end: number): void {
  const s = Math.max(0, start);
  const e = Math.min(events.length, end);
  if (s >= e) return; // no-op — nothing to delete
  events.splice(s, e - s);
  // No errors possible. Contract: delete whatever of [start,end] falls within range.
}

// When errors genuinely must exist — use Result<T,E>
function assignRider(orderId: OrderId, riderId: RiderId): Result<void> {
  // Error is in the return type — visible, typed, cannot be ignored
  // No try/catch. No exception. A typed value.
}
```

## Chapter 5: Information Hiding — The Design Technique

> **OUSTERHOUT**
> Information hiding is Ousterhout's most important practical technique. It is the mechanism by which deep
modules are built and maintained. Every design decision in our codebase should be evaluated through this
lens.

"Each module should encapsulate a few design decisions — especially decisions that are likely to change.
Hide them inside the module. Other modules depend on behavior, not on implementation decisions."
— John Ousterhout

### What Information Hiding Means
Every module encapsulates a design decision — a choice about how something is implemented that other
modules should not need to know about. If that decision changes, only the module that owns it changes.
Everything else is unaffected.

The decisions most worth hiding are the ones most likely to change:

•  How data is stored (in-memory map today, Postgres tomorrow)
•  How external services are called (Paystack today, Flutterwave tomorrow)
•  How business rules are calculated (pricing formula today, ML model tomorrow)
•  How data is serialized (JSON today, protobuf tomorrow)

### Information Leakage — What to Avoid
Information leakage occurs when a design decision appears in multiple places. If the same decision is visible in
two modules, changing it requires changing both. This is change amplification — the first symptom of
complexity.

```typescript
// Information leakage — the Map implementation escapes into the interface
class RiderCache {
  riders: Map<string, Rider>; // public — callers now depend on Map
}
// Every caller does: cache.riders.get(id), cache.riders.set(id, rider)
// Change internal storage to Redis: every caller must change.

// Information hiding — the storage decision is encapsulated
class RiderCache {
  private riders: Map<string, Rider>; // private — implementation detail

  get(id: RiderId): Rider | null { return this.riders.get(id) ?? null; }
  set(id: RiderId, rider: Rider): void { this.riders.set(id, rider); }
  // Change to Redis: update this class only. Zero callers change.
}
```

### Temporal Decomposition — A Common Mistake
Temporal decomposition is structuring code around the sequence of operations rather than around what
knowledge belongs together. The result is a design that mirrors the order of execution — which is an
implementation detail, not a design principle.

```typescript
// Temporal decomposition — structured around when things happen
// The sequence validate → price → charge → save → notify
// is encoded into the class structure itself
class OrderValidator { ... }   // step 1
class OrderPricer    { ... }   // step 2
class PaymentCharger { ... }   // step 3
class OrderPersister { ... }   // step 4
class OrderNotifier  { ... }   // step 5

// If the sequence changes (price before validate? notify before save?)
// — the class structure itself must change.

// Information hiding — structured around what knowledge belongs together
class Order          { ... }  // knows: what constitutes a valid order
class PricingService { ... }  // knows: how to calculate delivery fees
class PaymentGateway { ... }  // knows: how to charge a payment method
class OrderRepository{ ... }  // knows: how to persist order state
// The sequence is in the use case — not baked into the class design.
// Changing the sequence: update one use case. No class structure changes.
```

### Information Hiding Applied to Our Architecture

#### The Domain Layer
The Order aggregate hides: the state machine definition, all transition logic, all invariant checks, all event
emission rules. Callers see six methods. They know nothing about the 9 states, 20 transitions, or 5 event types
behind them. This is correct deep module design.

#### The Repository Interface
OrderRepository hides: SQL, connection pooling, ORM mapping, retry logic, connection string. Callers see:
findById, save, findActiveByCustomer. This is the architectural expression of information hiding — the domain
defines what it needs, infrastructure provides it, and the interface between them hides every implementation
decision.

### The Composition Root
Container.ts hides: which concrete implementation is used for every interface. Callers (use cases) receive
interfaces. They have zero knowledge of which concrete class satisfies them. This is why the test suite can
substitute InMemoryOrderRepository for PostgresOrderRepository with a single line change.

#### The Design Question for Every Interface

> **KEY INSIGHT**
> Before finalizing any interface: what design decisions does this interface hide? What would change if those
decisions changed? If the answer is 'not much' — the interface is not deep enough and is not hiding the right
things.

Applied to code review: when reviewing a new interface, ask:

1.  What design decisions does this module own?
2.  Are those decisions visible to callers? If yes — they are leaking.
3.  If the most likely implementation change occurred, how many files would change? The answer should be one.
4.  Does the interface expose more complexity than it hides? If yes — it is shallow. Give it more depth or merge it into a deeper module.

## Chapter 6: Domain-Driven Design — Modeling Business Reality

> **SYNTHESIS — TEAM POSITION**
> DDD and Ousterhout's depth framework are deeply compatible. The Aggregate is a deep module: a narrow
interface hiding a complex state machine. The Bounded Context is information hiding at the architectural
level: each context hides its design decisions from the others.

"The biggest source of complexity in software is not technical — it is the failure to deeply understand and
model the business problem."
— Eric Evans

### The Core Thesis
DDD says: before you think about databases, frameworks, or architecture — understand the domain. Let that
understanding drive every design decision. The code should speak the language of the business so clearly that a
domain expert can read it.

Through Ousterhout's lens: the domain model is the deepest module in the system. It hides the most important
design decisions — the business rules — behind the simplest possible interface: the ubiquitous language.

### Ubiquitous Language — Full Agreement Across All Sources

> **SYNTHESIS — TEAM POSITION**
> Every source agrees on this. Use the business language everywhere: in conversations, requirements, code,
class names, method names, database columns. One language, shared by everyone. This is not a style
preference — it is the primary mechanism for reducing the cognitive load of the codebase.

```typescript
// Without ubiquitous language — developer language
async function processRecord(id: string, type: string, val: number) {}
const updateEntityState = async (id) => { ... }

// With ubiquitous language — business language
async function renewPolicy(policyId: PolicyId, term: RenewalTerm): Promise<Result<void>> {}
const assignRiderToDelivery = async (orderId: OrderId, riderId: RiderId) => { ... }

// In our delivery system:
// assignRider()             NOT: updateOrderRiderField()
// markDelivered()           NOT: setStatusToComplete()
// collectCashOnDelivery()   NOT: processCodTransaction()
```

### Bounded Contexts — Information Hiding at Architectural Scale
A Bounded Context is explicit information hiding at the largest scale. Each context owns its model, hides its
implementation decisions from other contexts, and communicates through well-defined interfaces (events, APIs).

The 'Customer' in the Sales context is a prospect. In Billing, it is an account. In Support, it is a ticket-raiser. These
are legitimately different design decisions. Forcing one unified Customer model means every decision is visible to
every context — the opposite of information hiding.

| Context | Owns | What It Hides From Others |
|---|---|---|
| Order | Delivery lifecycle, pricing | State machine, fee calculation, cancellation rules |
| Dispatch | Rider assignment, availability | Scoring algorithm, proximity calculation, retry logic |
| Tracking | Location events, proof of delivery | Event schema, deduplication logic, batch processing |
| Payment | Money flow, rider payouts | Gateway selection, commission calculation, reconciliation |

### Aggregates — Deep Modules by Definition
The Aggregate is the most natural expression of a deep module in DDD. A narrow interface (the root's public
methods) hides a complex cluster of entities, value objects, state transitions, and invariant enforcement.

> **KEY INSIGHT**
> Every Aggregate Root is a deep module. Design it as such. The interface should be the smallest set of
methods that completely expresses what can be done with this concept in the business domain.

```typescript
// Order Aggregate: narrow interface, deep implementation
class Order {
  // Interface: 6 methods
  static request(params): Result<Order>
  confirm(fee, paymentMethod): Result<void>
  assignRider(riderId): Result<void>
  markPickedUp(riderId): Result<void>
  markDelivered(riderId, proof): Result<void>
  cancel(reason, cancelledBy): Result<void>

  // Hidden behind the interface:
  // - 9 status states as a discriminated union
  // - 20+ state transition guards
  // - Rider identity verification on pickup and delivery
  // - Cancellation rules by actor type
  // - Domain event emission for 5 event types
  // - Aggregate reconstitution from persisted state
  // None of this is visible to callers. Deep.
}
```

### Aggregate Size — Ousterhout Refines Evans
Evans says keep aggregates small. Ousterhout's framework adds precision: the right size is whatever is needed to
hide the right design decisions. An aggregate that is too small leaks its internal decision-making to callers — they
must coordinate what the aggregate should coordinate. An aggregate that is too large hides too much in one place
and becomes a god object.

The test: can every public method on the aggregate be understood without knowing about any other method? If a
caller must call methodA before methodB is safe — that dependency should be enforced by the aggregate, not by
caller convention.

### Domain Events — Decoupled Communication Between Deep Modules

```typescript
// Events decouple bounded contexts:
// Order publishes: DeliveryConfirmed
// Dispatch reacts: assigns a rider — without Order knowing Dispatch exists
// Payment reacts: initiates charge — without Order knowing Payment exists
// Notifications reacts: sends SMS — without Order knowing Notifications exist

// Each bounded context remains a self-contained deep module.
// The event schema is the interface between them.
// Change Order's internal model: zero other contexts change.
// Change the event schema: all consumers must update — so version it.

type DeliveryConfirmed = {
  readonly type: "DeliveryConfirmed";
  readonly version: 1;               // schema version — allows consumers to migrate
  readonly orderId: OrderId;
  readonly confirmedFee: Money;
  readonly paymentMethod: PaymentMethod;
  readonly occurredAt: Date;
};
```

## Chapter 7: Clean Architecture — The Structural Enforcement Layer

"The database is a detail. The framework is a detail. The UI is a detail. The business logic is not a detail."
— Robert C. Martin

Clean Architecture is Ousterhout's information hiding principle expressed as a structural rule for the entire
application. The domain hides its design decisions from the framework. Infrastructure hides its implementation
details from the domain. The Dependency Rule is the mechanism that enforces this hiding.

The Dependency Rule

> **TEAM RULE**
> Source code dependencies must point only inward. Nothing in an inner layer can know anything about an
outer layer. The domain defines interfaces. Infrastructure implements them. This rule is enforced by
automated lint checks in CI — architecture without enforcement is aspiration.

```
OUTER (depends on inner, knows about everything inside)
┌─────────────────────────────────────────┐
│  Frameworks & Drivers                   │  Hono, Drizzle, Postgres, Paystack SDK
│  ┌───────────────────────────────────┐  │
│  │  Interface Adapters               │  │  Controllers, Repository implementations
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Application / Use Cases    │  │  │  Orchestration, no business rules
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Domain               │  │  │  │  All business rules. Zero framework imports.
│  │  │  │  (depends on nothing) │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
INNER (depends on nothing outside itself)
```

### Each Layer Is a Deep Module
Viewed through Ousterhout's lens, each architectural layer is a deep module hiding its implementation decisions
from the layer inside it:

| Layer | What It Hides | Interface It Exposes |
|---|---|---|
| Domain | Business rules, state machines, invariants | Entity methods, repository interfaces, domain events |
| Application | Workflow orchestration, transaction boundaries | Use case execute() methods with input/output DTOs |
| Interface Adapters | HTTP protocol, DB schema, external API contracts | Controllers call use cases; repositories implement interfaces |
| Infrastructure | Database connection, network, framework lifecycle | Concrete repository implementations, gateway adapters |

### CQRS — Performance Through Separation

> **SYNTHESIS — TEAM POSITION**
> The domain model is a deep module optimized for writes — enforcing invariants, managing state transitions.
It is not optimized for reads. CQRS acknowledges this. Read paths bypass the domain and go directly to
SQL. This is not laziness — it is the correct application of information hiding to the read/write distinction.

```typescript
// Write path: full depth — all business rules enforced
async function placeOrder(request: PlaceOrderRequest): Promise<Result<PlaceOrderResponse>> {
  const order = Order.request(request);    // domain — all invariants checked
  order.applyQuote(fee);                   // domain — state transition
  await orderRepository.save(order);       // infrastructure — persistence
  await eventPublisher.publishAll(events); // infrastructure — events
}

// Read path: maximum performance — no domain objects, direct SQL
async function getActiveOrdersForCustomer(customerId: string) {
  return db.query(                        // direct — no domain model, no mapping
    `SELECT id, status_kind, pickup_address->>'city', dropoff_address->>'city'
     FROM orders
     WHERE customer_id = $1
       AND status_kind NOT IN ('delivered', 'cancelled', 'failed')
     ORDER BY created_at DESC LIMIT 20`,  // uses partial index — fast
    [customerId]
  );
  // Returns flat DTO. Zero domain object construction.
  // 3-5x faster than loading domain objects for a list endpoint.
}
```

### The Composition Root
The composition root is the only place where concrete implementations are assembled. It is the only file that
knows about every concrete class. Every other file receives its dependencies through constructor parameters and
knows only interfaces.

This is information hiding at the dependency level: use cases hide from themselves which database, which
payment gateway, which event bus they are talking to. They know only the interface. The composition root knows
the implementation.

```typescript
// Container.ts — the single wiring point
// This is the only file that imports PostgresOrderRepository, PaystackGateway, etc.
export function createContainer(config: AppConfig): AppContainer {
  const orderRepository = new PostgresOrderRepository(db);   // concrete
  const eventPublisher  = new KafkaEventPublisher(kafka);    // concrete

  const pricingService  = new SimplePricingService(currency);// concrete

  const placeOrder = new PlaceOrderUseCase(
    orderRepository,   // PlaceOrderUseCase sees: OrderRepository interface
    pricingService,    // PlaceOrderUseCase sees: PricingService interface
    eventPublisher,    // PlaceOrderUseCase sees: EventPublisher interface
  );
  // Swap Paystack → Flutterwave: one line. Zero use case changes.
  // Run tests with InMemoryOrderRepository: one line. Zero use case changes.
}
```

## Chapter 8: Performance-Aware Programming — Writing for the Machine

"Most programmers write code with no mental model of what the hardware does with it. Performance-aware
programmers maintain that mental model at all times."
— Casey Muratori

### Why Every Engineer Must Be Performance-Aware
Performance awareness is not a specialist skill. It is baseline literacy — the machine half of the job that CS
education systematically neglects. A programmer without a mental model of how the CPU executes their code is
flying blind on half of what they do.

This is especially true as hardware scaling slows. The free lunch of faster hardware ended around 2005 when
Dennard scaling broke down and clock speeds stalled. We can no longer buy our way out of inefficient code with
next year's hardware.

### The Memory Hierarchy — The Most Important Table

| Level | Latency | CPU Cycles | Practitioner Implication |
|---|---|---|---|
| L1 Cache | ~1 ns | ~3 | Effectively free. Design hot paths for this. |
| L2 Cache | ~4 ns | ~12 | Fast. Acceptable for warm paths. |
| L3 Cache | ~40 ns | ~120 | Noticeable at high frequency. |
| Main RAM | ~100 ns | ~300 | Expensive. Every cache miss is a budget item. |
| SSD | ~100 µs | ~300,000 | I/O boundary. Batch and minimize. |
| Network | ~500 µs | ~1,500,000 | The real bottleneck for most web services. |

> **KEY INSIGHT**
> A cache miss to RAM costs 300 CPU cycles. A database query costs 300,000+ cycles. These ratios tell you
where optimization is worth the effort. In a web service, the bottleneck is almost always network and DB —
not CPU. Optimize at the right level.

### The Cache Problem with OOP
OOP bundles all fields of an object together. When you iterate 10,000 objects to update one field, the CPU loads
every field into cache — including the ones you never touch. Most of every cache line loaded is wasted. This is
the data layout problem.

```typescript
// Array of Structures (AoS) — OOP default
// Physics update: iterate all entities to update position and velocity
class Entity {
  position: Vector3;  // 12 bytes — needed
  velocity: Vector3;  // 12 bytes — needed
  health: number;     //  4 bytes — NOT needed, but loaded into cache anyway
  texture: Texture;   //  8 bytes — NOT needed, but loaded into cache anyway
  aiState: AIState;   // 40 bytes — NOT needed, but loaded into cache anyway
  // Per entity: 76 bytes loaded, 24 bytes used = 68% waste
}

// Structure of Arrays (SoA) — Data-Oriented approach
// Physics update loads ONLY positions and velocities
positions:  Float32Array  // 12 bytes × N — 100% utilized in physics pass
velocities: Float32Array  // 12 bytes × N — 100% utilized in physics pass
// health, texture, aiState in separate arrays — untouched during physics
// Result: 4-10x throughput improvement. Same algorithm. Different layout.
```

| Context | Right Approach | Bottleneck |
|---|---|---|
| HTTP request handlers | Clean Architecture + DDD | Network latency — not CPU |
| Business logic, use cases | Clean Code + domain model | Correctness and maintainability |
| Database query layer | Direct SQL + indexes | Query shape and index coverage |
| Rider location batch (10k/min) | Batch inserts + append-only table | Write throughput |
| Dispatch geospatial queries | Partial index + bounding box | Index scan performance |
| Real-time simulation / physics | SoA + Data-Oriented Design | Cache efficiency |
| ML inference | Python + GPU kernels | Compute throughput |

### The Five Questions Before Writing Any Hot Path

1.  What is the hot path? Which code runs most frequently? That path deserves the most design attention.
2.  What data does the hot path touch? Is it laid out for sequential access or scattered across heap allocations?
3.  What is the expected data volume? 100 items and 100,000 items require different data structures.
4.  What is the access pattern? Random or sequential? Read-heavy or write-heavy? Append-only?
5.  Where are the I/O boundaries? Network calls, database queries, and disk reads dominate. Count them.

> **TEAM RULE**
> Profile first. Always. Intuition tells you where to look. The profiler tells you what is actually slow. It is
almost never what you expect. Never optimize without a before/after benchmark that proves the
improvement.

### The Performance Decision Tree

Is this code in a hot path (runs >1000x/second or is latency-critical)?
├── NO  → Write for readability and correctness. Done.
└── YES → Profile it first. What is the actual measured bottleneck?
          ├── Network / DB I/O?
          │   → Batch calls. Add correct indexes. Cache hot reads. Reduce payload.
          ├── Memory allocation in loop?
          │   → Object pool. Pre-allocate. Reuse buffers. Avoid GC pressure.
          ├── Cache misses (high IPC, low throughput)?
          │   → Restructure data layout. SoA. Separate hot/cold fields.
          ├── Branch misprediction (>2% rate)?
          │   → Sort data to make branches predictable. Eliminate branches via data.
          └── Wrong algorithm (O(n²) where O(n log n) exists)?
              → Fix the algorithm. Then profile again before anything else.

## Chapter 9: TypeScript Patterns — Our Implementation Language

### Why TypeScript
TypeScript is the primary language for this team. The decision reflects the African startup context: the largest
developer talent pool in our markets, full-stack coherence across backend, frontend, and mobile, first-class
support for every architectural pattern in this handbook, and deep ecosystem support for every African payment
provider.

The type system is an active design tool — not a formality. The patterns in this chapter use it to make entire
classes of bugs impossible at compile time. This is information hiding expressed in the type system: illegal states
are unrepresentable.

### Result\<T,E\> — Typed Error Handling

> **TEAM RULE**
> Never use exceptions for domain logic failures. Exceptions are invisible in type signatures — they are hidden
information leaking through the call stack. Result<T,E> makes failure a typed value in the signature. The
caller cannot ignore it. The error handling is visible at the point of use.

```typescript
type Result<T, E = DomainError> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// The type signature tells you this can fail — no documentation needed
function assignRider(orderId: OrderId, riderId: RiderId): Result<void> {
  if (this._status.kind !== "confirmed")
    return Result.fail(new DomainError("ORDER_INVALID_STATE", "..."));
  this._status = { kind: "assigned", riderId, assignedAt: new Date() };
  return Result.ok(undefined);
}

// Caller is forced by the type system to handle both paths
const result = order.assignRider(orderId, riderId);
if (!result.ok) {
  // TypeScript will not compile if you skip this branch
  return result; // propagate — or handle explicitly
}
// TypeScript knows result.value is void here — the happy path
```

### Discriminated Unions — Unrepresentable Illegal States
Discriminated unions are the TypeScript expression of Ousterhout's principle: the right interface design makes
certain errors impossible. Combined with exhaustive switch, they provide compile-time completeness checking
across the entire codebase.

```typescript
// Bad: optional fields allow illegal combinations
type OrderStatus = {
  kind: string;
  riderId?: string;     // present for assigned, in_transit, delivered — but when exactly?
  deliveredAt?: Date;   // present for delivered — but nothing enforces this
  proof?: ProofOfDelivery; // same problem
};
// A developer must read documentation (or the implementation) to know
// which fields are valid in which state. Hidden information.

// Good: each state carries exactly its required data — nothing more, nothing less
type OrderStatus =
  | { kind: "requested" }
  | { kind: "confirmed";   fee: Money; paymentMethod: PaymentMethod }
  | { kind: "assigned";    riderId: RiderId; assignedAt: Date }
  | { kind: "in_transit";  riderId: RiderId; pickedUpAt: Date }
  | { kind: "delivered";   riderId: RiderId; deliveredAt: Date; proof: ProofOfDelivery }
  | { kind: "cancelled";   reason: CancellationReason; cancelledBy: Actor };

// A delivered order ALWAYS has proof — enforced by the type system.
// riderId is NEVER present on a requested order — physically impossible.
// No documentation needed. The type IS the documentation.
```

### Exhaustive Switch — Compile-Time Completeness

```typescript
function handleStatus(status: OrderStatus): string {
  switch (status.kind) {
    case "requested":   return "Awaiting confirmation";
    case "confirmed":   return `Confirmed: ${formatMoney(status.fee)}`;
    case "assigned":    return `Rider assigned at ${status.assignedAt}`;
    case "in_transit":  return "On the way";
    case "delivered":   return `Delivered at ${status.deliveredAt}`;
    case "cancelled":   return `Cancelled: ${status.reason}`;
    default:
      // Add a new status variant and forget to handle it here:
      // TypeScript error: "Type 'X' is not assignable to type 'never'"
      // The compiler finds every missing case across the entire codebase.
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

### Branded Types — Type-Safe IDs

```typescript
// Without branding: all IDs are strings — wrong ID type is a runtime bug
function assignRider(orderId: string, riderId: string) {}
assignRider(rider.id, order.id); // WRONG ORDER — compiles silently, runtime bug

// With branding: wrong ID type is a compile error
type OrderId = string & { readonly __brand: "Order" };

type RiderId = string & { readonly __brand: "Rider" };

function assignRider(orderId: OrderId, riderId: RiderId) {}
assignRider(rider.id, order.id); // COMPILE ERROR — caught before it ships

// Also: ULID over UUID for all IDs
// ULIDs are lexicographically sortable by creation time
// = sequential index inserts = no B-tree fragmentation = faster queries
```

### Money — Integer Arithmetic Only

> **TEAM RULE**
> Floating-point arithmetic is incorrect for currency. GH₵25.00 is stored as 2500 pesewas. All arithmetic is
integer arithmetic. No rounding errors. No floating-point surprises across thousands of transactions.

```typescript
type Money = {
  readonly amountInMinorUnits: number; // always an integer — pesewas, kobo, cents
  readonly currency: Currency;
};

// Commission calculation: integer throughout
// 20% commission on GH₵25.00:
// 2500 pesewas × 2000 bps / 10000 = 500 pesewas = GH₵5.00
const commission = Math.floor(amount.amountInMinorUnits * commissionBps / 10000);
// Math.floor — always round down (in platform's favour, rider gets remainder)
// No parseFloat. No toFixed. No floating point anywhere near money.
```

### Interface Comments — Mandatory for All Public APIs
Following Ousterhout's guidance, every public domain method, repository interface method, and use case exposes
a documented interface. The comment describes what callers must know — not what the code does.

```typescript
/**
 * Assigns the given rider to this order.
 *
 * PRECONDITIONS:
 * - Order must be in 'confirmed' state (not 'requested', 'assigned', etc.)
 * - riderId must reference an existing, currently-available rider
 *
 * POSTCONDITIONS:
 * - Order transitions to 'assigned' state
 * - DeliveryAssigned domain event is added to pending events
 *
 * RETURNS:
 * - Result.ok(void) on success
 * - Result.fail(ORDER_INVALID_STATE) if order is not in confirmed state
 * - Result.fail(ORDER_RIDER_MISMATCH) if riderId does not match expected (internal check)
 *
 * NOTE: Does not save the order. Caller (use case) is responsible for persistence.
 */
assignRider(riderId: RiderId): Result<void>
```

## Chapter 10: Project Structure & Team Conventions

### Directory Structure
Package by feature (domain concept), never by technical layer. When a new engineer opens the project, they
should see the business: Order, Rider, Dispatch, Payment — not controllers/, services/, repositories/. The structure
communicates the domain.

```
src/
├── domain/                         # Inner ring — ZERO external dependencies
│   ├── order/
│   │   ├── entities/
│   │   │   ├── Order.ts            # Aggregate root — deep module
│   │   │   └── OrderRepository.ts  # Interface (domain defines, infra implements)
│   │   ├── value-objects/
│   │   │   └── OrderLine.ts
│   │   └── events/
│   │       └── OrderEvents.ts      # All events as discriminated union
│   ├── dispatch/
│   │   └── entities/
│   │       ├── Rider.ts
│   │       ├── RiderRepository.ts
│   │       └── RiderSelectionService.ts  # Pure domain service
│   ├── payment/
│   │   └── entities/Payment.ts
│   └── shared/
│       └── value-objects/
│           ├── Result.ts           # Result<T, E> type
│           └── index.ts            # Money, Coordinates, EntityId, Currency
│
├── application/                    # Use Cases — orchestrates domain
│   ├── order/PlaceOrderUseCase.ts
│   ├── dispatch/AssignRiderUseCase.ts
│   ├── tracking/RecordLocationBatchUseCase.ts
│   └── shared/EventPublisher.ts    # Output port interfaces
│
├── infrastructure/                 # Implements domain interfaces
│   ├── persistence/
│   │   ├── schemas/schema.ts       # Drizzle schema + index rationale (documented)
│   │   └── mappers/
│   │       ├── PostgresOrderRepository.ts
│   │       └── OrderReadQueries.ts # CQRS read side — direct SQL
│   └── payment/PaystackGateway.ts
│
├── api/                            # HTTP adapters
│   ├── http/order/OrderController.ts
│   └── middleware/ErrorHandler.ts
│
├── config/
│   ├── Container.ts                # Composition root — the ONLY wiring point
│   └── InMemoryImplementations.ts  # All test doubles in one place
│
└── index.ts                        # Server entry — config + routes only
```

### Code Review Checklist
Every pull request is reviewed against these questions. The checklist is derived from the full synthesis of all six
sources.

Complexity and Depth (Ousterhout)

•  Does every new interface hide more complexity than it exposes?
•  Is there a pass-through class or method that adds no depth? If yes, delete it or give it real responsibility.
•  Are interface comments written for every new public method? Do they describe preconditions, postconditions, and constraints — not what the code does?

•  Has any tactical shortcut been taken? If yes, is it recorded in the issue tracker with a deadline?
•  Does any new decomposition obscure structure rather than reveal it?

Domain Layer (DDD + Clean Code)

•  Does any domain file import from infrastructure, API, or config? (Violation — fix the design)
•  Is every new concept named in the business language?
•  Are new state transitions returning Result<void> and checking current state?
•  Are business rules in the aggregate, not leaking into the use case?
•  Are new illegal states made unrepresentable by the discriminated union?

Application Layer

•  Does the use case contain business logic? (Move it to the domain)
•  Are domain objects loaded via repository interfaces only?
•  Are domain events published after successful save, not before?
•  Do input and output types contain only plain DTOs — no domain objects?

Infrastructure Layer

•  Is every DB query explicitly written? No magic ORM queries that cannot be inspected.
•  Does every new query use the correct index? Is the index documented in schema.ts with rationale?
•  Are read-heavy endpoints using direct SQL, not domain model reconstruction?
•  Is Money always stored and calculated in integer minor units?

Tests

•  Do domain tests run with zero infrastructure — no DB, no HTTP, no network?
•  Are use cases covered by integration tests using InMemory implementations?
•  Do tests assert on behavior (what happened) not implementation (how it happened)?
•  Is there a benchmark for any performance-sensitive change? Does it show improvement?

| Thing | Convention | Example |
|---|---|---|
| Aggregate Root | PascalCase noun | Order, Rider, Payment |
| Value Object | PascalCase noun (type alias) | Money, Coordinates, DeliveryAddress |
| Domain Event | PascalCase, past tense | DeliveryCompleted, PaymentCaptured |
| Use Case | PascalCase + UseCase suffix | PlaceOrderUseCase, AssignRiderUseCase |
| Repository interface | Domain + Repository | OrderRepository, RiderRepository |
| Repository implementation | Technology + Domain + Repository | PostgresOrderRepository |
| HTTP Controller | Domain + Controller | OrderController, TrackingController |
| Error codes | ENTITY_CONDITION in SCREAMING_SNAKE_CASE | ORDER_INVALID_STATE, PAYMENT_FAILED |
| Commands (domain) | Verb phrase, business language | placeOrder(), assignRider(), markDelivered() |
| Queries (domain) | is/has/can + adjective | isActive(), canBeAssigned(), hasExpired() |
| Interface comments | Required on all public APIs | Preconditions, postconditions, constraints |

## Chapter 11: Technology Stack — The Choices and Why

| Dimension | Question | Weight |
|---|---|---|
| Hiring pool | Can we hire for this in our market (Lagos, Accra, Nairobi)? | Highest |
| Type system fit | Can this express our architectural patterns safely? | High |
| Ecosystem | Do our payment providers and libraries support this? | High |
| Performance envelope | Is it fast enough for our actual measured bottlenecks? | Medium |
| Module depth | Does the framework encourage deep modules or shallow ones? | Medium |
| Learning curve | Can a new hire become productive in two weeks? | Medium |

Ecosystem

Performance
envelope

Module depth

Do our payment providers and libraries support
this?

Is it fast enough for our actual measured
bottlenecks?

Does the framework encourage deep modules or
shallow ones?

Medium

Learning curve

Can a new hire become productive in two
weeks?

Medium

| Layer | Technology | Rationale |
|---|---|---|
| Language | TypeScript | Largest pool in Africa, full-stack coherence, discriminated unions, branded types |
| Runtime | Bun | Faster than Node.js, built-in test runner, lower infrastructure cost |
| HTTP Framework | Hono | TypeScript-first, typed routing, measurably faster than Express |
| Query Builder | Drizzle | SQL-first — every query is visible and inspectable. No magic. |
| Database | PostgreSQL | JSONB for discriminated union state, partial indexes, PostGIS available |
| Cache / Queue | Redis + BullMQ | Background jobs: dispatch retry, notifications, payouts |
| Testing | Bun test | Zero config, Jest-compatible API, runs domain tests in milliseconds |
| Mobile | React Native | Same team, same language, same payment SDKs |

Layer

Technology

Rationale

Payments (GH, NG)

Paystack

Best API in region: card, bank transfer,
USSD, mobile money

Payments (broader
Africa)

Flutterwave

Wider market coverage when expanding
beyond GH/NG

Why Drizzle Over Prisma — Depth and Visibility
This is the most common question from engineers joining from a Node.js background. The answer is a direct
application of Ousterhout's information hiding principle — applied in the right direction.

Prisma hides the SQL from you. That sounds like a deep module. But the SQL is not an implementation detail
you want hidden — it is performance-critical information you need to see and control. Hiding it is obscurity in the
bad sense.

Drizzle shows you the SQL. Every query is explicit. You can read it, optimize it, explain it to Postgres, and add
the right index. This is information hiding in the correct direction: Drizzle hides the TypeScript-to-SQL mapping
complexity. It does not hide the query itself.

> **TEAM RULE**
> When you write a query, you should be able to explain exactly what SQL runs and which index it uses. If you
cannot, you do not understand your own performance profile. Drizzle enforces this discipline.

### The Language Consistency Rule

> **TEAM RULE**
> One primary language until you have a profiler-proven, documented reason for a second. The cost of a
second language compounds with team size: documentation, debugging, deployment, hiring, code review,
and onboarding all become harder.

A legitimate reason to introduce a second language:

"Our image compression service is consuming 45% of total CPU budget. Profiled with perf. A Rust
implementation reduces this to 6%. The service boundary is a clean HTTP interface. It deploys independently.
One team member has deep Rust experience."

An illegitimate reason:

"Go seems faster and cleaner for this service."

### When a Second Language Is Justified

•  Performance: specific, profiled, measured hot spot that TypeScript cannot address within budget
•  Ecosystem: capability only exists in another language (ML inference in Python is canonical)
•  In all cases: the interface between services is HTTP/JSON or gRPC. Language is an implementation detail of the service, not the system.

### African Infrastructure Context

#### Mobile-First Users

•  API responses must be minimal — return only what the UI renders. Never over-fetch.
•  Support offline-first patterns. The backend must handle eventual consistency gracefully.
•  Batch endpoints are mandatory for intermittent connectivity — location upload, sync operations.

#### Payment Integration

```typescript
// All providers implement the same interface — information hiding at the adapter level
interface PaymentGateway {
  initiateCharge(params): Promise<Result<ChargeResult>>;
  verifyTransaction(reference: string): Promise<Result<VerifyResult>>;
}

// Provider selection is an infrastructure detail hidden from the domain
const gateway =
  config.market === "GH" || config.market === "NG" ? new PaystackGateway(config.paystack)
  : config.market === "KE" ? new MpesaGateway(config.mpesa)
  : config.market === "UG" ? new MtnMomoGateway(config.mtnMomo)
  : new FlutterwaveGateway(config.flutterwave);
// The domain and application layers are unaware this choice exists.
```

#### Infrastructure Cost Discipline

•  Start on a single server with Docker Compose. Do not start with Kubernetes.
•  Use Railway or Render for managed infrastructure at early stage — avoid AWS complexity before you

need the scale.

•  Document every index decision in schema.ts with rationale. Indexes cost write performance and storage.
•  Redis for hot reads (active order state, rider locations) when Postgres P99 latency exceeds your SLA.

## Chapter 12: Quick Reference — Patterns, Templates, and Decision Guides

| Problem | Pattern | Where |
|---|---|---|
| A thing that can be in N distinct states | Discriminated Union | `domain/*/entities/*.ts` |
| An operation that can fail | `Result<T, E>` | Any domain or application method |
| Two IDs that must not be confused | Branded Types | `domain/shared/value-objects/index.ts` |
| A currency amount | Money (integer minor units) | `domain/shared/value-objects/index.ts` |
| A business rule that must always hold | Aggregate Root method with state guard | `domain/*/entities/*.ts` |
| A module hiding a complex implementation | Deep module with interface comments | Any layer |
| A workflow across multiple entities | Use Case | `application/*/UseCase.ts` |
| A list, dashboard, or map read | Direct SQL + flat DTO (CQRS read side) | `infrastructure/persistence/mappers/*ReadQueries.ts` |
| An external service (DB, payment, email) | Interface in domain + Adapter in infra | domain port + infrastructure adapter |
| Something that happened in the domain | Domain Event (past tense, versioned) | `domain/*/events/*.ts` |
| Wiring all dependencies | Composition Root only | `config/Container.ts` |
| A shortcut taken under deadline | Named tactical debt entry in issue tracker | Issue tracker + code comment |

### The State Transition Template

```typescript
/**
 * [commandName] — what this command does in business terms.
 *
 * PRECONDITIONS: [what state must be true before calling this]
 * POSTCONDITIONS: [what state is guaranteed after success]
 * ERRORS: [what errors can be returned and why]
 */

commandName(params: CommandParams): Result<void> {
  // 1. Guard: current state must allow this transition
  if (this._status.kind !== "expected_state") {
    return Result.fail(new DomainError(
      "ENTITY_INVALID_STATE",
      `Cannot [action] in '${this._status.kind}' state — must be [expected_state]`,
    ));
  }

  // 2. Validate: params must satisfy business rules
  if (invalidBusinessCondition) {
    return Result.fail(new DomainError("ENTITY_SPECIFIC_ERROR", "Clear message for caller"));
  }

  // 3. Transition: update to new state (exhaustive union enforces completeness)
  this._status = { kind: "new_state", ...newStateData };

  // 4. Emit: record that this happened (past tense, immutable)
  this._domainEvents.push({
    type: "ThingHappened",
    entityId: this.id,
    ...relevantData,
    occurredAt: new Date(),
  });

  return Result.ok(undefined);
}
```

### The Use Case Template

```typescript
/**
 * DoSomethingUseCase — what business capability this provides.
 *
 * TRIGGER: [what causes this use case to run — HTTP request, domain event, scheduled job]
 * SIDE EFFECTS: [what it changes — domain state, events published]
 * DOES NOT: [business rules it explicitly does NOT enforce — those live in the domain]
 */
class DoSomethingUseCase {
  constructor(
    private readonly entityRepository: EntityRepository, // interface only
    private readonly eventPublisher: EventPublisher,      // interface only
  ) {}

  async execute(request: DoSomethingRequest): Promise<Result<DoSomethingResponse>> {
    // 1. Load — via interface, no infrastructure knowledge
    const entity = await this.entityRepository.findById(toId(request.entityId));
    if (!entity) return Result.fail(new DomainError("ENTITY_NOT_FOUND", "..."));

    // 2. Delegate — business rules enforced inside the domain, not here
    const result = entity.doSomething(request.params);
    if (!result.ok) return result;

    // 3. Persist — after successful domain operation
    await this.entityRepository.save(entity);

    // 4. Publish — AFTER successful save, never before
    await this.eventPublisher.publishAll(entity.domainEvents);
    entity.clearDomainEvents();

    // 5. Return DTO — no domain objects, no framework objects
    return Result.ok({ id: entity.id, status: entity.status.kind });
  }
}
```

### The Module Depth Checklist
Apply to every new class, significant function, or service before merging:

1.  What design decisions does this module own? List them.
2.  Are any of those decisions visible to callers? (Leaked information — fix it.)
3.  If the most likely implementation change occurred, how many files would change? Target: one.
4.  Is the interface comment written? Does it describe preconditions, postconditions, and constraints?
5.  Is there a pass-through method here? (Adds no depth — delete it or give it real responsibility.)
6.  Does this module's existence reduce cognitive load for callers? Or does it add more concepts they must

know?

| Pattern | HTTP Status | Meaning |
|---|---|---|
| `*_INVALID_STATE` | 409 Conflict | Business rule: wrong state for this operation |
| `*_NOT_FOUND` | 404 Not Found | Entity does not exist |
| `*_ALREADY_EXISTS` | 409 Conflict | Uniqueness constraint violated |
| `*_UNAUTHORIZED` | 403 Forbidden | Wrong actor for this operation |
| `*_VALIDATION_*` | 400 Bad Request | Input data failed validation |
| `*_GATEWAY_*` | 502 Bad Gateway | External service error — usually retryable |
| `*_TIMEOUT` | 504 Gateway Timeout | External service timed out — retry |
| `*_CURRENCY_MISMATCH` | 422 Unprocessable | Cannot operate across different currencies |

## Chapter 13: Case Study — Dispatch Africa

This chapter documents every architectural decision made in the Dispatch Africa reference implementation, with
each decision traced to its theoretical source in this handbook.

### Bounded Contexts and Their Interfaces

#### Order Context
Deep module: hides state machine, fee calculation, cancellation rules
Interface: 6 aggregate methods + OrderRepository port
Publishes: DeliveryRequested, DeliveryConfirmed, DeliveryCompleted, DeliveryCancelled

#### Dispatch Context
Deep module: hides rider scoring algorithm, proximity search, retry logic
Interface: RiderRepository port + AssignRiderUseCase
Reacts to: DeliveryConfirmed → assigns best available rider

#### Tracking Context
Deep module: hides deduplication, batch processing, offline reconstruction
Interface: RecordLocationBatchUseCase (accepts up to 500 events per call)
Append-only: TrackingEvent never updated or deleted

#### Payment Context
Deep module: hides gateway selection, commission arithmetic, reconciliation
Interface: PaymentGateway port (Paystack, Mobile Money, COD all same interface)
Reacts to: DeliveryCompleted → initiates charge or records COD

| Decision | What | Why | Source |
|---|---|---|---|
| ULID primary keys | Lexicographically sortable IDs | Sequential B-tree inserts, no fragmentation, ~30% better index performance vs random UUID | Performance-Aware |
| Discriminated union for OrderStatus | 9-state union instead of enum + optional fields | Illegal states unrepresentable. Compile-time exhaustiveness. No null checks. | Ousterhout (info hiding) + TypeScript |
| Partial indexes for active orders | Index WHERE status NOT IN (terminal states) | Active orders are ~5% of rows. Dispatch queries scan 5% not 100%. | Performance-Aware |
| CQRS read side | Direct SQL for all read endpoints | Domain model optimized for writes. Read DTOs need no domain objects. 3-5x faster. | Ousterhout (module depth) |
| Batch location upload | Accept 500 events per HTTP call | Riders go offline. App queues locally. One round trip for 10 minutes of offline data. | African context |
| Integer money | amountInMinorUnits: number | No floating-point arithmetic near currency. No rounding errors at scale. | Information hiding + correctness |
| Manual DI | No framework DI — Container.ts by hand | Missing dependency = compile error, not runtime error. Zero framework lock-in. | Ousterhout (reduce complexity) |
| Interface comments on all ports | JSDoc on every repository interface method | Ports are the interfaces between deep modules. Callers must know preconditions. | Ousterhout (interface comments) |
| Result\<T,E\> everywhere | No exceptions in domain logic | Errors visible in type signatures. Cannot be ignored. No try/catch noise. | Synthesis position |

### Strategic vs Tactical Decisions — Tracked
The following are known tactical shortcuts in the current implementation, tracked as required by this handbook.
Each has a recorded rationale and an addressed-by target:

#### Tactical Debt Log

**TD-001: SimplePricingService uses flat rate formula**
  Rationale: ML-based pricing model planned but not yet trained
  Impact: Underprices long routes by ~15% compared to market rate
  Addressed by: Sprint 8 — integrate pricing ML model via PricingService interface
  Owner: [assigned engineer]

**TD-002: In-memory implementations used in staging**
  Rationale: Staging DB provisioning blocked on infrastructure approval
  Impact: Staging does not catch DB-specific bugs
  Addressed by: Sprint 6 — provision staging Postgres instance
  Owner: [assigned engineer]

**TD-003: No read replica routing yet**
  Rationale: Single-node DB sufficient at current load (<500 req/min)
  Impact: Reads and writes share primary DB connection pool
  Addressed by: When P99 read latency exceeds 50ms — measure monthly
  Owner: Platform team

### What to Build Next — Prioritized

1.  **Event-driven dispatch worker.** Background job consuming DeliveryConfirmed, calling AssignRiderUseCase with exponential backoff. Cancel order after 10 minutes if no rider found. (Depth: the retry logic lives in the worker, invisible to the use case.)

2.  **Rider payout job.** Scheduled daily job aggregating CodCollected + PaymentCaptured events, calculating net earnings per rider, initiating mobile money payouts via Paystack Transfers API.

3.  **Push notification service.** Event handler reacting to approaching_pickup and approaching_dropoff, sending SMS via Termii. Interface: NotificationService port. Implementation: TermiiAdapter.

4.  **Architectural fitness functions.** ESLint import rules in CI that fail the build if domain imports from infrastructure. Architecture without automated enforcement degrades under deadline pressure.

5.  **Interface comments audit.** Review every public method in domain/ and application/ for completeness of interface comments. Preconditions and postconditions are part of the interface, not optional documentation.

6.  **Read replica routing.** Separate connection string for OrderReadQueries. All GET endpoints route to read replica. Primary handles writes only. Implement when P99 read latency exceeds 50ms.
