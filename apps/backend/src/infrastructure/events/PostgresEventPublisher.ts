import type { DbClient } from "@config/database";
import type { EventPublisher, DomainEvent } from "@application/shared/EventPublisher";
import { outboxEvents } from "@infrastructure/schema/schema";
import { extractBusinessContextFromDomainEvent } from "@infrastructure/logging/domain-event";
import { getDomainEventContext } from "@infrastructure/logging/domain-event-context";

export type DomainEventContext = {
  requestId?: string;
  traceId?: string;
  userId?: string;
  actorType?: string;
};

export class PostgresEventPublisher implements EventPublisher {
  constructor(private readonly db: DbClient) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.publishAll([event]);
  }

  async publishAll(events: ReadonlyArray<DomainEvent>, tx?: any): Promise<void> {
    if (events.length === 0) return;

    const client = tx ?? this.db;
    const requestContext = getDomainEventContext();

    const rows = events.map((event) => {
      const businessContext = extractBusinessContextFromDomainEvent(event);
      return {
        eventType: event.type,
        payload: event,
        requestId: requestContext?.requestId,
        traceId: requestContext?.traceId,
        userId: requestContext?.userId,
        actorType: requestContext?.actorType,
        taskId: businessContext.task_id,
        publishedAt: null,
      };
    });

    await client.insert(outboxEvents).values(rows);
  }
}
