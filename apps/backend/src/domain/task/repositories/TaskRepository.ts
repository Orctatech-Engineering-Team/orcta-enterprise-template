import type { Result } from "@domain/shared";
import type { Task, TaskId } from "@domain/task/entities/Task";

export type SaveResult = Promise<Result<void>>;

export interface TaskRepository {
  findById(id: TaskId): Promise<Task | null>;
  save(task: Task, tx?: unknown): Promise<void>;
  delete(id: TaskId): Promise<void>;
  findByAssignee(assigneeId: string): Promise<Task[]>;
  findActive(): Promise<Task[]>;
}
