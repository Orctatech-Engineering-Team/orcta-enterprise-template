CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"request_id" varchar(36),
	"trace_id" varchar(36),
	"task_id" varchar(26),
	"user_id" varchar(26),
	"actor_type" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" varchar(7) DEFAULT '#6366f1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"priority" varchar(16) DEFAULT 'medium' NOT NULL,
	"assignee_id" varchar(26) NOT NULL,
	"status_kind" varchar(16) NOT NULL,
	"status_data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_outbox_unpublished" ON "outbox_events" USING btree ("published_at","created_at");--> statement-breakpoint
CREATE INDEX "idx_outbox_task" ON "outbox_events" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_outbox_request" ON "outbox_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_outbox_trace" ON "outbox_events" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assignee" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status_kind");--> statement-breakpoint
CREATE INDEX "idx_tasks_active" ON "tasks" USING btree ("assignee_id","status_kind") WHERE "tasks"."status_kind" NOT IN ('done', 'cancelled');