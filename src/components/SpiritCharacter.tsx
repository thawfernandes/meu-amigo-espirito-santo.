import { useMemo } from "react";

type Mood = "happy" | "calm" | "celebrate" | "miss" | "pray" | "sleep";

interface Props {
  mood?: Mood;
  size?: number;
  className?: string;
}

/**
 * "Espírito Santo" — representação artística (luz viva / chama delicada).
 * Não é um rosto humano; apenas uma presença luminosa que incentiva a caminhada.
 */
export function SpiritCharacter({ mood = "calm", size = 180, className = "" }: Props) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        dx: (Math.random() * 60 - 30).toFixed(0) + "px",
        dy: (-30 - Math.random() * 50).toFixed(0) + "px",
        delay: (i * 0.4).toFixed(2) + "s",
        left: 30 + Math.random() * 40,
      })),
    [],
  );

  const intensity =
    mood === "celebrate" ? 1.25 : mood === "miss" ? 0.7 : mood === "sleep" ? 0.55 : 1;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Espírito Santo, presença luminosa que acompanha sua caminhada"
    >
      {/* Halo */}
      <div
        className="absolute inset-0 rounded-full animate-breath"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--gold) 30%, transparent) 0%, color-mix(in oklab, var(--primary) 22%, transparent) 35%, transparent 70%)",
          filter: "blur(10px)",
          opacity: 0.85 * intensity,
        }}
      />
      {/* Halo externo */}
      <div
        className="absolute -inset-6 rounded-full animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary-soft) 60%, transparent) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* Chama / luz */}
      <svg
        viewBox="0 0 100 130"
        width={size * 0.7}
        height={size * 0.85}
        className="relative z-10 animate-float-slow drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
      >
        <defs>
          <radialGradient id="flameInner" cx="50%" cy="65%" r="60%">
            <stop offset="0%" stopColor="oklch(0.99 0.05 95)" />
            <stop offset="40%" stopColor="oklch(0.92 0.12 90)" />
            <stop offset="75%" stopColor="oklch(0.78 0.18 70)" />
            <stop offset="100%" stopColor="oklch(0.66 0.16 252)" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="flameOuter" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor="oklch(0.85 0.14 252)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.66 0.16 252)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Aura azul ao redor */}
        <path
          d="M50 5 C28 35 12 55 12 80 a38 38 0 0 0 76 0 c0 -25 -16 -45 -38 -75 Z"
          fill="url(#flameOuter)"
          className="animate-breath"
        />
        {/* Chama principal */}
        <path
          d="M50 18 C36 42 24 58 24 80 a26 26 0 0 0 52 0 c0 -22 -12 -38 -26 -62 Z"
          fill="url(#flameInner)"
        />
        {/* Núcleo brilhante */}
        <ellipse cx="50" cy="86" rx="10" ry="14" fill="oklch(0.99 0.04 95)" opacity="0.9" />
      </svg>

      {/* Partículas */}
      <div className="absolute inset-0 pointer-events-none">
        {sparks.map((s, i) => (
          <span
            key={i}
            className="absolute block w-1.5 h-1.5 rounded-full"
            style={
              {
                left: `${s.left}%`,
                bottom: "30%",
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--gold) 80%, white) 0%, transparent 70%)",
                animation: `spark 2.4s ease-out ${s.delay} infinite`,
                ["--dx" as string]: s.dx,
                ["--dy" as string]: s.dy,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
