import { ulid } from "ulid";
import { Hono } from "hono";
import type { Context } from "hono";
import type { DbClient } from "@config/database";
import { CrudRepository } from "@infrastructure/persistence/CrudRepository";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";
import { success, error } from "@api/http/response";

export type CrudConfig<TRow extends Record<string, unknown>> = {
  idColumn?: string;
  generateId?: () => string;
  timestamps?: boolean;
  handlers?: {
    create?: (body: Record<string, unknown>, repo: CrudRepository<TRow>, c: Context) => Promise<Response>;
    update?: (id: string, body: Record<string, unknown>, repo: CrudRepository<TRow>, c: Context) => Promise<Response>;
    delete?: (id: string, repo: CrudRepository<TRow>, c: Context) => Promise<Response>;
  };
};

export type CrudController = {
  create(c: Context): Promise<Response>;
  list(c: Context): Promise<Response>;
  getById(c: Context): Promise<Response>;
  update(c: Context): Promise<Response>;
  delete(c: Context): Promise<Response>;
};

export type CrudBundle = {
  controller: CrudController;
  router: Hono;
};

export function crud<TRow extends Record<string, unknown>>(
  table: any,
  db: DbClient,
  path: string,
  config: CrudConfig<TRow> = {},
): CrudBundle {
  const repo = new CrudRepository<TRow>(table, db, {
    idColumn: config.idColumn ?? "id",
  });
  const generateId = config.generateId ?? ulid;
  const timestamps = config.timestamps ?? true;

  function getIdParam(c: Context): string | null {
    const id = c.req.param("id");
    return id ?? null;
  }

  const controller: CrudController = {
    async create(c) {
      if (config.handlers?.create) {
        return config.handlers.create(await c.req.json(), repo, c);
      }
      const body = await c.req.json<Record<string, unknown>>();
      const now = new Date();
      const entity = {
        id: generateId(),
        ...body,
        ...(timestamps ? { createdAt: now, updatedAt: now } : {}),
      } as unknown as TRow;
      const row = await repo.insert(entity);
      enrichHttpRequestEvent(c, { operation: `POST ${path}` });
      return success(c, row, 201);
    },

    async getById(c) {
      const id = getIdParam(c);
      if (!id) {
        return error(c, "MISSING_PARAM", "id is required", 400);
      }
      const row = await repo.findById(id);
      if (!row) {
        return error(c, "NOT_FOUND", "Resource not found", 404);
      }
      enrichHttpRequestEvent(c, { operation: `GET ${path}/:id` });
      return success(c, row);
    },

    async list(c) {
      const rows = await repo.findAll();
      enrichHttpRequestEvent(c, { operation: `GET ${path}` });
      return success(c, rows);
    },

    async update(c) {
      const id = getIdParam(c);
      if (!id) {
        return error(c, "MISSING_PARAM", "id is required", 400);
      }
      if (config.handlers?.update) {
        return config.handlers.update(id, await c.req.json(), repo, c);
      }
      const existing = await repo.findById(id);
      if (!existing) {
        return error(c, "NOT_FOUND", "Resource not found", 404);
      }
      const body = await c.req.json<Record<string, unknown>>();
      const now = new Date();
      const data = { ...body, ...(timestamps ? { updatedAt: now } : {}) } as Partial<TRow>;
      const row = await repo.patch(id, data);
      enrichHttpRequestEvent(c, { operation: `PATCH ${path}/:id` });
      return success(c, row);
    },

    async delete(c) {
      const id = getIdParam(c);
      if (!id) {
        return error(c, "MISSING_PARAM", "id is required", 400);
      }
      if (config.handlers?.delete) {
        return config.handlers.delete(id, repo, c);
      }
      const existing = await repo.findById(id);
      if (!existing) {
        return error(c, "NOT_FOUND", "Resource not found", 404);
      }
      await repo.delete(id);
      enrichHttpRequestEvent(c, { operation: `DELETE ${path}/:id` });
      return c.body(null, 204);
    },
  };

  const router = new Hono()
    .post(path, (c) => controller.create(c))
    .get(path, (c) => controller.list(c))
    .get(`${path}/:id`, (c) => controller.getById(c))
    .patch(`${path}/:id`, (c) => controller.update(c))
    .delete(`${path}/:id`, (c) => controller.delete(c));

  return { controller, router };
}
