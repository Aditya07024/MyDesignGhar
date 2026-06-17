import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui-kit/kit";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify OTP — MyDesignGhar" }] }),
  component: Otp,
});

function Otp() {
  const navigate = useNavigate();
  const login = useApp((s) => s.login);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setAt = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };

  const verify = () => {
    login();
    navigate({ to: "/home" });
  };

  return (
    <div className="flex h-full flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-extrabold text-foreground">Verify your number</h1>
      <p className="mt-1 text-muted-foreground">We've sent a 4-digit code to your phone. Enter it below.</p>

      <div className="mt-8 flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => setAt(i, e.target.value)}
            className="h-16 w-14 rounded-2xl border border-border bg-card text-center text-2xl font-bold text-foreground outline-none focus:border-primary focus:shadow-glow"
          />
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn't get the code? <span className="font-semibold text-primary">Resend in 28s</span>
      </p>

      <Button full size="lg" className="mt-8" onClick={verify}>
        Verify & Continue
      </Button>
    </div>
  );
}
