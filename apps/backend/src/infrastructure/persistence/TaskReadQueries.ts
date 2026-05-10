import type { DbClient } from "@config/database";
import type { TaskDetail, TaskSummary } from "@domain/task/queries/TaskReadQueries";
import type { TaskId, TaskPriority, TaskStatus } from "@domain/task/entities/Task";
import { tasks } from "@infrastructure/schema/schema";
import { eq, sql } from "drizzle-orm";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  priority: string;
  assigneeId: string;
  statusKind: string;
  statusData: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class TaskReadQueries {
  constructor(private readonly db: DbClient) {}

  async findById(id: TaskId): Promise<TaskDetail | null> {
    const row = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .then((rows) => rows[0] as TaskRow | undefined);
    if (!row) return null;
    return this.toDetail(row);
  }

  async findAll(): Promise<TaskSummary[]> {
    const rows = (await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
        statusKind: tasks.statusKind,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .orderBy(sql`${tasks.createdAt} DESC`)
      .limit(100)) as TaskSummary[];
    return rows;
  }

  async findByAssignee(assigneeId: string): Promise<TaskSummary[]> {
    const rows = (await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
        statusKind: tasks.statusKind,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(eq(tasks.assigneeId, assigneeId))
      .orderBy(sql`${tasks.createdAt} DESC`)) as TaskSummary[];
    return rows;
  }

  async findByStatus(statusKind: string): Promise<TaskSummary[]> {
    const rows = (await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
        statusKind: tasks.statusKind,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(eq(tasks.statusKind, statusKind))
      .orderBy(sql`${tasks.createdAt} DESC`)) as TaskSummary[];
    return rows;
  }

  private toDetail(row: TaskRow): TaskDetail {
    return {
      id: row.id as TaskId,
      title: row.title,
      description: row.description,
      priority: row.priority as TaskPriority,
      assigneeId: row.assigneeId,
      status: row.statusData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
