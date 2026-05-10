import type { Hono } from "hono";
import type { TaskController } from "@api/http/task/TaskController";

export function registerTaskRoutes(app: Hono, controller: TaskController): void {
  app.post("/tasks", (c) => controller.create(c));
  app.get("/tasks", (c) => controller.list(c));
  app.get("/tasks/:taskId", (c) => controller.getById(c));
  app.post("/tasks/:taskId/complete", (c) => controller.complete(c));
  app.post("/tasks/:taskId/cancel", (c) => controller.cancel(c));
}
