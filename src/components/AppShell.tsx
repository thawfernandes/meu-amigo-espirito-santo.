import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, HeartHandshake, Target, BarChart3, Settings } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/vida", label: "Vida", icon: HeartHandshake },
  { to: "/desafios", label: "Desafios", icon: Target },
  { to: "/estatisticas", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen gradient-sky">
      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 pt-4">
        <div className="glass rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="relative inline-block w-7 h-7">
              <span className="absolute inset-0 rounded-full animate-breath"
                style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 50%, transparent), transparent 70%)" }}/>
              <span className="absolute inset-1 rounded-full"
                style={{ background: "radial-gradient(circle, var(--primary), color-mix(in oklab, var(--primary) 60%, white))" }}/>
            </span>
            <span className="font-display text-lg leading-none">
              Amigo, <span className="text-gradient">Espírito Santo</span>
            </span>
          </Link>
          <Link
            to="/configuracoes"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4" /> Ajustes
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-8 pb-32 pt-6 max-w-6xl mx-auto">{children}</main>

      {/* Bottom nav (mobile-first, also visible on desktop floating) */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-1 shadow-lift">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center rounded-full px-4 py-2 text-[11px] transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="mt-0.5">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
