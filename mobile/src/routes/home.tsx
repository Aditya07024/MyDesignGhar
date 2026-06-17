import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Sparkles, Wand2, LayoutGrid, MapPin, Users, Wallet, TrendingUp } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { Avatar, Button, GlassCard, SectionTitle } from "@/components/ui-kit/kit";
import { roomTypes, homeStats, quickActions, img } from "@/lib/mock";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — MyDesignGhar" }] }),
  component: HomeScreen,
});

const qaIcons: Record<string, typeof LayoutGrid> = {
  gallery: LayoutGrid,
  map: MapPin,
  users: Users,
  wallet: Wallet,
};
const statIcons: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  wallet: Wallet,
  users: Users,
};

function HomeScreen() {
  const navigate = useNavigate();
  const userName = useApp((s) => s.userName);

  return (
    <MobileScreen showNav>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar seed="me" size={44} />
          <div>
            <p className="text-sm text-muted-foreground">Namaste 🙏</p>
            <p className="font-display text-lg font-bold leading-tight text-foreground">{userName}</p>
          </div>
        </div>
        <Link
          to="/notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
        >
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Link>
      </div>

      {/* Hero banner */}
      <div className="gradient-hero relative mt-5 overflow-hidden rounded-3xl p-5 shadow-soft">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/30 blur-2xl" />
        <span className="rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold text-white">AI POWERED</span>
        <h2 className="mt-3 max-w-[14rem] font-display text-2xl font-extrabold text-white">
          Redesign Your Room Today
        </h2>
        <p className="mt-1 text-sm text-white/70">Upload a photo, pick a style, get magic.</p>
        <Button size="sm" className="mt-4" icon={<Wand2 className="h-4 w-4" />} onClick={() => navigate({ to: "/generate" })}>
          Generate Design
        </Button>
      </div>

      {/* Room types */}
      <SectionTitle>Choose a room</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        {roomTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate({ to: "/generate" })}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="relative h-16 w-full overflow-hidden rounded-2xl border border-border">
              <img src={img(r.seed, 160, 160)} alt={r.name} className="h-full w-full object-cover" />
            </div>
            <span className="text-[0.68rem] font-medium leading-tight text-muted-foreground">{r.name}</span>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => {
          const Icon = qaIcons[a.icon];
          return (
            <Link key={a.id} to={a.to} className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[0.68rem] font-medium leading-tight text-muted-foreground">{a.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <SectionTitle action={<TrendingUp className="h-4 w-4 text-success" />}>Your impact</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {homeStats.map((s) => {
          const Icon = statIcons[s.icon];
          return (
            <GlassCard key={s.label} className="p-3 text-center">
              <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="font-display text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-[0.62rem] leading-tight text-muted-foreground">{s.label}</p>
            </GlassCard>
          );
        })}
      </div>
    </MobileScreen>
  );
}
