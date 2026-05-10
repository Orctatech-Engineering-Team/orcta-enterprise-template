import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    const baseStyles =
      "w-full h-10 px-3 rounded-md border transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-offset-1";

    const stateStyles = error
      ? "border-[var(--color-status-error)] focus:border-[var(--color-status-error)] focus:ring-[var(--color-status-error)]"
      : "border-[var(--color-border-default)] focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${stateStyles} bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-[var(--color-status-error)]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";