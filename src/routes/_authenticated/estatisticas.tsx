import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BarChart3, BookOpen, Clock, Flame } from "lucide-react";

export const Route = createFileRoute("/_authenticated/estatisticas")({ component: Stats });

function Stats() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estatísticas</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1">Sua evolução, com carinho.</h1>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Tempo estudando", v: "0 min" },
          { icon: BookOpen, label: "Capítulos lidos", v: "0" },
          { icon: Flame, label: "Maior sequência", v: "0 dias" },
          { icon: BarChart3, label: "Crescimento", v: "—" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-3xl p-5 animate-fade-up">
            <s.icon className="w-5 h-5 text-primary" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-3">{s.label}</p>
            <p className="font-display text-2xl mt-1">{s.v}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-6">Em breve: gráficos detalhados, livros concluídos, versículos favoritos e mais.</p>
    </AppShell>
  );
}
