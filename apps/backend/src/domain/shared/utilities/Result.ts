/**
 * Result<T, E> — Functional error handling without exceptions in domain logic.
 *
 * WHY: Exceptions are invisible in type signatures. A function returning
 * Result<Order, DomainError> makes it impossible to ignore failure.
 * The compiler forces the caller to handle both cases.
 *
 * PERFORMANCE NOTE: This is a value type — no heap allocation beyond
 * the wrapped value itself. Zero overhead vs throwing exceptions,
 * and exceptions are far more expensive (stack unwinding).
 */
export type Result<T, E = DomainError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },

  fail<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },

  // Unwrap or throw — use only at application layer boundaries
  unwrap<T>(result: Result<T, DomainError>): T {
    if (result.ok) return result.value;
    throw new Error(result.error.message);
  },
};

/**
 * Base domain error — all domain errors extend this.
 * Errors are values, not exceptions. They carry meaning.
 */
export class DomainError {
  constructor(
    readonly code: string,
    readonly message: string,
    readonly context?: Record<string, unknown>,
  ) {}

  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
