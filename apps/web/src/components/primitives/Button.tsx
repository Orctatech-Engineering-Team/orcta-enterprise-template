import { forwardRef, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles =
      "inline-flex items-center justify-center font-semibold cursor-pointer transition-all duration-fast rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] hover:opacity-90 focus:ring-[var(--color-brand-primary)]",
      secondary:
        "bg-transparent text-[var(--color-brand-primary)] border border-[var(--color-border-brand)] hover:bg-[var(--color-brand-primary)] hover:text-white focus:ring-[var(--color-brand-primary)]",
      ghost:
        "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-page)] focus:ring-[var(--color-border-strong)]",
      danger:
        "bg-[var(--color-status-error)] text-[var(--color-text-inverse)] hover:opacity-90 focus:ring-[var(--color-status-error)]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    };

    const disabledStyles = isDisabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "active:scale-[0.98]";

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";