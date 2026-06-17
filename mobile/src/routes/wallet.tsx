import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { Button, GlassCard, SectionTitle } from "@/components/ui-kit/kit";
import { transactions, walletPackages } from "@/lib/mock";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — MyDesignGhar" }] }),
  component: WalletScreen,
});

function WalletScreen() {
  const { walletBalance, addMoney } = useApp();

  return (
    <MobileScreen showNav>
      <h1 className="pt-2 font-display text-2xl font-extrabold text-foreground">Wallet</h1>

      <div className="gradient-hero relative mt-4 overflow-hidden rounded-3xl p-5 shadow-soft">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/30 blur-2xl" />
        <p className="text-sm text-white/70">Available balance</p>
        <p className="mt-1 font-display text-4xl font-extrabold text-white">₹{walletBalance.toLocaleString("en-IN")}</p>
        <Button size="sm" className="mt-4" icon={<Plus className="h-4 w-4" />} onClick={() => addMoney(499)}>
          Add Money
        </Button>
      </div>

      <SectionTitle>Recharge packages</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {walletPackages.map((p) => (
          <button
            key={p.id}
            onClick={() => addMoney(p.amount + p.bonus)}
            className="rounded-2xl border border-border bg-card p-3 text-center shadow-soft active:scale-95"
          >
            <p className="font-display text-lg font-extrabold text-foreground">₹{p.amount}</p>
            {p.bonus > 0 ? (
              <p className="text-[0.62rem] font-semibold text-success">+₹{p.bonus} bonus</p>
            ) : (
              <p className="text-[0.62rem] text-muted-foreground">Starter</p>
            )}
          </button>
        ))}
      </div>

      <GlassCard className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent">
          <Gift className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Referral earnings</p>
          <p className="text-xs text-muted-foreground">₹450 earned from 3 friends</p>
        </div>
        <Link to="/referral" className="text-sm font-semibold text-primary">
          Invite →
        </Link>
      </GlassCard>

      <SectionTitle>Transactions</SectionTitle>
      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                t.type === "credit" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {t.type === "credit" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.date}</p>
            </div>
            <p className={`font-display font-bold ${t.type === "credit" ? "text-success" : "text-foreground"}`}>
              {t.type === "credit" ? "+" : "-"}₹{t.amount}
            </p>
          </div>
        ))}
      </div>
    </MobileScreen>
  );
}
