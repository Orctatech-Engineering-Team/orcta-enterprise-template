import { describe, it, expect } from "vitest";
import { Task } from "@domain/task/entities/Task";

describe("Task aggregate", () => {
  it("creates a task in todo state", () => {
    const task = Task.create({
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for the backend service",
      priority: "high",
      assigneeId: "user_01",
    });

    expect(task.title).toBe("Set up CI/CD pipeline");
    expect(task.priority).toBe("high");
    expect(task.assigneeId).toBe("user_01");
    expect(task.status.kind).toBe("todo");
  });

  it("emits TaskCreated event on creation", () => {
    const task = Task.create({
      title: "Write integration tests",
      description: "",
      priority: "medium",
      assigneeId: "user_02",
    });

    const events = task.domainEvents;
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("TaskCreated");
  });

  it("transitions from todo to in_progress", () => {
    const task = Task.create({
      title: "Refactor auth module",
      description: "",
      priority: "high",
      assigneeId: "user_01",
    });

    const result = task.start("user_01");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(task.status.kind).toBe("in_progress");
    }
  });

  it("emits TaskStarted event on start", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    expect(task.domainEvents).toHaveLength(2);
    expect(task.domainEvents[1]?.type).toBe("TaskStarted");
  });

  it("rejects start if already in_progress", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    const result = task.start("u1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("TASK_INVALID_STATE");
    }
  });

  it("completes a task from in_progress", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    const result = task.complete("u1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(task.status.kind).toBe("done");
    }
  });

  it("rejects complete from todo state", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    const result = task.complete("u1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("TASK_INVALID_STATE");
    }
  });

  it("cancels a task from in_progress", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    const result = task.cancel("No longer needed");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(task.status.kind).toBe("cancelled");
    }
  });

  it("rejects cancel after done", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    task.complete("u1");
    const result = task.cancel("Oops");
    expect(result.ok).toBe(false);
  });

  it("rejects cancel after already cancelled", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.cancel("Changed mind");
    const result = task.cancel("Changed mind again");
    expect(result.ok).toBe(false);
  });

  it("reconstitutes from persisted data", () => {
    const task = Task.reconstitute({
      id: "01ABCD" as never,
      title: "Reconstituted task",
      description: "Test",
      priority: "critical",
      assigneeId: "user_03",
      status: { kind: "in_progress", startedAt: new Date("2025-01-01") },
      createdAt: new Date("2025-01-01"),
    });

    expect(task.title).toBe("Reconstituted task");
    expect(task.priority).toBe("critical");
    expect(task.status.kind).toBe("in_progress");
    expect(task.domainEvents).toHaveLength(0);
  });

  it("updates priority", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.updatePriority("high");
    expect(task.priority).toBe("high");
  });

  it("rejects priority update on done task", () => {
    const task = Task.create({ title: "x", description: "", priority: "low", assigneeId: "u1" });
    task.start("u1");
    task.complete("u1");
    const result = task.updatePriority("high");
    expect(result.ok).toBe(false);
  });
});
