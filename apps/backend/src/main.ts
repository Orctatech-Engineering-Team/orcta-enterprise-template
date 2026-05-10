/**
 * Main Application Entry Point
 *
 * This file:
 * 1. Loads configuration from environment
 * 2. Sets up the database connection
 * 3. Creates the dependency injection container
 * 4. Exports the running application
 *
 * STARTUP PATTERN:
 * const app = await createApp();
 * app.listen(3000);
 *
 * If configuration is missing or database fails to connect,
 * we throw immediately. Better to fail at startup than have
 * a "working" app that's actually broken.
 */

import { loadConfig } from "@config/environment";
import { createDatabaseConnection } from "@config/database";
import { createContainer, type AppContainer } from "@bootstrap/Container";
import { createHttpApp } from "@api/http/app";
import { createAppLogger } from "@infrastructure/logging/logger";

export async function createApp(): Promise<{
  app: ReturnType<typeof createHttpApp>;
  container: AppContainer;
  logger: ReturnType<typeof createAppLogger>;
}> {
  // Load configuration — throws if any required env var is missing
  const config = loadConfig();
  const logger = createAppLogger(config.env);

  logger.info({ feature_flags: config.observability.featureFlags }, "application starting");

  // Connect to database
  const db = await createDatabaseConnection(config.database.connectionString, logger);

  // Build dependency injection container
  const container = createContainer(config, db);
  logger.info("container initialized");

  const app = createHttpApp(container, config, logger);
  return { app, container, logger };
}

// Only run if this is the main module
if (import.meta.main) {
  const { app, logger } = await createApp();
  logger.info("application ready to handle requests");
  Bun.serve({ fetch: app.fetch });
}

export type { AppContainer } from "./bootstrap/Container";
