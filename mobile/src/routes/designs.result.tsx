import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, Share2, Bookmark, Download, RefreshCw, Users, Sparkles } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button, GlassCard } from "@/components/ui-kit/kit";
import { BeforeAfter } from "@/components/ui-kit/BeforeAfter";
import { designs } from "@/lib/mock";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/designs/result")({
  head: () => ({ meta: [{ title: "Your Designs — MyDesignGhar" }] }),
  component: Result,
});

const generated = designs.slice(0, 3);

function Result() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useApp();

  return (
    <MobileScreen>
      <PageHeader title="Your AI Designs" subtitle="3 fresh concepts, just for you" />

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-success">
        <Sparkles className="h-5 w-5" />
        <p className="text-sm font-semibold">Designs generated successfully!</p>
      </div>

      <div className="space-y-5">
        {generated.map((d) => {
          const fav = favorites.includes(d.id);
          return (
            <GlassCard key={d.id} className="animate-float-up p-3">
              <BeforeAfter beforeSeed={d.beforeSeed} afterSeed={d.afterSeed} />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.style} · {d.room}</p>
                </div>
                <div className="flex gap-2">
                  <IconBtn active={fav} onClick={() => toggleFavorite(d.id)}>
                    <Heart className={fav ? "fill-current" : ""} />
                  </IconBtn>
                  <IconBtn>
                    <Bookmark />
                  </IconBtn>
                  <IconBtn>
                    <Share2 />
                  </IconBtn>
                </div>
              </div>
              <Button full className="mt-3" icon={<Download className="h-4 w-4" />}>
                Download HD · ₹299
              </Button>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={() => navigate({ to: "/generate" })}>
          Regenerate
        </Button>
        <Button variant="secondary" icon={<Users className="h-4 w-4" />} onClick={() => navigate({ to: "/consultants" })}>
          Book Expert
        </Button>
      </div>
    </MobileScreen>
  );
}

function IconBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-90 ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
      }`}
    >
      <span className="[&>svg]:h-[1.05rem] [&>svg]:w-[1.05rem]">{children}</span>
    </button>
  );
}
