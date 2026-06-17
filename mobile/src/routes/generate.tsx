import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, ImagePlus, Mic, Wand2, Sparkles } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button, Chip, GlassCard } from "@/components/ui-kit/kit";
import { roomTypes, modernStyles, regionalStyles, budgets, img } from "@/lib/mock";

export const Route = createFileRoute("/generate")({
  head: () => ({ meta: [{ title: "Generate Design — MyDesignGhar" }] }),
  component: Generate,
});

function Generate() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const [room, setRoom] = useState("living");
  const [styleTab, setStyleTab] = useState<"modern" | "regional">("modern");
  const [style, setStyle] = useState("Modern");
  const [budget, setBudget] = useState(budgets[1]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(15);

  useEffect(() => {
    if (!loading) return;
    if (count <= 0) {
      navigate({ to: "/designs/result" });
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 220);
    return () => clearTimeout(t);
  }, [loading, count, navigate]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Designing your space…</h2>
          <p className="mt-1 text-muted-foreground">Crafting {style} {roomTypes.find((r) => r.id === room)?.name}</p>
        </div>
        {/* <p className="text-sm text-muted-foreground">Estimated time: ~{Math.max(count, 0)}s</p> */}
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div className="h-full gradient-primary transition-all" style={{ width: `${((15 - count) / 15) * 100}%` }} />
        </div>
      </div>
    );
  }

  const styles = styleTab === "modern" ? modernStyles : regionalStyles;

  return (
    <MobileScreen>
      <PageHeader title="Generate Design" subtitle="Upload, customize and create" />

      {/* Upload */}
      {uploaded ? (
        <div className="relative overflow-hidden rounded-3xl">
          <img src={img(`upload-${room}`, 800, 500)} alt="Uploaded room" className="h-48 w-full object-cover" />
          <button
            onClick={() => setUploaded(false)}
            className="absolute right-3 top-3 rounded-full glass px-3 py-1 text-xs font-semibold text-foreground"
          >
            Change
          </button>
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center gap-3 border-2 border-dashed py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
            <ImagePlus className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-foreground">Upload a room photo</p>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" icon={<Camera className="h-4 w-4" />} onClick={() => setUploaded(true)}>
              Take Photo
            </Button>
            <Button size="sm" icon={<ImagePlus className="h-4 w-4" />} onClick={() => setUploaded(true)}>
              Gallery
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Room type */}
      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Room type</h3>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {roomTypes.map((r) => (
          <Chip key={r.id} active={room === r.id} onClick={() => setRoom(r.id)}>
            {r.emoji} {r.name}
          </Chip>
        ))}
      </div>

      {/* Style tabs */}
      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Style</h3>
      <div className="mb-3 flex rounded-2xl bg-muted p-1">
        {(["modern", "regional"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setStyleTab(t);
              setStyle(t === "modern" ? modernStyles[0] : regionalStyles[0]);
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-all ${
              styleTab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t} Styles
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {styles.map((s) => (
          <Chip key={s} active={style === s} onClick={() => setStyle(s)}>
            {s}
          </Chip>
        ))}
      </div>

      {/* Budget */}
      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Budget</h3>
      <div className="grid grid-cols-2 gap-2">
        {budgets.map((b) => (
          <button
            key={b}
            onClick={() => setBudget(b)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              budget === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Describe your vision</h3>
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="e.g. warm earthy tones, lots of plants, cozy reading nook…"
          className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
          <Mic className="h-5 w-5" />
        </button>
      </div>

      <Button full size="lg" className="mt-6" icon={<Wand2 className="h-5 w-5" />} onClick={() => setLoading(true)}>
        Generate 3 Designs
      </Button>
    </MobileScreen>
  );
}
