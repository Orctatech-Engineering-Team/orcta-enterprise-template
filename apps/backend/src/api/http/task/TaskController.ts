import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Result } from "@domain/shared";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
} from "@application/task/usecases/CreateTaskUseCase";
import type {
  CompleteTaskRequest,
  CompleteTaskResponse,
} from "@application/task/usecases/CompleteTaskUseCase";
import type {
  CancelTaskRequest,
  CancelTaskResponse,
} from "@application/task/usecases/CancelTaskUseCase";
import type { TaskReadQueries } from "@domain/task/queries/TaskReadQueries";
import { toTaskId } from "@domain/task/entities/Task";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";
import { success, error, toHttpResponse } from "@api/http/response";

const HTTP_STATUS: Record<string, ContentfulStatusCode> = {
  TASK_NOT_FOUND: 404,
  TASK_INVALID_STATE: 409,
};

type CreateTaskFn = (req: CreateTaskRequest) => Promise<Result<CreateTaskResponse>>;
type CompleteTaskFn = (req: CompleteTaskRequest) => Promise<Result<CompleteTaskResponse>>;
type CancelTaskFn = (req: CancelTaskRequest) => Promise<Result<CancelTaskResponse>>;

export class TaskController {
  constructor(
    private readonly createTask: CreateTaskFn,
    private readonly completeTask: CompleteTaskFn,
    private readonly cancelTask: CancelTaskFn,
    private readonly taskReadQueries: TaskReadQueries,
  ) {}

  async create(c: Context): Promise<Response> {
    const body = await c.req.json<{
      title: string;
      description?: string;
      priority?: string;
      assigneeId: string;
    }>();

    const result = await this.createTask({
      title: body.title,
      description: body.description || "",
      priority: (body.priority as "low" | "medium" | "high" | "critical") || "medium",
      assigneeId: body.assigneeId,
    });

    enrichHttpRequestEvent(c, { operation: "POST /tasks" });
    return toHttpResponse(c, result, 201, HTTP_STATUS);
  }

  async getById(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return error(c, "MISSING_PARAM", "taskId is required", 400);
    }
    const taskId = toTaskId(rawId);
    const task = await this.taskReadQueries.findById(taskId);
    if (!task) {
      return error(c, "TASK_NOT_FOUND", "Task not found", 404);
    }
    enrichHttpRequestEvent(c, { operation: "GET /tasks/:taskId" });
    return success(c, task);
  }

  async list(c: Context): Promise<Response> {
    const status = c.req.query("status");
    const tasks = status
      ? await this.taskReadQueries.findByStatus(status)
      : await this.taskReadQueries.findAll();
    enrichHttpRequestEvent(c, { operation: "GET /tasks" });
    return success(c, tasks);
  }

  async complete(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return error(c, "MISSING_PARAM", "taskId is required", 400);
    }
    const taskId = toTaskId(rawId);
    const body = await c.req.json<{ actorId: string }>();
    const result = await this.completeTask({ taskId, actorId: body.actorId });
    enrichHttpRequestEvent(c, { operation: "POST /tasks/:taskId/complete" });
    return toHttpResponse(c, result, 200, HTTP_STATUS);
  }

  async cancel(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return error(c, "MISSING_PARAM", "taskId is required", 400);
    }
    const taskId = toTaskId(rawId);
    const body = await c.req.json<{ reason: string }>();
    const result = await this.cancelTask({ taskId, reason: body.reason });
    enrichHttpRequestEvent(c, { operation: "POST /tasks/:taskId/cancel" });
    return toHttpResponse(c, result, 200, HTTP_STATUS);
  }
}
