import { useState } from 'react';
import type { CreateTaskRequest, TaskPriority } from '~/lib/types/task';

type CreateTaskFormProps = {
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
};

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title, description, priority, assigneeId });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssigneeId('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--color-border-default)] rounded-lg p-4 bg-[var(--color-surface-card)] space-y-3">
      <h2 className="font-semibold text-[var(--color-text-primary)]">Create Task</h2>
      <div>
        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded text-sm"
          placeholder="What needs to be done?"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded text-sm"
          rows={2}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Assignee ID *</label>
          <input
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded text-sm"
            placeholder="user_01"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting || !title.trim() || !assigneeId.trim()}
        className="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
      >
        {submitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
