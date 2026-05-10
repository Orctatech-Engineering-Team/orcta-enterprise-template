import type { DbClient } from "@config/database";
import type { {{Entity}}Repository } from "@domain/{{context}}/repositories/{{Entity}}Repository";
import type { {{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";
import { {{Entity}} } from "@domain/{{context}}/entities/{{Entity}}";
import { {{context}}s } from "@infrastructure/schema/schema";
import { EntityRepository } from "@infrastructure/persistence/EntityRepository";

type {{Entity}}Row = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Postgres{{Entity}}Repository
  extends EntityRepository<{{Entity}}, {{Entity}}Row>
  implements {{Entity}}Repository
{
  constructor(db: DbClient) {
    super({{context}}s, db, { idColumn: "id" });
  }

  protected toEntity(row: {{Entity}}Row): {{Entity}} {
    return {{Entity}}.reconstitute({
      id: row.id as {{Entity}}Id,
      title: row.title,
      description: row.description,
      createdAt: row.createdAt,
    });
  }

  protected toRow({{entity}}: {{Entity}}): Partial<{{Entity}}Row> {
    return {
      id: {{entity}}.id,
      title: {{entity}}.title,
      description: {{entity}}.description,
      createdAt: {{entity}}.createdAt,
      updatedAt: new Date(),
    };
  }
}
