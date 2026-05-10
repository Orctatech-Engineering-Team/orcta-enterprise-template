import type { {{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";

export type {{Entity}}Summary = {
  readonly id: {{Entity}}Id;
  readonly title: string;
  readonly createdAt: Date;
};

export type {{Entity}}Detail = {
  readonly id: {{Entity}}Id;
  readonly title: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export interface {{Entity}}ReadQueries {
  findById(id: {{Entity}}Id): Promise<{{Entity}}Detail | null>;
  findAll(): Promise<{{Entity}}Summary[]>;
}
