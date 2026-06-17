import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Users, Wallet, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/designs", label: "Designs", icon: LayoutGrid },
  { to: "/consultants", label: "Experts", icon: Users },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="glass absolute inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(to + "/");
        return (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.65rem] font-medium transition-colors"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                active ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.2} />
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
