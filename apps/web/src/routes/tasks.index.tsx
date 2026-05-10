import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '~/lib/api-client';
import { TaskCard } from '~/components/compositions/TaskCard';
import { CreateTaskForm } from '~/components/primitives/CreateTaskForm';
import type { CreateTaskRequest } from '~/lib/types/task';

export const Route = createFileRoute('/tasks/')({
  component: TasksIndex,
});

function TasksIndex() {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  });

  const handleCreate = async (data: CreateTaskRequest) => {
    await tasksApi.create(data);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleComplete = async (taskId: string) => {
    await tasksApi.complete(taskId, 'current-user');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleCancel = async (taskId: string) => {
    await tasksApi.cancel(taskId, 'Cancelled from UI');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Tasks</h1>
      <CreateTaskForm onSubmit={handleCreate} />
      <div className="space-y-3">
        {isLoading && <p className="text-[var(--color-text-secondary)]">Loading...</p>}
        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ))}
        {tasks && tasks.length === 0 && (
          <p className="text-[var(--color-text-secondary)] text-center py-8">No tasks yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
