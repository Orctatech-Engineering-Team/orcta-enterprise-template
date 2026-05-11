import { eq } from "drizzle-orm";
import type { DbClient } from "@config/database";

export type EntityRepositoryConfig = {
  idColumn?: string;
};

export abstract class EntityRepository<TEntity, TRow extends Record<string, unknown>> {
  protected table: any;
  protected db: DbClient;
  protected idColumn: string;

  constructor(table: any, db: DbClient, config: EntityRepositoryConfig = {}) {
    this.table = table;
    this.db = db;
    this.idColumn = config.idColumn ?? "id";
  }

  protected abstract toEntity(row: TRow): TEntity;
  protected abstract toRow(entity: TEntity): Partial<TRow>;

  async findById(id: string): Promise<TEntity | null> {
    const rows = (await this.db
      .select()
      .from(this.table)
      .where(eq(this.table[this.idColumn], id))
      .limit(1)) as unknown as TRow[];
    const row = rows[0];
    if (!row) return null;
    return this.toEntity(row);
  }

  async save(entity: TEntity, tx?: any): Promise<void> {
    const client = tx ?? this.db;
    const data = this.toRow(entity);
    await client.insert(this.table).values(data).onConflictDoUpdate({
      target: this.table[this.idColumn],
      set: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table[this.idColumn], id));
  }

  async exists(id: string): Promise<boolean> {
    const result = (await this.db
      .select({ id: this.table[this.idColumn] })
      .from(this.table)
      .where(eq(this.table[this.idColumn], id))
      .limit(1)) as unknown as { id: string }[];
    return result.length > 0;
  }

  async findAll(): Promise<TEntity[]> {
    const rows = (await this.db.select().from(this.table)) as unknown as TRow[];
    return rows.map((r) => this.toEntity(r));
  }

  protected async findByColumn(col: string, value: unknown): Promise<TEntity[]> {
    const rows = (await this.db
      .select()
      .from(this.table)
      .where(eq(this.table[col], value))) as unknown as TRow[];
    return rows.map((r) => this.toEntity(r));
  }

  protected async findWhere(condition: any): Promise<TEntity[]> {
    const rows = (await this.db.select().from(this.table).where(condition)) as unknown as TRow[];
    return rows.map((r) => this.toEntity(r));
  }

  protected async findRowsWhere(condition: any): Promise<TRow[]> {
    return this.db.select().from(this.table).where(condition) as unknown as TRow[];
  }
}
