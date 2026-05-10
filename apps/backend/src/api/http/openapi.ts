export function createOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Orcta Enterprise Template API",
      version: "1.0.0",
      description: "A DDD + Hexagonal architecture TypeScript template.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/health": { get: { summary: "Health check", responses: { 200: { description: "OK" } } } },
      "/tasks": { post: { summary: "Create a task" }, get: { summary: "List tasks" } },
      "/tasks/{taskId}": { get: { summary: "Get task details" } },
      "/tasks/{taskId}/complete": { post: { summary: "Complete a task" } },
      "/tasks/{taskId}/cancel": { post: { summary: "Cancel a task" } },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  };
}

export function createDocsHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Orcta Enterprise Template API</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; line-height: 1.5; }
      code, pre { background: #f6f8fa; padding: 0.2rem 0.4rem; border-radius: 4px; }
      ul { padding-left: 1.25rem; }
    </style>
  </head>
  <body>
    <h1>Orcta Enterprise Template API</h1>
    <p>OpenAPI spec available at <a href="/openapi.json">/openapi.json</a>.</p>
    <h2>Routes</h2>
    <ul>
      <li>GET /health</li>
      <li>POST /tasks</li>
      <li>GET /tasks</li>
      <li>GET /tasks/{taskId}</li>
      <li>POST /tasks/{taskId}/complete</li>
      <li>POST /tasks/{taskId}/cancel</li>
    </ul>
  </body>
</html>`;
}
