import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Video } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Avatar, Button, EmptyState } from "@/components/ui-kit/kit";
import { sessions } from "@/lib/mock";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "My Sessions — MyDesignGhar" }] }),
  component: Sessions,
});

function Sessions() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = sessions.filter((s) => s.status === tab);

  return (
    <MobileScreen>
      <PageHeader title="My Sessions" />

      <div className="mb-4 flex rounded-2xl bg-muted p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Calendar className="h-7 w-7" />} title={`No ${tab} sessions`} body="Book a designer to get started." />
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <div key={s.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar seed={s.avatarSeed} size={48} />
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground">{s.consultant}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {s.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.time}</span>
                  </div>
                </div>
              </div>
              {s.status === "upcoming" && (
                <Button full size="sm" className="mt-3" icon={<Video className="h-4 w-4" />}>
                  Join Session
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </MobileScreen>
  );
}
