import type { DbClient } from "@config/database";
import type { {{Entity}}Detail, {{Entity}}Summary } from "@domain/{{context}}/queries/{{Entity}}ReadQueries";
import type { {{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";
import { {{context}}s } from "@infrastructure/schema/schema";
import { eq, sql } from "drizzle-orm";

type {{Entity}}Row = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export class {{Entity}}ReadQueries {
  constructor(private readonly db: DbClient) {}

  async findById(id: {{Entity}}Id): Promise<{{Entity}}Detail | null> {
    const row = await this.db
      .select()
      .from({{context}}s)
      .where(eq({{context}}s.id, id))
      .then((rows) => rows[0] as {{Entity}}Row | undefined);
    if (!row) return null;
    return this.toDetail(row);
  }

  async findAll(): Promise<{{Entity}}Summary[]> {
    const rows = (await this.db
      .select({
        id: {{context}}s.id,
        title: {{context}}s.title,
        createdAt: {{context}}s.createdAt,
      })
      .from({{context}}s)
      .orderBy(sql`${ {{context}}s.createdAt } DESC`)
      .limit(100)) as {{Entity}}Summary[];
    return rows;
  }

  private toDetail(row: {{Entity}}Row): {{Entity}}Detail {
    return {
      id: row.id as {{Entity}}Id,
      title: row.title,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
