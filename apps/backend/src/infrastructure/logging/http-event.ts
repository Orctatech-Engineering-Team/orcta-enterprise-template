import type { Context } from "hono";
import type { AppConfig } from "@bootstrap/Container";

export type HttpRequestOutcome = "success" | "client_error" | "server_error";

export type HttpRequestSampleReason =
  | "error"
  | "slow_request"
  | "debug_request"
  | "sampled_success";

export type HttpRequestError = {
  kind: string;
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
};

export type HttpRequestLogEvent = {
  event: "http_request";
  timestamp: string;
  service: string;
  service_version: string;
  deployment_id: string;
  environment: AppConfig["env"];
  request_id: string;
  trace_id: string;
  method: string;
  path: string;
  status_code?: number;
  duration_ms?: number;
  outcome?: HttpRequestOutcome;
  sampled: boolean;
  sample_reason?: HttpRequestSampleReason;
  user_id?: string;
  actor_type?: string;
  actor_id?: string;
  operation?: string;
  feature_flags: string[];
  request: {
    user_agent?: string;
    content_type?: string;
    ip?: string;
  };
  error?: HttpRequestError;
};

export type HttpRequestLogConfig = {
  env: AppConfig["env"];
  deploymentId: string;
  serviceVersion: string;
  featureFlags: string[];
  successSampleRate: number;
  slowRequestThresholdMs: number;
};

export type HttpRequestLogContextPatch = {
  userId?: string;
  actorType?: string;
  actorId?: string;
  operation?: string;
  debugRequested?: boolean;
  error?: HttpRequestError;
};

const HTTP_LOG_EVENT_KEY = "httpLogEvent";

export function createHttpRequestEvent(
  c: Context,
  config: HttpRequestLogConfig,
): HttpRequestLogEvent {
  const requestId = c.get("requestId") as string | undefined;
  const traceId = c.get("traceId") as string | undefined;

  return {
    event: "http_request",
    timestamp: new Date().toISOString(),
    service: config.serviceVersion,
    service_version: config.serviceVersion,
    deployment_id: config.deploymentId,
    environment: config.env,
    request_id: requestId || "unknown",
    trace_id: traceId || requestId || "unknown",
    method: c.req.method,
    path: c.req.path,
    sampled: false,
    operation: `${c.req.method} ${c.req.path}`,
    actor_type: "anonymous",
    feature_flags: [...config.featureFlags],
    request: {
      user_agent: c.req.header("user-agent") || undefined,
      content_type: c.req.header("content-type") || undefined,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || undefined,
    },
  };
}

export function getHttpRequestEvent(c: Context): HttpRequestLogEvent | undefined {
  const getter = (c as { get?: (key: string) => unknown }).get;
  if (!getter) return undefined;
  return getter.call(c, HTTP_LOG_EVENT_KEY) as HttpRequestLogEvent | undefined;
}

export function setHttpRequestEvent(c: Context, event: HttpRequestLogEvent): void {
  c.set(HTTP_LOG_EVENT_KEY, event);
}

export function enrichHttpRequestEvent(c: Context, patch: HttpRequestLogContextPatch): void {
  const event = getHttpRequestEvent(c);
  if (!event) return;
  if (patch.userId) event.user_id = patch.userId;
  if (patch.actorType) event.actor_type = patch.actorType;
  if (patch.actorId) event.actor_id = patch.actorId;
  if (patch.operation) event.operation = patch.operation;
  if (patch.debugRequested) event.sample_reason = "debug_request";
  if (patch.error) event.error = patch.error;
}

export function finalizeHttpRequestEvent(
  event: HttpRequestLogEvent,
  params: {
    statusCode: number;
    durationMs: number;
    config: HttpRequestLogConfig;
    debugRequested?: boolean;
  },
): HttpRequestLogEvent {
  event.status_code = params.statusCode;
  event.duration_ms = params.durationMs;
  event.outcome =
    params.statusCode >= 500
      ? "server_error"
      : params.statusCode >= 400
        ? "client_error"
        : "success";

  if (params.statusCode >= 400) {
    event.sampled = true;
    event.sample_reason = "error";
    return event;
  }

  if (params.durationMs >= params.config.slowRequestThresholdMs) {
    event.sampled = true;
    event.sample_reason = "slow_request";
    return event;
  }

  if (params.debugRequested) {
    event.sampled = true;
    event.sample_reason = "debug_request";
    return event;
  }

  const sampleRate = params.config.successSampleRate;
  const shouldSample = sampleRate >= 1 || Math.random() < sampleRate;
  event.sampled = shouldSample;
  if (shouldSample) {
    event.sample_reason = "sampled_success";
  }

  return event;
}

export function clearHttpRequestEvent(c: Context): void {
  c.set(HTTP_LOG_EVENT_KEY, undefined);
}
