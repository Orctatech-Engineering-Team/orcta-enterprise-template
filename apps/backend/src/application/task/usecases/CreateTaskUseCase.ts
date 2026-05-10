import { Result } from "@domain/shared";
import { Task, type TaskCreatedData, type TaskId } from "@domain/task/entities/Task";
import type { TaskRepository } from "@domain/task/repositories/TaskRepository";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";

export type CreateTaskRequest = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assigneeId: string;
};

export type CreateTaskResponse = {
  id: TaskId;
  statusKind: string;
};

export const createTaskUseCase =
  (
    taskRepository: TaskRepository,
    eventPublisher: EventPublisher,
    transaction: TransactionRunner,
  ) =>
  async (request: CreateTaskRequest): Promise<Result<CreateTaskResponse>> => {
    const task = Task.create(request satisfies TaskCreatedData);
    await transaction(async (tx) => {
      await taskRepository.save(task, tx);
      await eventPublisher.publishAll(task.domainEvents, tx);
    });
    task.clearDomainEvents();
    return Result.ok({ id: task.id, statusKind: "todo" });
  };
