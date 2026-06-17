import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui-kit/kit";
import { img } from "@/lib/mock";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — MyDesignGhar" }] }),
  component: Onboarding,
});

const slides = [
  {
    icon: Camera,
    seed: "onb-1",
    title: "Transform Any Room in Seconds",
    desc: "Upload a room photo and get stunning AI redesigns instantly.",
  },
  {
    icon: MapPin,
    seed: "onb-2",
    title: "26 Indian Regional Styles",
    desc: "Discover interiors inspired by Rajasthan, Kerala, Kashmir, Goa, Punjab, Bengal and more.",
  },
  {
    icon: Users,
    seed: "onb-3",
    title: "Talk to Real Designers",
    desc: "Book interior experts directly from the app.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const S = slides[i];
  const Icon = S.icon;

  const next = () => (last ? navigate({ to: "/login" }) : setI(i + 1));

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <img key={S.seed} src={img(S.seed, 900, 1100)} alt="" className="h-full w-full animate-float-up object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button
          onClick={() => navigate({ to: "/login" })}
          className="absolute right-5 top-[max(1.2rem,env(safe-area-inset-top))] rounded-full glass px-4 py-1.5 text-sm font-medium text-foreground"
        >
          Skip
        </button>
      </div>

      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 key={S.title} className="animate-float-up font-display text-2xl font-extrabold text-foreground">
          {S.title}
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{S.desc}</p>

        <div className="mb-5 mt-5 flex gap-1.5">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-7 gradient-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>

        <Button full size="lg" onClick={next}>
          {last ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}
