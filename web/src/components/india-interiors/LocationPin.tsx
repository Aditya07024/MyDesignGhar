interface LocationPinProps {
  x: number;
  y: number;
  reducedMotion: boolean;
}

export default function LocationPin({ x, y, reducedMotion }: LocationPinProps) {
  return (
    <g
      className={`india-pin${reducedMotion ? ' reduced-motion' : ''}`}
      transform={`translate(${x}, ${y})`}
      aria-hidden="true"
    >
      <ellipse className="india-pin-shadow" cx="0" cy="26" rx="14" ry="4" />
      <circle className="india-pin-halo" cx="0" cy="-2" r="28" />
      <path
        className="india-pin-body"
        d="M0 -20C-9.5 -20 -17 -12.8 -17 -4.2C-17 6 0 24 0 24C0 24 17 6 17 -4.2C17 -12.8 9.5 -20 0 -20Z"
      />
      <circle className="india-pin-core" cx="0" cy="-4" r="5.5" />
    </g>
  );
}
