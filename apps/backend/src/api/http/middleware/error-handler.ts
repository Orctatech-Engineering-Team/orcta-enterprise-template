import type { ErrorHandler } from "hono";
import { error } from "@api/http/response";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";

export function createErrorHandler(): ErrorHandler {
  return (err, c) => {
    const message = err instanceof Error ? err.message : "Unexpected error";

    enrichHttpRequestEvent(c, {
      error: {
        kind: err instanceof Error ? err.name : typeof err,
        message,
        stack: err instanceof Error ? err.stack : undefined,
      },
    });

    return error(c, "INTERNAL_SERVER_ERROR", message, 500);
  };
}
