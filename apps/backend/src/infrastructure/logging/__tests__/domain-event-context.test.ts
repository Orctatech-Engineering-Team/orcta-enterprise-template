import { describe, it, expect, beforeEach } from "vitest";
import {
  setDomainEventContext,
  getDomainEventContext,
  clearDomainEventContext,
  withDomainEventContext,
} from "@infrastructure/logging/domain-event-context";
import type { DomainEventContext } from "@infrastructure/events/PostgresEventPublisher";

describe("Domain Event Context", () => {
  beforeEach(() => {
    clearDomainEventContext();
  });

  it("stores and retrieves context", () => {
    const context: DomainEventContext = {
      requestId: "req-123",
      traceId: "trace-456",
      userId: "user-789",
      actorType: "api_key",
    };

    setDomainEventContext(context);
    const retrieved = getDomainEventContext();

    expect(retrieved).toEqual(context);
  });

  it("returns undefined when no context is set", () => {
    const context = getDomainEventContext();
    expect(context).toBeUndefined();
  });

  it("clears context", () => {
    setDomainEventContext({
      requestId: "req-123",
    });

    clearDomainEventContext();
    const context = getDomainEventContext();

    expect(context).toEqual({});
  });

  it("runs callback within context scope", async () => {
    const context: DomainEventContext = {
      requestId: "req-123",
      traceId: "trace-456",
      userId: "user-789",
    };

    let contextInside: DomainEventContext | undefined;
    const result = await withDomainEventContext(context, async () => {
      contextInside = getDomainEventContext();
      return "success";
    });

    expect(result).toBe("success");
    expect(contextInside).toEqual(context);
  });

  it("isolates context between concurrent calls", async () => {
    const ctx1: DomainEventContext = { requestId: "req-1", userId: "user-1" };
    const ctx2: DomainEventContext = { requestId: "req-2", userId: "user-2" };

    const [retrieved1, retrieved2] = await Promise.all([
      withDomainEventContext(ctx1, async () => getDomainEventContext()),
      withDomainEventContext(ctx2, async () => getDomainEventContext()),
    ]);

    expect(retrieved1).toEqual(ctx1);
    expect(retrieved2).toEqual(ctx2);
  });

  it("handles partial context (only requestId)", () => {
    const context: DomainEventContext = { requestId: "req-123" };
    setDomainEventContext(context);
    const retrieved = getDomainEventContext();

    expect(retrieved?.requestId).toBe("req-123");
    expect(retrieved?.userId).toBeUndefined();
    expect(retrieved?.actorType).toBeUndefined();
  });
});
