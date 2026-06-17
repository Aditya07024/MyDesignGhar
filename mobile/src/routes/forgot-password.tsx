import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui-kit/kit";
import { Field } from "./login";
import { PageHeader } from "@/components/mobile/PageHeader";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — MyDesignGhar" }] }),
  component: Forgot,
});

function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email address.");
    setErr("");
    setSent(true);
  };

  return (
    <div className="h-full px-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title="Forgot password" />
      {sent ? (
        <div className="flex flex-col items-center pt-16 text-center">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">Check your inbox</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
          <Button className="mt-8" onClick={() => navigate({ to: "/login" })}>
            Back to login
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <Field icon={<Mail className="h-5 w-5" />} placeholder="Email address" value={email} onChange={setEmail} inputMode="email" />
          {err && <p className="mt-3 text-sm font-medium text-destructive">{err}</p>}
          <Button full size="lg" className="mt-6" onClick={submit}>
            Send reset link
          </Button>
        </>
      )}
    </div>
  );
}
