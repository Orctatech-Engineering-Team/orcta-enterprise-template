import { describe, it, expect } from "vitest";
import { extractBusinessContextFromDomainEvent } from "@infrastructure/logging/domain-event";
import type { DomainEvent } from "@application/shared/EventPublisher";

describe("Domain Event Schema", () => {
  describe("extractBusinessContextFromDomainEvent", () => {
    it("extracts task_id from task domain event", () => {
      const event: DomainEvent = {
        type: "TaskCreated",
        taskId: "task-123" as never,
        title: "Test",
        priority: "high",
        assigneeId: "user-456",
        occurredAt: new Date(),
      };

      const context = extractBusinessContextFromDomainEvent(event);
      expect(context.task_id).toBe("task-123");
    });

    it("returns empty context for events without taskId", () => {
      const event = {
        type: "SomeUnrelatedEvent",
        occurredAt: new Date(),
      } as any;

      const context = extractBusinessContextFromDomainEvent(event);
      expect(context.task_id).toBeUndefined();
    });
  });
});
