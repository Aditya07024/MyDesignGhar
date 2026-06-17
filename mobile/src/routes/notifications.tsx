import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, CheckCircle2, Calendar, Gift } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { EmptyState } from "@/components/ui-kit/kit";
import { notifications, type AppNotification } from "@/lib/mock";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MyDesignGhar" }] }),
  component: Notifications,
});

const icons: Record<AppNotification["type"], typeof Sparkles> = {
  design: Sparkles,
  payment: CheckCircle2,
  reminder: Calendar,
  referral: Gift,
};

function Notifications() {
  return (
    <MobileScreen>
      <PageHeader title="Notifications" />
      {notifications.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-7 w-7" />} title="All caught up" body="You have no new notifications." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type];
            return (
              <div
                key={n.id}
                className={`flex gap-3 rounded-2xl border p-3 ${
                  n.unread ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <span className="text-[0.62rem] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MobileScreen>
  );
}
