import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
        Orcta Enterprise Template
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-6">
        A DDD + Hexagonal Architecture TypeScript template.
      </p>
      <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
        This template includes a working Task Management example domain that demonstrates:
        Discriminated Unions, Result&lt;T,E&gt;, Branded Types, CQRS, Domain Events,
        Repository Pattern, and In-Memory Test Doubles.
      </p>
      <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
        Delete the Task domain and replace with your own business logic.
      </p>
      <div className="flex gap-4">
        <Link
          to="/tasks"
          className="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          View Tasks
        </Link>
      </div>
    </div>
  );
}
