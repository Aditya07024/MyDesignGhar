import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Edit3, Moon, Sun, Globe, Shield, FileText, Settings, Bell, LogOut } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { Avatar } from "@/components/ui-kit/kit";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — MyDesignGhar" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { userName, theme, toggleTheme, logout } = useApp();
  const dark = theme === "dark";

  return (
    <MobileScreen showNav>
      <h1 className="pt-2 font-display text-2xl font-extrabold text-foreground">Profile</h1>

      <div className="mt-4 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <Avatar seed="me" size={64} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-foreground">{userName} Sharma</p>
          <p className="truncate text-sm text-muted-foreground">DemoUser@email.com</p>
          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
          <Edit3 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left"
        >
          <span className="text-primary">{dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</span>
          <span className="flex-1 font-medium text-foreground">Dark Mode</span>
          <span className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-border"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${dark ? "left-[1.4rem]" : "left-0.5"}`} />
          </span>
        </button>
        <Item icon={<Settings className="h-5 w-5" />} label="Settings" to="/settings" />
        <Item icon={<Bell className="h-5 w-5" />} label="Notifications" to="/notifications" />
        <Item icon={<Globe className="h-5 w-5" />} label="Language" hint="English" />
        <Item icon={<Shield className="h-5 w-5" />} label="Privacy Policy" />
        <Item icon={<FileText className="h-5 w-5" />} label="Terms & Conditions" last />
      </div>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3.5 font-semibold text-destructive"
      >
        <LogOut className="h-5 w-5" /> Log Out
      </button>
    </MobileScreen>
  );
}

function Item({
  icon,
  label,
  hint,
  to,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  to?: string;
  last?: boolean;
}) {
  const inner = (
    <>
      <span className="text-primary">{icon}</span>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </>
  );
  const cls = `flex w-full items-center gap-3 px-4 py-4 text-left ${last ? "" : "border-b border-border"}`;
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button className={cls}>{inner}</button>
  );
}
