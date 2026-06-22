import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: Settings });

function Settings() {
  return (
    <AppShell>
      <div className="animate-fade-up max-w-xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ajustes</p>
        <h1 className="font-display text-3xl mt-1">Personalize sua experiência</h1>
        <div className="mt-6 glass rounded-3xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Mais opções chegando em breve: tema, fonte, sons, notificações, exportar dados.</p>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="rounded-2xl border px-4 py-2 text-sm hover:bg-accent"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </AppShell>
  );
}
