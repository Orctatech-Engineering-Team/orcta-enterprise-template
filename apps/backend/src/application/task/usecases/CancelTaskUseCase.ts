import { Result, DomainError } from "@domain/shared";
import { type TaskId } from "@domain/task/entities/Task";
import type { TaskRepository } from "@domain/task/repositories/TaskRepository";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";

export type CancelTaskRequest = {
  taskId: TaskId;
  reason: string;
};

export type CancelTaskResponse = {
  id: TaskId;
  statusKind: string;
};

export const cancelTaskUseCase =
  (
    taskRepository: TaskRepository,
    eventPublisher: EventPublisher,
    transaction: TransactionRunner,
  ) =>
  async (request: CancelTaskRequest): Promise<Result<CancelTaskResponse>> => {
    const task = await taskRepository.findById(request.taskId);
    if (!task) {
      return Result.fail(new DomainError("TASK_NOT_FOUND", `Task ${request.taskId} not found`));
    }

    const result = task.cancel(request.reason);
    if (!result.ok) return result;

    await transaction(async (tx) => {
      await taskRepository.save(task, tx);
      await eventPublisher.publishAll(task.domainEvents, tx);
    });
    task.clearDomainEvents();

    return Result.ok({ id: task.id, statusKind: "cancelled" });
  };
