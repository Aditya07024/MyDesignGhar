import { createFileRoute } from "@tanstack/react-router";
import { Copy, Share2, Gift } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button, GlassCard } from "@/components/ui-kit/kit";

export const Route = createFileRoute("/referral")({
  head: () => ({ meta: [{ title: "Refer & Earn — MyDesignGhar" }] }),
  component: Referral,
});

const code = "DemoUser150";
const stats = [
  { label: "Friends joined", value: "3" },
  { label: "Pending", value: "1" },
  { label: "Total earned", value: "₹450" },
];

function Referral() {
  const share = (wa?: boolean) => {
    const text = `Redesign your home with AI on MyDesignGhar! Use my code ${code} for ₹150 off. https://mydesignghar.app`;
    const url = wa
      ? `https://wa.me/?text=${encodeURIComponent(text)}`
      : undefined;
    if (url) window.open(url, "_blank");
    else if (navigator.share) navigator.share({ text }).catch(() => {});
  };

  return (
    <MobileScreen>
      <PageHeader title="Refer & Earn" />

      <div className="gradient-hero relative overflow-hidden rounded-3xl p-6 text-center shadow-soft">
        <Gift className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-3 font-display text-xl font-extrabold text-white">Earn ₹150 per friend</h2>
        <p className="mt-1 text-sm text-white/70">They get ₹150 off too. Everyone wins!</p>
      </div>

      <p className="mb-2 mt-6 text-sm font-bold text-foreground">Your referral code</p>
      <button
        onClick={() => navigator.clipboard?.writeText(code)}
        className="flex w-full items-center justify-between rounded-2xl border border-dashed border-primary bg-primary/5 px-4 py-4"
      >
        <span className="font-display text-xl font-extrabold tracking-widest text-primary">{code}</span>
        <Copy className="h-5 w-5 text-primary" />
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button icon={<Share2 className="h-4 w-4" />} onClick={() => share(false)}>
          Invite Friends
        </Button>
        <Button variant="success" icon={<Share2 className="h-4 w-4" />} onClick={() => share(true)}>
          WhatsApp
        </Button>
      </div>

      <GlassCard className="mt-6">
        <div className="grid grid-cols-3 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-[0.62rem] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </MobileScreen>
  );
}
