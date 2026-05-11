import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { TaskStatus } from "@domain/task/entities/Task";
import type { TaskDomainEvent } from "@domain/task/entities/Task";

export const tasks = pgTable(
  "tasks",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    priority: varchar("priority", { length: 16 }).notNull().default("medium"),
    assigneeId: varchar("assignee_id", { length: 26 }).notNull(),
    statusKind: varchar("status_kind", { length: 16 }).notNull(),
    statusData: jsonb("status_data").$type<TaskStatus>().notNull(),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_tasks_assignee").on(table.assigneeId),
    index("idx_tasks_status").on(table.statusKind),
    index("idx_tasks_active")
      .on(table.assigneeId, table.statusKind)
      .where(sql`${table.statusKind} NOT IN ('done', 'cancelled')`),
  ],
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#6366f1"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<TaskDomainEvent>().notNull(),
    requestId: varchar("request_id", { length: 36 }),
    traceId: varchar("trace_id", { length: 36 }),
    taskId: varchar("task_id", { length: 26 }),
    userId: varchar("user_id", { length: 26 }),
    actorType: varchar("actor_type", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("idx_outbox_unpublished").on(table.publishedAt, table.createdAt),
    index("idx_outbox_task").on(table.taskId),
    index("idx_outbox_request").on(table.requestId),
    index("idx_outbox_trace").on(table.traceId),
  ],
);

export const schema = {
  tasks,
  tags,
  outboxEvents,
} as const;

export type Schema = typeof schema;
