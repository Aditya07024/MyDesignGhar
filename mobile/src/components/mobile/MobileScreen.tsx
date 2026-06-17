import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface MobileScreenProps {
  children: ReactNode;
  showNav?: boolean;
  /** Removes default padding for full-bleed screens (splash, onboarding). */
  bare?: boolean;
  className?: string;
}

export function MobileScreen({ children, showNav = false, bare = false, className = "" }: MobileScreenProps) {
  return (
    <div className="relative flex h-full flex-col">
      <div
        className={`no-scrollbar flex-1 overflow-y-auto ${bare ? "" : "px-5 pt-[max(1rem,env(safe-area-inset-top))]"} ${
          showNav ? "pb-28" : "pb-8"
        } ${className}`}
      >
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
