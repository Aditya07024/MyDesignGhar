import type { ButtonHTMLAttributes, ReactNode } from "react";
import { img } from "@/lib/mock";

export function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "outline" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "gradient-primary text-primary-foreground shadow-glow hover:opacity-95",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  success: "bg-success text-success-foreground hover:opacity-90",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-5 text-[0.95rem]",
  lg: "h-14 px-6 text-base",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  icon,
  loading,
  className,
  children,
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("glass rounded-3xl p-4 shadow-soft", className)}>{children}</div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95",
        active
          ? "gradient-primary border-transparent text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  return (
    <img
      src={img(`avatar-${seed}`, size * 2, size * 2)}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover ring-2 ring-background"
      style={{ width: size, height: size }}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl bg-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite] after:bg-gradient-to-r after:from-transparent after:via-card/60 after:to-transparent",
        className,
      )}
    />
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StarRating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-accent">
      <span aria-hidden>★</span>
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {action}
    </div>
  );
}
