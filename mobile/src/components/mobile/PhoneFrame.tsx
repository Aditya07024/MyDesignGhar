import type { ReactNode } from "react";

/**
 * Centers the app inside a phone-sized canvas on larger screens and goes
 * edge-to-edge on actual mobile devices.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted text-foreground sm:flex sm:items-center sm:justify-center sm:py-6">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-background sm:h-[900px] sm:rounded-[2.4rem] sm:border sm:border-border sm:shadow-soft">
        {children}
      </div>
    </div>
  );
}
