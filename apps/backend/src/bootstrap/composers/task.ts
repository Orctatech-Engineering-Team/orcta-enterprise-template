import type { DbClient } from "@config/database";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";
import { createTaskUseCase } from "@application/task/usecases/CreateTaskUseCase";
import { completeTaskUseCase } from "@application/task/usecases/CompleteTaskUseCase";
import { cancelTaskUseCase } from "@application/task/usecases/CancelTaskUseCase";
import { TaskController } from "@api/http/task/TaskController";
import { PostgresTaskRepository } from "@infrastructure/persistence/PostgresTaskRepository";
import { TaskReadQueries } from "@infrastructure/persistence/TaskReadQueries";

export function composeTaskContext(
  db: DbClient,
  eventPublisher: EventPublisher,
  transaction: TransactionRunner,
): TaskController {
  const taskRepository = new PostgresTaskRepository(db);
  const taskReadQueries = new TaskReadQueries(db);

  const createTask = createTaskUseCase(taskRepository, eventPublisher, transaction);
  const completeTask = completeTaskUseCase(taskRepository, eventPublisher, transaction);
  const cancelTask = cancelTaskUseCase(taskRepository, eventPublisher, transaction);

  return new TaskController(createTask, completeTask, cancelTask, taskReadQueries);
}
