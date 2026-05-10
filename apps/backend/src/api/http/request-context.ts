import type { Context } from "hono";

export function getRequestId(c: Context): string | undefined {
  const getter = (c as { get?: (key: string) => unknown }).get;
  if (!getter) return undefined;
  return getter.call(c, "requestId") as string | undefined;
}

export function getRequestStartedAt(c: Context): number | undefined {
  const getter = (c as { get?: (key: string) => unknown }).get;
  if (!getter) return undefined;
  return getter.call(c, "requestStartedAt") as number | undefined;
}

export function getTraceId(c: Context): string | undefined {
  const getter = (c as { get?: (key: string) => unknown }).get;
  if (!getter) return undefined;
  return getter.call(c, "traceId") as string | undefined;
}
