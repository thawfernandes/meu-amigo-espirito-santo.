interface Props {
  percent: number;
  streak?: number;
}

export function WalkProgress({ percent, streak = 0 }: Props) {
  const p = Math.max(0, Math.min(100, percent));
  const message =
    p >= 80
      ? "Você está brilhando hoje. Continue assim."
      : p >= 50
        ? "Cada passo conta. Estou caminhando com você."
        : "Sinto sua falta — que tal um momento curto com Deus?";

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 animate-fade-up">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Sua Caminhada Cristã
          </p>
          <h3 className="font-display text-2xl sm:text-3xl mt-1">{p}%</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Sequência</p>
          <p className="font-display text-xl">
            {streak} <span className="text-base text-muted-foreground">dias</span>
          </p>
        </div>
      </div>

      <div className="mt-4 h-3 rounded-full bg-secondary overflow-hidden relative">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${p}%`,
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--primary) 90%, white), color-mix(in oklab, var(--success) 80%, var(--primary)))",
          }}
        >
          <div className="absolute inset-0 animate-shimmer opacity-60" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3">{message}</p>
      <p className="text-[11px] text-muted-foreground/80 mt-2">
        Esta barra mede apenas sua constância — nunca sua salvação, santidade ou
        a presença de Deus na sua vida.
      </p>
    </div>
  );
}
