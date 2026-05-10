import type { TaskSummary } from '~/lib/types/task';

type TaskCardProps = {
  task: TaskSummary;
  onComplete?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export function TaskCard({ task, onComplete, onCancel }: TaskCardProps) {
  return (
    <div className="border border-[var(--color-border-default)] rounded-lg p-4 bg-[var(--color-surface-card)]">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--color-text-primary)]">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-page)] text-[var(--color-text-secondary)]">
            {statusLabels[task.statusKind] || task.statusKind}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">
          Assignee: {task.assigneeId}
        </span>
        <div className="flex gap-2">
          {task.statusKind === 'in_progress' && onComplete && (
            <button
              onClick={() => onComplete(task.id)}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
          {(task.statusKind === 'todo' || task.statusKind === 'in_progress') && onCancel && (
            <button
              onClick={() => onCancel(task.id)}
              className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
