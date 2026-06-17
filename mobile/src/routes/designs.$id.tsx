import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Download, Share2, Trash2, RefreshCw, Heart } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button, EmptyState } from "@/components/ui-kit/kit";
import { BeforeAfter } from "@/components/ui-kit/BeforeAfter";
import { designs, img } from "@/lib/mock";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/designs/$id")({
  head: () => ({ meta: [{ title: "Design — MyDesignGhar" }] }),
  component: DesignDetail,
  errorComponent: () => (
    <MobileScreen>
      <PageHeader title="Design" />
      <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Couldn't load design" body="Please go back and try again." />
    </MobileScreen>
  ),
  notFoundComponent: () => (
    <MobileScreen>
      <PageHeader title="Design" />
      <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Design not found" body="This design no longer exists." />
    </MobileScreen>
  ),
});

function DesignDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useApp();
  const d = designs.find((x) => x.id === id);

  if (!d) {
    return (
      <MobileScreen>
        <PageHeader title="Design" />
        <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Design not found" body="This design no longer exists." />
      </MobileScreen>
    );
  }

  const fav = favorites.includes(d.id);

  return (
    <MobileScreen>
      <PageHeader
        title={d.title}
        subtitle={`${d.style} · ${d.room}`}
        right={
          <button
            onClick={() => toggleFavorite(d.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              fav ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
          </button>
        }
      />

      <img src={img(d.afterSeed, 900, 700)} alt={d.title} className="w-full rounded-3xl object-cover" />

      <h3 className="mb-2 mt-5 text-sm font-bold text-foreground">Before & after</h3>
      <BeforeAfter beforeSeed={d.beforeSeed} afterSeed={d.afterSeed} height={200} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button icon={<Download className="h-4 w-4" />}>
          {d.purchased ? "Download HD" : "Buy HD · ₹299"}
        </Button>
        <Button variant="outline" icon={<Share2 className="h-4 w-4" />}>
          Share
        </Button>
        <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={() => navigate({ to: "/generate" })}>
          Regenerate
        </Button>
        <Button
          variant="ghost"
          className="text-destructive"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => router.history.back()}
        >
          Delete
        </Button>
      </div>
    </MobileScreen>
  );
}
