import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { img } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyDesignGhar — AI Interior Design for India" },
      { name: "description", content: "AI Interior Design for India. Redesign any room in seconds." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="gradient-hero relative flex h-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />

      <div className="animate-float-up">
        <div className="mx-auto mb-6 grid grid-cols-2 gap-2 [animation:float-up_0.7s_ease-out]">
          {["room-a", "room-b"].map((s, i) => (
            <div key={s} className="overflow-hidden rounded-2xl ring-1 ring-white/15" style={{ animationDelay: `${i * 120}ms` }}>
              <img src={img(s, 300, 300)} alt="" className="h-28 w-28 object-cover" />
            </div>
          ))}
        </div>

        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary shadow-glow">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white">
          MyDesign<span className="text-accent">Ghar</span>
        </h1>
        <p className="mt-2 text-sm text-white/70">AI Interior Design for India</p>
      </div>

      <div className="absolute bottom-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-white/80"
            style={{ animation: `pulse 1s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
