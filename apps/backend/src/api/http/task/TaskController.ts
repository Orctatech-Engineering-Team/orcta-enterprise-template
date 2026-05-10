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
import { getRequestId } from "@api/http/request-context";

const HTTP_STATUS: Record<string, ContentfulStatusCode> = {
  TASK_NOT_FOUND: 404,
  TASK_INVALID_STATE: 409,
};

function toHttpResponse<T>(
  c: Context,
  result: Result<T>,
  successStatus: ContentfulStatusCode = 200,
): Response {
  if (result.ok) {
    return c.json(result.value, successStatus);
  }
  return c.json(
    { error: result.error.code, message: result.error.message, requestId: getRequestId(c) },
    HTTP_STATUS[result.error.code] ?? 400,
  );
}

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
    return toHttpResponse(c, result, 201);
  }

  async getById(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return c.json(
        { error: "MISSING_PARAM", message: "taskId is required", requestId: getRequestId(c) },
        400,
      );
    }
    const taskId = toTaskId(rawId);
    const task = await this.taskReadQueries.findById(taskId);
    if (!task) {
      return c.json(
        { error: "TASK_NOT_FOUND", message: "Task not found", requestId: getRequestId(c) },
        404,
      );
    }
    enrichHttpRequestEvent(c, { operation: "GET /tasks/:taskId" });
    return c.json(task, 200);
  }

  async list(c: Context): Promise<Response> {
    const status = c.req.query("status");
    const tasks = status
      ? await this.taskReadQueries.findByStatus(status)
      : await this.taskReadQueries.findAll();
    enrichHttpRequestEvent(c, { operation: "GET /tasks" });
    return c.json(tasks, 200);
  }

  async complete(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return c.json(
        { error: "MISSING_PARAM", message: "taskId is required", requestId: getRequestId(c) },
        400,
      );
    }
    const taskId = toTaskId(rawId);
    const body = await c.req.json<{ actorId: string }>();
    const result = await this.completeTask({ taskId, actorId: body.actorId });
    enrichHttpRequestEvent(c, { operation: "POST /tasks/:taskId/complete" });
    return toHttpResponse(c, result);
  }

  async cancel(c: Context): Promise<Response> {
    const rawId = c.req.param("taskId");
    if (!rawId) {
      return c.json(
        { error: "MISSING_PARAM", message: "taskId is required", requestId: getRequestId(c) },
        400,
      );
    }
    const taskId = toTaskId(rawId);
    const body = await c.req.json<{ reason: string }>();
    const result = await this.cancelTask({ taskId, reason: body.reason });
    enrichHttpRequestEvent(c, { operation: "POST /tasks/:taskId/cancel" });
    return toHttpResponse(c, result);
  }
}
