import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Result } from "@domain/shared";
import { getRequestId } from "@api/http/request-context";

export type ApiSuccessBody<T> = {
  data: T;
  requestId?: string;
};

export type ApiErrorBody = {
  error: string;
  message: string;
  requestId?: string;
};

export function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200): Response {
  const body: ApiSuccessBody<T> = { data, requestId: getRequestId(c) };
  return c.json(body, status);
}

export function error(c: Context, code: string, message: string, status: ContentfulStatusCode = 400): Response {
  const body: ApiErrorBody = { error: code, message, requestId: getRequestId(c) };
  return c.json(body, status);
}

export function toHttpResponse<T>(
  c: Context,
  result: Result<T>,
  successStatus: ContentfulStatusCode = 200,
  statusMap?: Record<string, ContentfulStatusCode>,
): Response {
  if (result.ok) {
    return success(c, result.value, successStatus);
  }
  return error(c, result.error.code, result.error.message, statusMap?.[result.error.code] ?? 400);
}
