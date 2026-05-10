import type { DomainEvent } from "@application/shared/EventPublisher";

/**
 * InMemoryEventPublisher — Test/Development Implementation
 *
 * For production: replace with Kafka, Redis pub/sub, or AWS EventBridge
 * Same interface, different implementation — zero changes to application layer
 */
export class InMemoryEventPublisher {
  private events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }

  async publishAll(events: ReadonlyArray<DomainEvent>, _tx?: unknown): Promise<void> {
    this.events.push(...events);
  }

  getEvents(): DomainEvent[] {
    return this.events;
  }

  findEvents(type: string): DomainEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  clear(): void {
    this.events = [];
  }
}
