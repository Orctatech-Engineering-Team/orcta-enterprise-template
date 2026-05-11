import type { DbClient } from "@config/database";
import { PostgresEventPublisher } from "@infrastructure/events/PostgresEventPublisher";
import { composeTaskContext } from "@bootstrap/composers/task";
import type { TaskController } from "@api/http/task/TaskController";
import { crud, type CrudBundle } from "@api/http/crud";
import { tags } from "@infrastructure/schema/schema";

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
  tags: CrudBundle;
};

export function createContainer(config: AppConfig, db: DbClient): AppContainer {
  const eventPublisher = new PostgresEventPublisher(db);
  const transaction = db.transaction.bind(db);

  const taskController = composeTaskContext(db, eventPublisher, transaction);

  const tagsCrud = crud(tags, db, "/tags");

  return {
    taskController,
    tags: tagsCrud,
  };
}
