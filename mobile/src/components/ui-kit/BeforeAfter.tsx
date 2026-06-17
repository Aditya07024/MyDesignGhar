import { useRef, useState } from "react";
import { img } from "@/lib/mock";

export function BeforeAfter({
  beforeSeed,
  afterSeed,
  height = 240,
}: {
  beforeSeed: string;
  afterSeed: string;
  height?: number;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  };

  return (
    <div
      ref={ref}
      className="relative w-full select-none overflow-hidden rounded-2xl"
      style={{ height }}
      onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
      onClick={(e) => move(e.clientX)}
    >
      <img src={img(afterSeed, 800, 600)} alt="After redesign" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={img(beforeSeed, 800, 600)}
          alt="Before redesign"
          className="h-full w-full object-cover"
          style={{ width: ref.current?.offsetWidth ?? 400 }}
        />
        <span className="absolute left-2 top-2 rounded-full bg-secondary/80 px-2.5 py-1 text-[0.65rem] font-semibold text-secondary-foreground">
          BEFORE
        </span>
      </div>
      <span className="absolute right-2 top-2 rounded-full gradient-primary px-2.5 py-1 text-[0.65rem] font-semibold text-primary-foreground">
        AFTER
      </span>
      <div className="absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-2 text-secondary shadow-soft">
          <div className="text-xs font-bold leading-none">⇄</div>
        </div>
      </div>
    </div>
  );
}
