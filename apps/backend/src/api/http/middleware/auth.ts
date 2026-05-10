import type { MiddlewareHandler } from "hono";
import { getRequestId } from "@api/http/request-context";
import { createHash } from "node:crypto";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";

type ApiKeyAuthConfig = {
  apiKeys: string[];
};

const PUBLIC_PATHS = ["/health", "/openapi.json", "/docs"];

function readBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function createApiKeyAuthMiddleware(config: ApiKeyAuthConfig): MiddlewareHandler {
  return async (c, next) => {
    if (config.apiKeys.length === 0 || PUBLIC_PATHS.includes(c.req.path)) {
      return await next();
    }

    const suppliedKey = c.req.header("x-api-key") ?? readBearerToken(c.req.header("authorization"));
    if (!suppliedKey || !config.apiKeys.includes(suppliedKey)) {
      enrichHttpRequestEvent(c, {
        actorType: "anonymous",
        operation: "api_key_auth",
        error: {
          kind: "auth_error",
          code: "UNAUTHORIZED",
          message: "Missing or invalid API key",
        },
      });
      return c.json(
        {
          error: "UNAUTHORIZED",
          message: "Missing or invalid API key",
          requestId: getRequestId(c),
        },
        401,
      );
    }

    enrichHttpRequestEvent(c, {
      actorType: "api_key",
      actorId: createHash("sha256").update(suppliedKey).digest("hex").slice(0, 16),
      operation: "api_key_auth",
    });

    return await next();
  };
}
