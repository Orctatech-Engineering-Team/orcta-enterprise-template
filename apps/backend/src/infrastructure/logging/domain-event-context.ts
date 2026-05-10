import { AsyncLocalStorage } from "node:async_hooks";
import type { DomainEventContext } from "@infrastructure/events/PostgresEventPublisher";

/**
 * Request-scoped context for domain event publishing.
 *
 * When an HTTP request arrives, the middleware stores the request_id and trace_id.
 * When a use case publishes domain events, the event publisher reads this context
 * and includes it in the event record.
 *
 * This enables correlation: a single HTTP request may trigger multiple domain events,
 * and we can trace all of them back to that request.
 */
const asyncLocalStorage = new AsyncLocalStorage<DomainEventContext>();

export function setDomainEventContext(context: DomainEventContext): void {
  asyncLocalStorage.enterWith(context);
}

export function getDomainEventContext(): DomainEventContext | undefined {
  return asyncLocalStorage.getStore();
}

export function clearDomainEventContext(): void {
  asyncLocalStorage.enterWith({});
}

/**
 * Run a callback within a domain event context.
 *
 * Used by middleware to ensure context is available throughout the request lifetime.
 */
export async function withDomainEventContext<T>(
  context: DomainEventContext,
  callback: () => Promise<T>,
): Promise<T> {
  return asyncLocalStorage.run(context, callback);
}
