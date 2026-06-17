import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CreditCard } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { PageHeader } from "@/components/mobile/PageHeader";
import { Button, Chip, GlassCard } from "@/components/ui-kit/kit";
import { consultants, timeSlots } from "@/lib/mock";

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : "c1" }),
  head: () => ({ meta: [{ title: "Book a Session — MyDesignGhar" }] }),
  component: Booking,
});

const days = [
  { d: "Mon", n: 9 },
  { d: "Tue", n: 10 },
  { d: "Wed", n: 11 },
  { d: "Thu", n: 12 },
  { d: "Fri", n: 13 },
];

function Booking() {
  const { c } = Route.useSearch();
  const navigate = useNavigate();
  const consultant = consultants.find((x) => x.id === c) ?? consultants[0];
  const [day, setDay] = useState(10);
  const [slot, setSlot] = useState(timeSlots[1]);
  const [step, setStep] = useState<"select" | "pay" | "done">("select");

  if (step === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <CheckCircle2 className="h-20 w-20 text-success" />
        <h1 className="font-display text-2xl font-extrabold text-foreground">Booking confirmed!</h1>
        <p className="text-muted-foreground">
          Your session with <span className="font-semibold text-foreground">{consultant.name}</span> is set for Jun {day}, {slot}.
        </p>
        <Button className="mt-2" onClick={() => navigate({ to: "/sessions" })}>
          View my sessions
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/home" })}>
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <MobileScreen>
      <PageHeader title={step === "select" ? "Book Session" : "Payment"} subtitle={consultant.name} />

      {step === "select" ? (
        <>
          <h3 className="mb-2 text-sm font-bold text-foreground">Select a date</h3>
          <div className="flex gap-2">
            {days.map((dd) => (
              <button
                key={dd.n}
                onClick={() => setDay(dd.n)}
                className={`flex-1 rounded-2xl border py-3 text-center transition-all ${
                  day === dd.n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="block text-[0.65rem]">{dd.d}</span>
                <span className="block font-display text-lg font-bold">{dd.n}</span>
              </button>
            ))}
          </div>

          <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Select a time</h3>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((t) => (
              <Chip key={t} active={slot === t} onClick={() => setSlot(t)}>
                {t}
              </Chip>
            ))}
          </div>

          <GlassCard className="mt-6">
            <h3 className="mb-2 text-sm font-bold text-foreground">Booking summary</h3>
            <Row label="Designer" value={consultant.name} />
            <Row label="Date & time" value={`Jun ${day}, ${slot}`} />
            <Row label="Session fee" value={`₹${consultant.price}`} />
          </GlassCard>

          <Button full size="lg" className="mt-6" onClick={() => setStep("pay")}>
            Proceed to Payment
          </Button>
        </>
      ) : (
        <>
          <GlassCard>
            <h3 className="mb-2 text-sm font-bold text-foreground">Order summary</h3>
            <Row label="Consultation" value={`₹${consultant.price}`} />
            <Row label="Platform fee" value="₹49" />
            <div className="my-2 border-t border-border" />
            <Row label="Total" value={`₹${consultant.price + 49}`} bold />
          </GlassCard>

          <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Payment method</h3>
          {["UPI", "Credit / Debit Card", "Wallet Balance"].map((m, i) => (
            <label key={m} className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
              <input type="radio" name="pay" defaultChecked={i === 0} className="accent-[var(--color-primary)]" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{m}</span>
            </label>
          ))}

          <Button full size="lg" className="mt-6" onClick={() => setStep("done")}>
            Pay ₹{consultant.price + 49}
          </Button>
        </>
      )}
    </MobileScreen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${bold ? "font-display text-base font-extrabold text-foreground" : "font-semibold text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
