import type { TaskId, TaskPriority, TaskStatus } from "@domain/task/entities/Task";

export type TaskSummary = {
  readonly id: TaskId;
  readonly title: string;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
  readonly statusKind: string;
  readonly createdAt: Date;
};

export type TaskDetail = {
  readonly id: TaskId;
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
  readonly status: TaskStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export interface TaskReadQueries {
  findById(id: TaskId): Promise<TaskDetail | null>;
  findAll(): Promise<TaskSummary[]>;
  findByAssignee(assigneeId: string): Promise<TaskSummary[]>;
  findByStatus(statusKind: string): Promise<TaskSummary[]>;
}
