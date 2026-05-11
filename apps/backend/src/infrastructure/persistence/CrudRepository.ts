import { eq } from "drizzle-orm";
import type { DbClient } from "@config/database";
import { EntityRepository, type EntityRepositoryConfig } from "./EntityRepository";

export class CrudRepository<TRow extends Record<string, unknown>>
  extends EntityRepository<TRow, TRow>
{
  constructor(table: any, db: DbClient, config?: EntityRepositoryConfig) {
    super(table, db, config);
  }

  protected toEntity(row: TRow): TRow {
    return row;
  }

  protected toRow(entity: TRow): Partial<TRow> {
    return entity;
  }

  async insert(entity: TRow): Promise<TRow> {
    const rows = (await this.db
      .insert(this.table)
      .values(entity as any)
      .returning()) as unknown as TRow[];
    return rows[0] as TRow;
  }

  async patch(id: string, data: Partial<TRow>): Promise<TRow | null> {
    const rows = (await this.db
      .update(this.table)
      .set(data as any)
      .where(eq(this.table[this.idColumn], id))
      .returning()) as unknown as TRow[];
    return rows[0] ?? null;
  }
}
