import type { Result } from "@domain/shared";
import type { {{Entity}}, {{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";

export type SaveResult = Promise<Result<void>>;

export interface {{Entity}}Repository {
  findById(id: {{Entity}}Id): Promise<{{Entity}} | null>;
  save({{entity}}: {{Entity}}, tx?: unknown): Promise<void>;
  delete(id: {{Entity}}Id): Promise<void>;
}
