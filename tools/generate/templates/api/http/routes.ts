import type { Hono } from "hono";
import type { {{Entity}}Controller } from "@api/http/{{context}}/{{Entity}}Controller";

export function register{{Context}}Routes(app: Hono, controller: {{Entity}}Controller): void {
  app.post("/{{context}}s", (c) => controller.create(c));
  app.get("/{{context}}s", (c) => controller.list(c));
  app.get("/{{context}}s/:{{entity}}Id", (c) => controller.getById(c));
}
