import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back = true, right }: PageHeaderProps) {
  const router = useRouter();
  return (
    <header className="mb-5 flex items-center gap-3 pt-2">
      {back && (
        <button
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
