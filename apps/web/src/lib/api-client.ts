import type { TaskSummary, TaskDetail, CreateTaskRequest, CreateTaskResponse } from './types/task';

const API_BASE = 'http://localhost:3000';
const API_KEY = 'dev-api-key';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const body = await response.json();
  return body.data as T;
}

export const tasksApi = {
  create: (body: CreateTaskRequest) =>
    request<CreateTaskResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  list: (status?: string) =>
    request<TaskSummary[]>(`/tasks${status ? `?status=${status}` : ''}`),

  getById: (taskId: string) =>
    request<TaskDetail>(`/tasks/${taskId}`),

  complete: (taskId: string, actorId: string) =>
    request<{ id: string; statusKind: string }>(`/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ actorId }),
    }),

  cancel: (taskId: string, reason: string) =>
    request<{ id: string; statusKind: string }>(`/tasks/${taskId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
