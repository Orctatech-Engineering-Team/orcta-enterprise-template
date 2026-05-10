import { Result, DomainError } from "@domain/shared";
import { ulid } from "ulid";

export type {{Entity}}Id = string & { readonly __brand: "{{Entity}}" };

export function create{{Entity}}Id(): {{Entity}}Id {
  return ulid() as {{Entity}}Id;
}

export function to{{Entity}}Id(raw: string): {{Entity}}Id {
  return raw as {{Entity}}Id;
}

export type {{Entity}}CreatedData = {
  readonly title: string;
  readonly description: string;
};

export class {{Entity}} {
  private readonly _id: {{Entity}}Id;
  private readonly _createdAt: Date;
  private _title: string;
  private _description: string;
  private _domainEvents: {{Entity}}DomainEvent[] = [];

  private constructor(
    id: {{Entity}}Id,
    title: string,
    description: string,
    createdAt: Date,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._createdAt = createdAt;
  }

  static create(data: {{Entity}}CreatedData): {{Entity}} {
    const entity = new {{Entity}}(
      create{{Entity}}Id(),
      data.title,
      data.description,
      new Date(),
    );
    entity._domainEvents.push({
      type: "{{Entity}}Created",
      {{entity}}Id: entity._id,
      title: data.title,
      occurredAt: new Date(),
    });
    return entity;
  }

  static reconstitute(data: {
    id: {{Entity}}Id;
    title: string;
    description: string;
    createdAt: Date;
  }): {{Entity}} {
    return new {{Entity}}(
      data.id,
      data.title,
      data.description,
      data.createdAt,
    );
  }

  get id(): {{Entity}}Id {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get description(): string {
    return this._description;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get domainEvents(): ReadonlyArray<{{Entity}}DomainEvent> {
    return this._domainEvents;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  updateTitle(title: string): Result<void> {
    this._title = title;
    this._domainEvents.push({
      type: "{{Entity}}TitleUpdated",
      {{entity}}Id: this._id,
      oldTitle: this._title,
      newTitle: title,
      occurredAt: new Date(),
    });
    return Result.ok(undefined);
  }
}

export type {{Entity}}DomainEvent =
  | {
      type: "{{Entity}}Created";
      {{entity}}Id: {{Entity}}Id;
      title: string;
      occurredAt: Date;
    }
  | {
      type: "{{Entity}}TitleUpdated";
      {{entity}}Id: {{Entity}}Id;
      oldTitle: string;
      newTitle: string;
      occurredAt: Date;
    };
