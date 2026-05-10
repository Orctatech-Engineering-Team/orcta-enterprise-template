/**
 * Database Configuration
 *
 * Sets up the database connection with proper pooling and error handling.
 * Called once at app startup.
 *
 * PERFORMANCE NOTES:
 * - Connection pool size: 20 for production
 * - Idle timeout: 30s — connections freed after inactivity
 * - Max lifetime: 30 minutes — prevents stale connections
 * - Prepared statements cached — prevents compilation overhead
 */

// In production, you would use the postgres or pg-promise libraries
// This is a stub showing the pattern

import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { AppLogger } from "@infrastructure/logging/logger";
import { schema, type Schema } from "@infrastructure/schema/schema";

export type DbClient = PostgresJsDatabase<Schema> & {
  query(sql: string, params: unknown[]): Promise<{ rows: unknown[]; rowCount: number }>;
  end(): Promise<void>;
};

export async function createDatabaseConnection(
  connectionString: string,
  logger: AppLogger,
): Promise<DbClient> {
  const connection = postgres(connectionString, {
    max: 20,
    idle_timeout: 30,
    max_lifetime: 30 * 60,
  });
  const db = drizzle(connection, { schema });

  const databaseUrl = new URL(connectionString);
  const dbLogger = logger.child({
    component: "database",
    host: databaseUrl.host,
    database: databaseUrl.pathname.replace(/^\//, ""),
  });
  dbLogger.info("database pool created");

  return Object.assign(db, {
    query: async (queryText: string, params: unknown[]) => {
      const rows = await connection.unsafe(queryText, params as never[]);
      return { rows: rows as unknown[], rowCount: rows.length };
    },
    end: async () => {
      await connection.end();
      dbLogger.info("database pool closed");
    },
  }) as DbClient;
}
