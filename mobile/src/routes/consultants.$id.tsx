import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, Star, Calendar } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Avatar, Button, EmptyState, GlassCard, StarRating } from "@/components/ui-kit/kit";
import { consultants, reviews, img } from "@/lib/mock";

export const Route = createFileRoute("/consultants/$id")({
  head: () => ({ meta: [{ title: "Designer — MyDesignGhar" }] }),
  component: ConsultantDetail,
  errorComponent: () => (
    <MobileScreen>
      <PageHeader title="Designer" />
      <EmptyState icon={<Star className="h-6 w-6" />} title="Couldn't load" body="Please try again." />
    </MobileScreen>
  ),
  notFoundComponent: () => (
    <MobileScreen>
      <PageHeader title="Designer" />
      <EmptyState icon={<Star className="h-6 w-6" />} title="Not found" body="This designer doesn't exist." />
    </MobileScreen>
  ),
});

function ConsultantDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = consultants.find((x) => x.id === id);

  if (!c) {
    return (
      <MobileScreen>
        <PageHeader title="Designer" />
        <EmptyState icon={<Star className="h-6 w-6" />} title="Not found" body="This designer doesn't exist." />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen className="pb-32">
      <PageHeader title="Profile" />

      <div className="flex flex-col items-center text-center">
        <Avatar seed={c.avatarSeed} size={88} />
        <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">{c.name}</h1>
        <p className="text-sm text-muted-foreground">{c.specialty} · {c.state}</p>
        <div className="mt-3 flex gap-3">
          <Stat label="Rating" value={`${c.rating}★`} />
          <Stat label="Reviews" value={`${c.reviews}`} />
          <Stat label="Experience" value={`${c.experience}y`} />
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">About</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{c.bio}</p>

      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Portfolio</h3>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
        {c.portfolio.map((p) => (
          <img key={p} src={img(p, 360, 360)} alt="" className="h-32 w-32 shrink-0 rounded-2xl object-cover" />
        ))}
      </div>

      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Availability</h3>
      <GlassCard className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-primary" />
        <p className="text-sm text-foreground">Next available: <span className="font-semibold">Tomorrow, 11:30 AM</span></p>
      </GlassCard>

      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Reviews</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{r.name}</p>
              <StarRating value={r.rating} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="glass absolute inset-x-0 bottom-0 flex items-center gap-3 border-t px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div>
          <p className="font-display text-lg font-extrabold text-primary">₹{c.price}</p>
          <p className="text-[0.62rem] text-muted-foreground">per session</p>
        </div>
        <Button full icon={<Briefcase className="h-4 w-4" />} onClick={() => navigate({ to: "/booking", search: { c: c.id } })}>
          Book Consultation
        </Button>
      </div>
    </MobileScreen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-4 py-2 text-center">
      <p className="font-display font-extrabold text-foreground">{value}</p>
      <p className="text-[0.62rem] text-muted-foreground">{label}</p>
    </div>
  );
}
