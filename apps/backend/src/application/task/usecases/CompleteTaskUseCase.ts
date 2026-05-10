import { Result, DomainError } from "@domain/shared";
import { type TaskId } from "@domain/task/entities/Task";
import type { TaskRepository } from "@domain/task/repositories/TaskRepository";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";

export type CompleteTaskRequest = {
  taskId: TaskId;
  actorId: string;
};

export type CompleteTaskResponse = {
  id: TaskId;
  statusKind: string;
};

export const completeTaskUseCase =
  (
    taskRepository: TaskRepository,
    eventPublisher: EventPublisher,
    transaction: TransactionRunner,
  ) =>
  async (request: CompleteTaskRequest): Promise<Result<CompleteTaskResponse>> => {
    const task = await taskRepository.findById(request.taskId);
    if (!task) {
      return Result.fail(new DomainError("TASK_NOT_FOUND", `Task ${request.taskId} not found`));
    }

    const result = task.complete(request.actorId);
    if (!result.ok) return result;

    await transaction(async (tx) => {
      await taskRepository.save(task, tx);
      await eventPublisher.publishAll(task.domainEvents, tx);
    });
    task.clearDomainEvents();

    return Result.ok({ id: task.id, statusKind: "done" });
  };
