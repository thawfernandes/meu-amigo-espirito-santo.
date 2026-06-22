import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/desafios")({ component: Challenges });

interface Challenge { id: string; title: string; description: string; duration_days: number; }

function Challenges() {
  const [items, setItems] = useState<Challenge[]>([]);
  useEffect(() => {
    supabase.from("challenges").select("*").eq("active", true).then(({ data }) => {
      if (data) setItems(data as Challenge[]);
    });
  }, []);

  return (
    <AppShell>
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Desafios</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1">Pequenos passos. Grandes mudanças.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Desafios mensais para fortalecer sua caminhada — sem competição, com propósito.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <div key={c.id} className="glass rounded-3xl p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{c.duration_days} dias</span>
            </div>
            <h3 className="font-display text-xl mt-3">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
            <button className="mt-4 rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-soft hover:opacity-95">
              Aceitar desafio
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">Carregando desafios...</p>
        )}
      </div>
    </AppShell>
  );
}
