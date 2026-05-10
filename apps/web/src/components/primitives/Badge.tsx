interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";

  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-[var(--color-status-success)]/10 text-[var(--color-status-success)]",
    warning: "bg-[var(--color-status-warning)]/10 text-[var(--color-status-warning)]",
    error: "bg-[var(--color-status-error)]/10 text-[var(--color-status-error)]",
    info: "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}