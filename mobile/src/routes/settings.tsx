import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Globe, Bell, Shield } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — MyDesignGhar" }] }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const { theme, toggleTheme } = useApp();
  const [toggles, setToggles] = useState({ push: true, email: false, privacy: true });

  const groups = [
    {
      title: "Theme",
      icon: <Moon className="h-5 w-5" />,
      rows: [{ label: "Dark mode", on: theme === "dark", toggle: toggleTheme }],
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      rows: [
        { label: "Push notifications", on: toggles.push, toggle: () => setToggles((t) => ({ ...t, push: !t.push })) },
        { label: "Email updates", on: toggles.email, toggle: () => setToggles((t) => ({ ...t, email: !t.email })) },
      ],
    },
    {
      title: "Privacy",
      icon: <Shield className="h-5 w-5" />,
      rows: [{ label: "Personalized recommendations", on: toggles.privacy, toggle: () => setToggles((t) => ({ ...t, privacy: !t.privacy })) }],
    },
  ];

  return (
    <MobileScreen>
      <PageHeader title="Settings" />

      {groups.map((g) => (
        <div key={g.title} className="mb-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="text-primary">{g.icon}</span> {g.title}
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            {g.rows.map((r, i) => (
              <div key={r.label} className={`flex items-center px-4 py-4 ${i ? "border-t border-border" : ""}`}>
                <span className="flex-1 font-medium text-foreground">{r.label}</span>
                <button
                  onClick={r.toggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${r.on ? "bg-primary" : "bg-border"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${r.on ? "left-[1.4rem]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-primary"><Globe className="h-5 w-5" /></span> Language
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {["English", "हिन्दी", "தமிழ்", "বাংলা"].map((l, i) => (
          <button key={l} className={`flex w-full items-center px-4 py-4 text-left ${i ? "border-t border-border" : ""}`}>
            <span className="flex-1 font-medium text-foreground">{l}</span>
            {i === 0 && <span className="text-sm font-semibold text-primary">Selected</span>}
          </button>
        ))}
      </div>
    </MobileScreen>
  );
}
