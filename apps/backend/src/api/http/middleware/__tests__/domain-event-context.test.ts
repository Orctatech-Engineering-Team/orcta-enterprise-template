import { describe, it, expect, beforeEach } from "vitest";
import { createDomainEventContextMiddleware } from "@api/http/middleware/domain-event-context";
import {
  getDomainEventContext,
  clearDomainEventContext,
} from "@infrastructure/logging/domain-event-context";

/**
 * Domain Event Context Middleware — Integration Tests
 *
 * Tests the middleware against a test double context (not a mock),
 * verifying that request identity flows into the async-local context.
 */

class TestContext {
  private store = new Map<string, any>();

  get(key: string) {
    return this.store.get(key);
  }

  set(key: string, value: any) {
    this.store.set(key, value);
  }
}

describe("Domain Event Context Middleware — Integration", () => {
  beforeEach(() => {
    clearDomainEventContext();
  });

  it("populates domain event context from request identity and auth", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");
    context.set("traceId", "trace-456");
    context.set("httpLogEvent", {
      user_id: "user-789",
      actor_type: "api_key",
    });

    let capturedContext: any;
    const next = async () => {
      capturedContext = getDomainEventContext();
    };

    await middleware(context as any, next);

    expect(capturedContext).toEqual({
      requestId: "req-123",
      traceId: "trace-456",
      userId: "user-789",
      actorType: "api_key",
    });
  });

  it("uses requestId as fallback for traceId when traceId is missing", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");
    context.set("httpLogEvent", {
      user_id: "user-789",
      actor_type: "api_key",
    });

    let capturedContext: any;
    const next = async () => {
      capturedContext = getDomainEventContext();
    };

    await middleware(context as any, next);

    expect(capturedContext.traceId).toBe("req-123");
  });

  it("handles missing httpLogEvent gracefully", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");
    context.set("traceId", "trace-456");

    let capturedContext: any;
    const next = async () => {
      capturedContext = getDomainEventContext();
    };

    await middleware(context as any, next);

    expect(capturedContext).toEqual({
      requestId: "req-123",
      traceId: "trace-456",
      userId: undefined,
      actorType: undefined,
    });
  });

  it("handles missing user_id in httpLogEvent", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");
    context.set("traceId", "trace-456");
    context.set("httpLogEvent", {
      actor_type: "api_key",
    });

    let capturedContext: any;
    const next = async () => {
      capturedContext = getDomainEventContext();
    };

    await middleware(context as any, next);

    expect(capturedContext.userId).toBeUndefined();
    expect(capturedContext.actorType).toBe("api_key");
  });

  it("calls next middleware", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(context as any, next);

    expect(nextCalled).toBe(true);
  });

  it("makes context available throughout the request", async () => {
    const middleware = createDomainEventContextMiddleware();

    const context = new TestContext();
    context.set("requestId", "req-123");
    context.set("traceId", "trace-456");
    context.set("httpLogEvent", { user_id: "user-789" });

    const contextCaptures: any[] = [];
    const next = async () => {
      // Capture context at different points during request
      contextCaptures.push(getDomainEventContext());
      await Promise.resolve();
      contextCaptures.push(getDomainEventContext());
    };

    await middleware(context as any, next);

    // Both captures should have the same context
    expect(contextCaptures).toHaveLength(2);
    expect(contextCaptures[0]).toEqual(contextCaptures[1]);
    expect(contextCaptures[0]?.requestId).toBe("req-123");
  });
});
