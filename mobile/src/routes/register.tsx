import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Phone, Mail, Lock, Gift } from "lucide-react";
import { Button } from "@/components/ui-kit/kit";
import { Field } from "./login";
import { useApp } from "@/store/app";
import { useSignUp } from "@clerk/clerk-react";
import { useSyncMutation } from "@/hooks/useApi";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — MyDesignGhar" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const login = useApp((s) => s.login);
  const syncMutation = useSyncMutation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [f, setF] = useState({ name: "", phone: "", email: "", pwd: "", referralCode: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const submit = async () => {
    if (!isLoaded) return;
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^\d{10}$/.test(f.phone)) return setErr("Enter a valid 10-digit phone number.");
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr("Enter a valid email address.");
    if (f.pwd.length < 4) return setErr("Password must be at least 4 characters.");
    setErr("");
    setLoading(true);

    try {
      // Clerk phone numbers require country prefix format (+91 for India)
      const formattedPhone = f.phone.startsWith("+") ? f.phone : `+91${f.phone}`;

      const result = await signUp.create({
        phoneNumber: formattedPhone,
        emailAddress: f.email || undefined,
        password: f.pwd,
        firstName: f.name.trim().split(" ")[0],
        lastName: f.name.trim().split(" ").slice(1).join(" ") || undefined,
      });

      if (result.status === "complete") {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }

        // Sync profile metadata with backend & apply referral code credit
        syncMutation.mutate(f.referralCode || undefined, {
          onSuccess: (data) => {
            login(result.createdSessionId ?? undefined, data.user);
            navigate({ to: "/home" });
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with database failed.");
            setLoading(false);
          }
        });
      } else {
        setErr("Please complete verification steps to finish signup.");
        setLoading(false);
      }
    } catch (error: any) {
      setErr(error.errors?.[0]?.message || "Registration failed. Try checking details.");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-extrabold text-foreground">Create account</h1>
        <p className="mt-1 text-muted-foreground">Join thousands designing smarter homes.</p>
      </div>

      <div className="space-y-4">
        <Field icon={<User className="h-5 w-5" />} placeholder="Full name" value={f.name} onChange={set("name")} />
        <Field icon={<Phone className="h-5 w-5" />} placeholder="Phone number" value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} />
        <Field icon={<Mail className="h-5 w-5" />} placeholder="Email address (optional)" value={f.email} onChange={set("email")} inputMode="email" />
        <Field icon={<Lock className="h-5 w-5" />} placeholder="Password" value={f.pwd} onChange={set("pwd")} type="password" />
        <Field icon={<Gift className="h-5 w-5" />} placeholder="Referral code (optional)" value={f.referralCode} onChange={set("referralCode")} />
      </div>

      {err && <p className="mt-3 text-sm font-medium text-destructive">{err}</p>}

      <Button full size="lg" className="mt-6" onClick={submit} loading={loading}>
        Create Account
      </Button>

      <p className="mt-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
