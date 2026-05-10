import { describe, it, expect, beforeEach } from "vitest";
import { PostgresEventPublisher } from "@infrastructure/events/PostgresEventPublisher";
import {
  setDomainEventContext,
  clearDomainEventContext,
} from "@infrastructure/logging/domain-event-context";
import type { DomainEvent } from "@application/shared/EventPublisher";

class InMemoryEventStore {
  private events: Array<{
    eventType: string;
    payload: DomainEvent;
    requestId?: string;
    traceId?: string;
    taskId?: string;
    userId?: string;
    actorType?: string;
    publishedAt: null;
  }> = [];

  insert(_tableName: string) {
    return {
      values: async (values: any) => {
        this.events.push(...values);
      },
    };
  }

  getEvents() {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}

describe("PostgresEventPublisher — Integration", () => {
  let store: InMemoryEventStore;
  let publisher: PostgresEventPublisher;

  beforeEach(() => {
    clearDomainEventContext();
    store = new InMemoryEventStore();
    publisher = new PostgresEventPublisher(store as any);
  });

  it("captures event with business context", async () => {
    const event: DomainEvent = {
      type: "TaskCreated",
      taskId: "task-123" as never,
      title: "Test task",
      priority: "high",
      assigneeId: "user-456",
      occurredAt: new Date(),
    };

    await publisher.publish(event);

    const stored = store.getEvents();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      eventType: "TaskCreated",
      taskId: "task-123",
    });
  });

  it("captures request context from domain event context", async () => {
    setDomainEventContext({
      requestId: "req-123",
      traceId: "trace-456",
      userId: "user-789",
      actorType: "api_key",
    });

    const event: DomainEvent = {
      type: "TaskCreated",
      taskId: "task-123" as never,
      title: "Test task",
      priority: "high",
      assigneeId: "user-456",
      occurredAt: new Date(),
    };

    await publisher.publish(event);

    const stored = store.getEvents();
    expect(stored[0]).toMatchObject({
      requestId: "req-123",
      traceId: "trace-456",
      userId: "user-789",
      actorType: "api_key",
    });
  });

  it("publishes without request context when not set", async () => {
    const event: DomainEvent = {
      type: "TaskCreated",
      taskId: "task-123" as never,
      title: "Test task",
      priority: "high",
      assigneeId: "user-456",
      occurredAt: new Date(),
    };

    await publisher.publish(event);

    const stored = store.getEvents();
    expect(stored[0]?.requestId).toBeUndefined();
    expect(stored[0]?.traceId).toBeUndefined();
  });

  it("publishes multiple events in sequence", async () => {
    const event1: DomainEvent = {
      type: "TaskCreated",
      taskId: "task-123" as never,
      title: "Test task",
      priority: "high",
      assigneeId: "user-456",
      occurredAt: new Date(),
    };

    const event2: DomainEvent = {
      type: "TaskStarted",
      taskId: "task-123" as never,
      assigneeId: "user-456",
      occurredAt: new Date(),
    };

    await publisher.publishAll([event1, event2]);

    const stored = store.getEvents();
    expect(stored).toHaveLength(2);
    expect(stored[0]?.eventType).toBe("TaskCreated");
    expect(stored[1]?.eventType).toBe("TaskStarted");
  });
});
