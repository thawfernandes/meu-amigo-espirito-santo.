import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HeartHandshake, Flame, Sparkles, CheckCircle2, BookHeart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vida")({ component: Vida });

const sections = [
  { icon: HeartHandshake, title: "Orações", desc: "Registre seus pedidos e veja Deus respondendo." },
  { icon: Flame, title: "Jejuns", desc: "Marque datas e propósitos dos seus jejuns." },
  { icon: Sparkles, title: "Propósitos", desc: "Compromissos que você decide cultivar." },
  { icon: CheckCircle2, title: "Respondidas", desc: "Celebre cada oração que foi atendida." },
  { icon: BookHeart, title: "Testemunhos", desc: "Guarde memórias da bondade de Deus." },
];

function Vida() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vida espiritual</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1">Sua jornada com Deus, organizada.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Um espaço acolhedor para registrar tudo o que importa — sem julgamento, com gratidão.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="glass rounded-3xl p-5 animate-fade-up hover:-translate-y-0.5 hover:shadow-lift transition-all">
            <s.icon className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg mt-3">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            <button className="mt-4 text-xs rounded-full px-3 py-1.5 glass hover:bg-accent">Em breve</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
