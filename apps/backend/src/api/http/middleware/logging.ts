import type { MiddlewareHandler } from "hono";
import { getRequestStartedAt } from "@api/http/request-context";
import type { AppLogger } from "@infrastructure/logging/logger";
import {
  createHttpRequestEvent,
  finalizeHttpRequestEvent,
  getHttpRequestEvent,
  setHttpRequestEvent,
  type HttpRequestLogConfig,
} from "@infrastructure/logging/http-event";

export function createRequestLoggingMiddleware(
  logger: AppLogger,
  config: HttpRequestLogConfig,
): MiddlewareHandler {
  return async (c, next) => {
    setHttpRequestEvent(c, createHttpRequestEvent(c, config));
    await next();

    const status = c.res.status;
    const requestStartedAt = getRequestStartedAt(c);
    const durationMs =
      requestStartedAt === undefined ? 0 : Math.round(performance.now() - requestStartedAt);
    const debugRequested = c.req.header("x-debug-log") === "1" || c.req.query("debug") === "1";
    const requestEvent = getHttpRequestEvent(c);

    if (!requestEvent) {
      return;
    }

    finalizeHttpRequestEvent(requestEvent, {
      statusCode: status,
      durationMs,
      config,
      debugRequested,
    });

    if (!requestEvent.sampled) {
      return;
    }

    const logLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    logger[logLevel](requestEvent, "canonical http event");
  };
}
