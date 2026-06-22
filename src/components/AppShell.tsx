import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, HeartHandshake, Target, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard",  label: "Início",   icon: Home,          color: "from-blue-500 to-indigo-600"   },
  { to: "/biblia",     label: "Bíblia",   icon: BookOpen,      color: "from-amber-400 to-orange-500"  },
  { to: "/estudos",    label: "Estudos",  icon: GraduationCap, color: "from-violet-500 to-purple-600" },
  { to: "/vida",       label: "Vida",     icon: HeartHandshake,color: "from-rose-400 to-pink-600"     },
  { to: "/desafios",   label: "Desafios", icon: Target,        color: "from-emerald-400 to-green-600" },
];

const PAGE_TITLES: Record<string, { label: string; sub?: string; accent: string }> = {
  "/dashboard":    { label: "Amigo,",         sub: "Espírito Santo",  accent: "from-blue-400 to-indigo-400"   },
  "/biblia":       { label: "Bíblia",          sub: "Sua leitura",     accent: "from-amber-300 to-orange-400"  },
  "/estudos":      { label: "Iniciar um",      sub: "Estudo",          accent: "from-violet-400 to-purple-400" },
  "/vida":         { label: "Vida",            sub: "Espiritual",      accent: "from-rose-400 to-pink-400"     },
  "/desafios":     { label: "Desafios",        sub: "do mês",          accent: "from-emerald-400 to-green-400" },
  "/estatisticas": { label: "Estatísticas",    accent: "from-sky-400 to-blue-400"     },
  "/configuracoes":{ label: "Configurações",   accent: "from-slate-400 to-gray-400"   },
};

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const routeKey = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(k => path.startsWith(k)) ?? "/dashboard";
  const title = PAGE_TITLES[routeKey];

  return (
    <div className="min-h-screen gradient-sky text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 pt-4 pb-1">
        <div
          className="rounded-2xl px-5 py-3 flex items-center justify-between max-w-3xl mx-auto"
          style={{
            background: "oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.3), 0 1px 0 oklch(1 0 0 / 0.15) inset",
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-3 group">
            {/* Orb */}
            <span className="relative shrink-0 w-8 h-8">
              <span className="absolute inset-0 rounded-full animate-breath"
                style={{ background: "radial-gradient(circle, oklch(0.82 0.14 85 / 0.6), transparent 70%)" }} />
              <span className="absolute inset-1 rounded-full"
                style={{ background: "radial-gradient(circle, oklch(0.72 0.18 270), oklch(0.58 0.2 290))" }} />
            </span>

            <div className="leading-none">
              <span
                className={`font-display text-base sm:text-lg bg-gradient-to-r ${title.accent} bg-clip-text text-transparent`}
              >
                {title.label}{title.sub ? " " : ""}
                {title.sub && <span className="text-white/90">{title.sub}</span>}
              </span>
            </div>
          </Link>

          {/* Streak / indicator pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/70"
            style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.1)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ao vivo
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="px-4 sm:px-6 pb-36 pt-5 max-w-3xl mx-auto">{children}</main>

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-2xl"
          style={{
            background: "oklch(0.12 0.025 260 / 0.92)",
            backdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            boxShadow: "0 20px 60px oklch(0 0 0 / 0.5), 0 1px 0 oklch(1 0 0 / 0.15) inset",
          }}
        >
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center justify-center rounded-xl px-3.5 py-2 text-[10px] transition-all duration-200 relative overflow-hidden"
                style={active ? {
                  background: "oklch(1 0 0 / 0.12)",
                  boxShadow: "0 4px 16px oklch(0 0 0 / 0.3)",
                } : undefined}
              >
                <span
                  className={`transition-all duration-200 ${
                    active
                      ? `bg-gradient-to-br ${n.color} bg-clip-text text-transparent`
                      : "text-white/40"
                  }`}
                >
                  <Icon className="w-5 h-5" style={active ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined} />
                </span>
                <span className={`mt-0.5 font-medium transition-all ${active ? "text-white" : "text-white/40"}`}>
                  {n.label}
                </span>
                {active && (
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${n.color}`}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
