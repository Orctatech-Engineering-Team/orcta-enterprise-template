import { Result } from "@domain/shared";
import {
  {{Entity}},
  type {{Entity}}CreatedData,
  type {{Entity}}Id,
} from "@domain/{{context}}/entities/{{Entity}}";
import type { {{Entity}}Repository } from "@domain/{{context}}/repositories/{{Entity}}Repository";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";

export type Create{{Entity}}Request = {
  title: string;
  description: string;
};

export type Create{{Entity}}Response = {
  id: {{Entity}}Id;
};

export const create{{Entity}}UseCase =
  (
    {{entity}}Repository: {{Entity}}Repository,
    eventPublisher: EventPublisher,
    transaction: TransactionRunner,
  ) =>
  async (request: Create{{Entity}}Request): Promise<Result<Create{{Entity}}Response>> => {
    const {{entity}} = {{Entity}}.create(request satisfies {{Entity}}CreatedData);
    await transaction(async (tx) => {
      await {{entity}}Repository.save({{entity}}, tx);
      await eventPublisher.publishAll({{entity}}.domainEvents, tx);
    });
    {{entity}}.clearDomainEvents();
    return Result.ok({ id: {{entity}}.id });
  };
