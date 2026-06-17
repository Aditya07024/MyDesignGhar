import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, ImageOff } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { Button, Chip, EmptyState } from "@/components/ui-kit/kit";
import { designs, img } from "@/lib/mock";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/designs/")({
  head: () => ({ meta: [{ title: "My Designs — MyDesignGhar" }] }),
  component: MyDesigns,
});

const filters = ["All", "Purchased", "Favorites", "Recent"] as const;

function MyDesigns() {
  const navigate = useNavigate();
  const favorites = useApp((s) => s.favorites);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let l = designs;
    if (filter === "Purchased") l = l.filter((d) => d.purchased);
    if (filter === "Favorites") l = l.filter((d) => favorites.includes(d.id));
    if (filter === "Recent") l = l.slice(0, 4);
    if (q.trim()) l = l.filter((d) => (d.title + d.style + d.room).toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [filter, q, favorites]);

  return (
    <MobileScreen showNav>
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-display text-2xl font-extrabold text-foreground">My Designs</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => navigate({ to: "/generate" })}>
          New
        </Button>
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search designs"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        {filters.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<ImageOff className="h-7 w-7" />}
          title="No designs yet"
          body="Generate your first AI redesign to see it here."
          action={
            <Button onClick={() => navigate({ to: "/generate" })}>Create a design</Button>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {list.map((d) => (
            <Link
              key={d.id}
              to="/designs/$id"
              params={{ id: d.id }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={img(d.afterSeed, 400, 300)} alt={d.title} className="h-full w-full object-cover transition-transform group-active:scale-105" />
                {d.purchased && (
                  <span className="absolute left-2 top-2 rounded-full bg-success px-2 py-0.5 text-[0.6rem] font-bold text-success-foreground">
                    HD
                  </span>
                )}
                {favorites.includes(d.id) && (
                  <span className="absolute right-2 top-2 text-sm">❤️</span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold text-foreground">{d.title}</p>
                <p className="text-[0.7rem] text-muted-foreground">{d.style} · {d.date}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MobileScreen>
  );
}
