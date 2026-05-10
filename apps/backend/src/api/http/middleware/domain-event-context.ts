import type { MiddlewareHandler } from "hono";
import { setDomainEventContext } from "@infrastructure/logging/domain-event-context";
import { getRequestId } from "@api/http/request-context";
import { getHttpRequestEvent } from "@infrastructure/logging/http-event";

/**
 * Domain Event Context Middleware
 *
 * Extracts request identity and user context from the HTTP request
 * and makes it available to domain event publishers throughout the request lifetime.
 *
 * This happens after auth middleware, so we know the actor_type and user_id.
 */
export function createDomainEventContextMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = getRequestId(c);
    const traceId = c.get("traceId") as string | undefined;
    const httpEvent = getHttpRequestEvent(c);

    setDomainEventContext({
      requestId,
      traceId: traceId || requestId,
      userId: httpEvent?.user_id,
      actorType: httpEvent?.actor_type,
    });

    await next();
  };
}
