import { Result, DomainError } from "@domain/shared";
import { ulid } from "ulid";

export type TaskId = string & { readonly __brand: "Task" };

export function createTaskId(): TaskId {
  return ulid() as TaskId;
}

export function toTaskId(raw: string): TaskId {
  return raw as TaskId;
}

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskStatus =
  | { kind: "todo" }
  | { kind: "in_progress"; startedAt: Date }
  | { kind: "done"; completedAt: Date; completedBy: string }
  | { kind: "cancelled"; reason: string; cancelledAt: Date };

export type TaskCreatedData = {
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
};

export class Task {
  private readonly _id: TaskId;
  private readonly _createdAt: Date;
  private _status: TaskStatus;
  private _title: string;
  private _description: string;
  private _priority: TaskPriority;
  private _assigneeId: string;
  private _domainEvents: TaskDomainEvent[] = [];

  private constructor(
    id: TaskId,
    title: string,
    description: string,
    priority: TaskPriority,
    assigneeId: string,
    status: TaskStatus,
    createdAt: Date,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._priority = priority;
    this._assigneeId = assigneeId;
    this._status = status;
    this._createdAt = createdAt;
  }

  static create(data: TaskCreatedData): Task {
    const task = new Task(
      createTaskId(),
      data.title,
      data.description,
      data.priority,
      data.assigneeId,
      { kind: "todo" },
      new Date(),
    );
    task._domainEvents.push({
      type: "TaskCreated",
      taskId: task._id,
      title: data.title,
      priority: data.priority,
      assigneeId: data.assigneeId,
      occurredAt: new Date(),
    });
    return task;
  }

  static reconstitute(data: {
    id: TaskId;
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: string;
    status: TaskStatus;
    createdAt: Date;
  }): Task {
    return new Task(
      data.id,
      data.title,
      data.description,
      data.priority,
      data.assigneeId,
      data.status,
      data.createdAt,
    );
  }

  get id(): TaskId {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get description(): string {
    return this._description;
  }
  get priority(): TaskPriority {
    return this._priority;
  }
  get assigneeId(): string {
    return this._assigneeId;
  }
  get status(): TaskStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get domainEvents(): ReadonlyArray<TaskDomainEvent> {
    return this._domainEvents;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  start(_actorId: string): Result<void> {
    if (this._status.kind !== "todo") {
      return Result.fail(
        new DomainError(
          "TASK_INVALID_STATE",
          `Cannot start task in '${this._status.kind}' state — must be 'todo'`,
        ),
      );
    }
    this._status = { kind: "in_progress", startedAt: new Date() };
    this._domainEvents.push({
      type: "TaskStarted",
      taskId: this._id,
      assigneeId: this._assigneeId,
      occurredAt: new Date(),
    });
    return Result.ok(undefined);
  }

  complete(actorId: string): Result<void> {
    if (this._status.kind !== "in_progress") {
      return Result.fail(
        new DomainError(
          "TASK_INVALID_STATE",
          `Cannot complete task in '${this._status.kind}' state — must be 'in_progress'`,
        ),
      );
    }
    this._status = { kind: "done", completedAt: new Date(), completedBy: actorId };
    this._domainEvents.push({
      type: "TaskCompleted",
      taskId: this._id,
      completedBy: actorId,
      occurredAt: new Date(),
    });
    return Result.ok(undefined);
  }

  cancel(reason: string): Result<void> {
    if (this._status.kind === "done" || this._status.kind === "cancelled") {
      return Result.fail(
        new DomainError("TASK_INVALID_STATE", `Cannot cancel task in '${this._status.kind}' state`),
      );
    }
    this._status = { kind: "cancelled", reason, cancelledAt: new Date() };
    this._domainEvents.push({
      type: "TaskCancelled",
      taskId: this._id,
      reason,
      occurredAt: new Date(),
    });
    return Result.ok(undefined);
  }

  updatePriority(priority: TaskPriority): Result<void> {
    if (this._status.kind === "done" || this._status.kind === "cancelled") {
      return Result.fail(
        new DomainError(
          "TASK_INVALID_STATE",
          `Cannot update priority in '${this._status.kind}' state`,
        ),
      );
    }
    this._priority = priority;
    this._domainEvents.push({
      type: "TaskPriorityUpdated",
      taskId: this._id,
      oldPriority: this._priority,
      newPriority: priority,
      occurredAt: new Date(),
    });
    return Result.ok(undefined);
  }
}

export type TaskDomainEvent =
  | {
      type: "TaskCreated";
      taskId: TaskId;
      title: string;
      priority: TaskPriority;
      assigneeId: string;
      occurredAt: Date;
    }
  | { type: "TaskStarted"; taskId: TaskId; assigneeId: string; occurredAt: Date }
  | { type: "TaskCompleted"; taskId: TaskId; completedBy: string; occurredAt: Date }
  | { type: "TaskCancelled"; taskId: TaskId; reason: string; occurredAt: Date }
  | {
      type: "TaskPriorityUpdated";
      taskId: TaskId;
      oldPriority: TaskPriority;
      newPriority: TaskPriority;
      occurredAt: Date;
    };
