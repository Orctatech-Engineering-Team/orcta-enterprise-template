import type { DbClient } from "@config/database";
import type { EventPublisher } from "@application/shared/EventPublisher";
import type { TransactionRunner } from "@domain/shared";
import { create{{Entity}}UseCase } from "@application/{{context}}/usecases/Create{{Entity}}UseCase";
import { {{Entity}}Controller } from "@api/http/{{context}}/{{Entity}}Controller";
import { Postgres{{Entity}}Repository } from "@infrastructure/persistence/Postgres{{Entity}}Repository";
import { {{Entity}}ReadQueries } from "@infrastructure/persistence/{{Entity}}ReadQueries";

export function compose{{Context}}Context(
  db: DbClient,
  eventPublisher: EventPublisher,
  transaction: TransactionRunner,
): {{Entity}}Controller {
  const {{entity}}Repository = new Postgres{{Entity}}Repository(db);
  const {{entity}}ReadQueries = new {{Entity}}ReadQueries(db);

  const create{{Entity}} = create{{Entity}}UseCase({{entity}}Repository, eventPublisher, transaction);

  return new {{Entity}}Controller(create{{Entity}}, {{entity}}ReadQueries);
}
