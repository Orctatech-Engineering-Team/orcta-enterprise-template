import type { ErrorHandler } from "hono";
import { getRequestId } from "@api/http/request-context";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";

export function createErrorHandler(): ErrorHandler {
  return (error, c) => {
    const message = error instanceof Error ? error.message : "Unexpected error";

    enrichHttpRequestEvent(c, {
      error: {
        kind: error instanceof Error ? error.name : typeof error,
        message,
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return c.json({ error: "INTERNAL_SERVER_ERROR", message, requestId: getRequestId(c) }, 500);
  };
}
