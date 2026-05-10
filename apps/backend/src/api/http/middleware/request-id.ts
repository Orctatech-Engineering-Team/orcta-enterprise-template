import type { MiddlewareHandler } from "hono";

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  c.set("requestStartedAt", performance.now());
  const requestId = crypto.randomUUID();
  const traceId = crypto.randomUUID();
  c.set("requestId", requestId);
  c.set("traceId", traceId);
  c.header("x-request-id", requestId);
  c.header("x-trace-id", traceId);
  await next();
};
