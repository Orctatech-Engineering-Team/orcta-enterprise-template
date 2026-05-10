import {
  ErrorComponent,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  console.error(error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          type="button"
          onClick={() => {
            router.invalidate()
          }}
          className="px-2 py-1 bg-[var(--color-brand-primary)] rounded-sm text-white uppercase font-extrabold"
        >
          Try Again
        </button>
        <button
          type="button"
          className="px-2 py-1 bg-[var(--color-border-strong)] rounded-sm text-white uppercase font-extrabold"
          onClick={(e) => {
            e.preventDefault()
            window.history.back()
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}