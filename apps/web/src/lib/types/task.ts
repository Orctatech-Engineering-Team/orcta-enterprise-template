export type TaskStatus =
    | { kind: "todo" }
    | { kind: "in_progress"; startedAt: string }
    | { kind: "done"; completedAt: string; completedBy: string }
    | { kind: "cancelled"; reason: string; cancelledAt: string };

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskSummary = {
    id: string;
    title: string;
    priority: TaskPriority;
    assigneeId: string;
    statusKind: string;
    createdAt: string;
};

export type TaskDetail = {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
};

export type CreateTaskRequest = {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId: string;
};

export type CreateTaskResponse = {
    id: string;
    statusKind: string;
};
