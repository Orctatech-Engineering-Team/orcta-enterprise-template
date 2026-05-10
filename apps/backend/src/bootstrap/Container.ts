import type { DbClient } from "@config/database";
import { PostgresEventPublisher } from "@infrastructure/events/PostgresEventPublisher";
import { composeTaskContext } from "@bootstrap/composers/task";
import type { TaskController } from "@api/http/task/TaskController";

export type Environment = "production" | "staging" | "test";

export type AppConfig = {
  env: Environment;
  database: {
    connectionString: string;
  };
  auth: {
    apiKeys: string[];
  };
  observability: {
    env: Environment;
    deploymentId: string;
    serviceVersion: string;
    featureFlags: string[];
    successSampleRate: number;
    slowRequestThresholdMs: number;
  };
};

export type AppContainer = {
  taskController: TaskController;
};

export function createContainer(config: AppConfig, db: DbClient): AppContainer {
  const eventPublisher = new PostgresEventPublisher(db);
  const transaction = db.transaction.bind(db);

  const taskController = composeTaskContext(db, eventPublisher, transaction);

  return {
    taskController,
  };
}
