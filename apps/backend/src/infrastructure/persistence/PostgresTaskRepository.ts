import type { DbClient } from "@config/database";
import type { TaskRepository } from "@domain/task/repositories/TaskRepository";
import type { TaskId, TaskStatus, TaskPriority } from "@domain/task/entities/Task";
import { Task } from "@domain/task/entities/Task";
import { tasks } from "@infrastructure/schema/schema";
import { EntityRepository } from "@infrastructure/persistence/EntityRepository";
import { and, inArray } from "drizzle-orm";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  priority: string;
  assigneeId: string;
  statusKind: string;
  statusData: TaskStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PostgresTaskRepository
  extends EntityRepository<Task, TaskRow>
  implements TaskRepository
{
  constructor(db: DbClient) {
    super(tasks, db, { idColumn: "id" });
  }

  protected toEntity(row: TaskRow): Task {
    return Task.reconstitute({
      id: row.id as TaskId,
      title: row.title,
      description: row.description,
      priority: row.priority as TaskPriority,
      assigneeId: row.assigneeId,
      status: row.statusData,
      createdAt: row.createdAt,
    });
  }

  protected toRow(task: Task): Partial<TaskRow> {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assigneeId,
      statusKind: task.status.kind,
      statusData: task.status,
      createdAt: task.createdAt,
      updatedAt: new Date(),
    };
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.findByColumn("assigneeId", assigneeId);
  }

  async findActive(): Promise<Task[]> {
    return this.findWhere(and(inArray(this.table.statusKind, ["todo", "in_progress"])));
  }
}
