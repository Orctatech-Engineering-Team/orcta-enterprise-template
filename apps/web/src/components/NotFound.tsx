export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-[var(--color-text-secondary)]">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-[var(--color-brand-primary)] text-white px-2 py-1 rounded-sm uppercase font-black text-sm"
        >
          Go back
        </button>
      </p>
    </div>
  )
}