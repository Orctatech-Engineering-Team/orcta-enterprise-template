import { describe, it, expect, beforeEach } from "vitest";
import { createTaskUseCase } from "@application/task/usecases/CreateTaskUseCase";
import { InMemoryTaskRepository, InMemoryEventPublisher } from "@config/test-helpers";

const noopTx = <T>(fn: () => T) => Promise.resolve(fn());

describe("CreateTaskUseCase", () => {
  let taskRepo: InMemoryTaskRepository;
  let eventPublisher: InMemoryEventPublisher;

  beforeEach(() => {
    taskRepo = new InMemoryTaskRepository();
    eventPublisher = new InMemoryEventPublisher();
  });

  it("creates a task and persists it", async () => {
    const useCase = createTaskUseCase(taskRepo, eventPublisher, noopTx);

    const result = await useCase({
      title: "Deploy to production",
      description: "Use GitHub Actions",
      priority: "critical",
      assigneeId: "user_01",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statusKind).toBe("todo");
      expect(taskRepo.getAll()).toHaveLength(1);
    }
  });

  it("publishes a TaskCreated domain event", async () => {
    const useCase = createTaskUseCase(taskRepo, eventPublisher, noopTx);

    await useCase({
      title: "Write docs",
      description: "",
      priority: "low",
      assigneeId: "user_02",
    });

    const events = eventPublisher.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("TaskCreated");
  });
});
