import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, Briefcase } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { Avatar, Chip, StarRating } from "@/components/ui-kit/kit";
import { consultants } from "@/lib/mock";

export const Route = createFileRoute("/consultants/")({
  head: () => ({ meta: [{ title: "Consultants — MyDesignGhar" }] }),
  component: Consultants,
});

const sortFilters = ["Top Rated", "Nearby", "Budget", "Experience"];

function Consultants() {
  const [active, setActive] = useState("Top Rated");

  return (
    <MobileScreen showNav>
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Designers</h1>
          <p className="text-sm text-muted-foreground">Book verified interior experts</p>
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card">
          <SlidersHorizontal className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        {sortFilters.map((f) => (
          <Chip key={f} active={active === f} onClick={() => setActive(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {consultants.map((c) => (
          <Link
            key={c.id}
            to="/consultants/$id"
            params={{ id: c.id }}
            className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft active:scale-[0.99]"
          >
            <Avatar seed={c.avatarSeed} size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-display font-bold text-foreground">{c.name}</p>
                <StarRating value={c.rating} />
              </div>
              <p className="truncate text-sm text-muted-foreground">{c.specialty}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {c.experience} yrs
                </span>
                <span>·</span>
                <span>{c.state}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-base font-extrabold text-primary">₹{c.price}</p>
              <p className="text-[0.62rem] text-muted-foreground">/session</p>
            </div>
          </Link>
        ))}
      </div>
    </MobileScreen>
  );
}
