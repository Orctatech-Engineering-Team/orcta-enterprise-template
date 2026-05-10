import { describe, it, expect, beforeEach } from "vitest";
import { create{{Entity}}UseCase } from "@application/{{context}}/usecases/Create{{Entity}}UseCase";
import { {{Entity}}, type {{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";
import type { {{Entity}}Repository } from "@domain/{{context}}/repositories/{{Entity}}Repository";
import type { EventPublisher, DomainEvent } from "@application/shared/EventPublisher";

class InMemory{{Entity}}Repository implements {{Entity}}Repository {
  private store = new Map<string, {{Entity}}>();

  async findById(id: {{Entity}}Id): Promise<{{Entity}} | null> {
    return this.store.get(id) ?? null;
  }

  async save({{entity}}: {{Entity}}, _tx?: unknown): Promise<void> {
    this.store.set({{entity}}.id, {{entity}});
  }

  async delete(id: {{Entity}}Id): Promise<void> {
    this.store.delete(id);
  }

  getAll(): {{Entity}}[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

class InMemoryEventPublisher implements EventPublisher {
  private events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }

  async publishAll(events: ReadonlyArray<DomainEvent>, _tx?: unknown): Promise<void> {
    this.events.push(...events);
  }

  getEvents(): DomainEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
  }
}

const noopTx = <T>(fn: () => T) => Promise.resolve(fn());

describe("Create{{Entity}}UseCase", () => {
  let {{entity}}Repo: InMemory{{Entity}}Repository;
  let eventPublisher: InMemoryEventPublisher;

  beforeEach(() => {
    {{entity}}Repo = new InMemory{{Entity}}Repository();
    eventPublisher = new InMemoryEventPublisher();
  });

  it("creates a {{entity}} and persists it", async () => {
    const useCase = create{{Entity}}UseCase({{entity}}Repo, eventPublisher, noopTx);

    const result = await useCase({
      title: "Test {{entity}}",
      description: "A test {{entity}}",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect({{entity}}Repo.getAll()).toHaveLength(1);
    }
  });

  it("publishes a {{Entity}}Created domain event", async () => {
    const useCase = create{{Entity}}UseCase({{entity}}Repo, eventPublisher, noopTx);

    await useCase({
      title: "Test {{entity}}",
      description: "",
    });

    const events = eventPublisher.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("{{Entity}}Created");
  });
});
