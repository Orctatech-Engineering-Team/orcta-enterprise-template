import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppContainer } from "@bootstrap/Container";
import type { AppConfig } from "@bootstrap/Container";
import { registerTaskRoutes } from "@api/http/task/task.routes";
import { createErrorHandler } from "@api/http/middleware/error-handler";
import { createApiKeyAuthMiddleware } from "@api/http/middleware/auth";
import { createRequestLoggingMiddleware } from "@api/http/middleware/logging";
import { requestIdMiddleware } from "@api/http/middleware/request-id";
import { createDomainEventContextMiddleware } from "@api/http/middleware/domain-event-context";
import { createOpenApiSpec, createDocsHtml } from "@api/http/openapi";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";
import { error } from "@api/http/response";
import type { AppLogger } from "@infrastructure/logging/logger";

export function createHttpApp(container: AppContainer, config: AppConfig, logger: AppLogger): Hono {
  const app = new Hono();

  app.use("*", requestIdMiddleware);
  app.use(
    "*",
    cors({
      origin: ["http://localhost:3001"],
      credentials: true,
    }),
  );
  app.use("*", createRequestLoggingMiddleware(logger, config.observability));
  app.use("*", createApiKeyAuthMiddleware({ apiKeys: config.auth.apiKeys }));
  app.use("*", createDomainEventContextMiddleware());
  app.onError(createErrorHandler());
  app.notFound((c) => {
    enrichHttpRequestEvent(c, {
      operation: `${c.req.method} ${c.req.path}`,
      error: { kind: "not_found", code: "NOT_FOUND", message: `${c.req.method} ${c.req.path} was not found` },
    });

    return error(c, "NOT_FOUND", `${c.req.method} ${c.req.path} was not found`, 404);
  });

  app.get("/health", (c) => c.json({ ok: true }, 200));
  app.get("/openapi.json", (c) => c.json(createOpenApiSpec(), 200));
  app.get("/docs", (c) => c.html(createDocsHtml(), 200));

  registerTaskRoutes(app, container.taskController);

  app.route("/", container.tags.router);

  return app;
}
