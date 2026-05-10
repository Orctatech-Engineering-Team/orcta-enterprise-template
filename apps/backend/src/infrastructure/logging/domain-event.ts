import type { AppConfig } from "@bootstrap/Container";
import type { DomainEvent } from "@application/shared/EventPublisher";

export type DomainEventLogEvent = {
  event: "domain_event";
  timestamp: string;
  service: string;
  service_version: string;
  deployment_id: string;
  environment: AppConfig["env"];
  event_type: string;
  payload: DomainEvent;
  request_id?: string;
  trace_id?: string;
  user_id?: string;
  task_id?: string;
  actor_type?: string;
  actor_id?: string;
};

export type DomainEventLogConfig = {
  env: AppConfig["env"];
  deploymentId: string;
  serviceVersion: string;
};

export type DomainEventContextPatch = {
  requestId?: string;
  traceId?: string;
  userId?: string;
  taskId?: string;
  actorType?: string;
  actorId?: string;
};

export function createDomainEventLogEntry(
  domainEvent: DomainEvent,
  config: DomainEventLogConfig,
  context?: DomainEventContextPatch,
): DomainEventLogEvent {
  return {
    event: "domain_event",
    timestamp: new Date().toISOString(),
    service: config.serviceVersion,
    service_version: config.serviceVersion,
    deployment_id: config.deploymentId,
    environment: config.env,
    event_type: domainEvent.type,
    payload: domainEvent,
    request_id: context?.requestId,
    trace_id: context?.traceId,
    user_id: context?.userId,
    task_id: context?.taskId,
    actor_type: context?.actorType,
    actor_id: context?.actorId,
  };
}

export function extractBusinessContextFromDomainEvent(
  domainEvent: DomainEvent,
): Pick<DomainEventLogEvent, "task_id"> {
  const context: Pick<DomainEventLogEvent, "task_id"> = {};
  if ("taskId" in domainEvent) {
    context.task_id = domainEvent.taskId as string;
  }
  return context;
}
