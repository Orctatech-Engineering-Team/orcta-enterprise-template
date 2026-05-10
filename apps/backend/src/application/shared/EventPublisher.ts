import type { TaskDomainEvent } from "@domain/task/entities/Task";

export type DomainEvent = TaskDomainEvent;

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: ReadonlyArray<DomainEvent>, tx?: unknown): Promise<void>;
}
