export { InMemoryEventPublisher } from "@infrastructure/events/EventPublisher";

import type { TaskRepository } from "@domain/task/repositories/TaskRepository";
import { Task, type TaskId } from "@domain/task/entities/Task";

export class InMemoryTaskRepository implements TaskRepository {
  private store = new Map<string, Task>();

  async findById(id: TaskId): Promise<Task | null> {
    return this.store.get(id) ?? null;
  }

  async save(task: Task, _tx?: unknown): Promise<void> {
    this.store.set(task.id, task);
  }

  async delete(id: TaskId): Promise<void> {
    this.store.delete(id);
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return Array.from(this.store.values()).filter((t) => t.assigneeId === assigneeId);
  }

  async findActive(): Promise<Task[]> {
    return Array.from(this.store.values()).filter(
      (t) => t.status.kind === "todo" || t.status.kind === "in_progress",
    );
  }

  seed(task: Task): void {
    this.store.set(task.id, task);
  }

  getAll(): Task[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}
