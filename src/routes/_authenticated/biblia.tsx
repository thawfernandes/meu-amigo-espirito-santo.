import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Type, Minus, Plus, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/_authenticated/biblia")({
  component: Bible,
});

const SAMPLE_VERSES = [
  { v: 1, t: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." },
  { v: 2, t: "Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele." },
  { v: 3, t: "Quem crê nele não é condenado; mas quem não crê já está condenado, porquanto não crê no nome do unigênito Filho de Deus." },
  { v: 4, t: "E o motivo da condenação é este: a luz veio ao mundo, e os homens amaram mais as trevas do que a luz, porque as suas obras eram más." },
  { v: 5, t: "Pois todo aquele que faz o mal aborrece a luz e não vem para a luz, para que as suas obras não sejam reprovadas." },
];

function Bible() {
  const [font, setFont] = useState<number>(() => Number(localStorage.getItem("bible.font") || 18));
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("bible.dark") === "1");
  const [focus, setFocus] = useState(false);
  const [book] = useState("João");
  const [chapter] = useState(3);

  useEffect(() => { localStorage.setItem("bible.font", String(font)); }, [font]);
  useEffect(() => {
    localStorage.setItem("bible.dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("reading_progress").upsert({
          user_id: u.user.id, version: "NVI", book, chapter, verse: 1,
        });
      }
    })();
  }, [book, chapter]);

  return (
    <AppShell>
      <div className={`glass-strong rounded-3xl p-6 sm:p-10 ${focus ? "max-w-2xl mx-auto" : ""}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Leitura — NVI</p>
            <h1 className="font-display text-3xl">{book} {chapter}</h1>
          </div>
          <div className="flex items-center gap-2 glass rounded-full p-1.5">
            <button onClick={() => setFont(Math.max(14, font - 1))} className="p-2 rounded-full hover:bg-accent" aria-label="Diminuir fonte"><Minus className="w-4 h-4"/></button>
            <Type className="w-4 h-4 text-muted-foreground" />
            <button onClick={() => setFont(Math.min(28, font + 1))} className="p-2 rounded-full hover:bg-accent" aria-label="Aumentar fonte"><Plus className="w-4 h-4"/></button>
            <span className="w-px h-5 bg-border mx-1" />
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-accent" aria-label="Alternar tema">
              {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
            <button onClick={() => setFocus(!focus)} className="rounded-full px-3 py-1.5 text-xs hover:bg-accent">
              {focus ? "Sair do foco" : "Modo foco"}
            </button>
          </div>
        </div>

        <article className="mt-8 leading-relaxed space-y-3" style={{ fontSize: font }}>
          {SAMPLE_VERSES.map((v) => (
            <p key={v.v} className="group">
              <sup className="text-primary mr-2 font-semibold">{v.v}</sup>
              <span className="hover:bg-[color-mix(in_oklab,var(--gold)_25%,transparent)] transition-colors rounded px-0.5 cursor-text">
                {v.t}
              </span>
            </p>
          ))}
        </article>

        <div className="mt-10 flex justify-between text-sm">
          <button className="rounded-2xl glass px-4 py-2 hover:bg-accent">← Capítulo anterior</button>
          <button className="rounded-2xl bg-primary text-primary-foreground px-4 py-2 shadow-soft">Próximo capítulo →</button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground text-center">
          Em breve: todas as traduções brasileiras, versão original (hebraico/grego), marcações coloridas, anotações, dicionário pessoal e IA exegética.
        </p>
      </div>
    </AppShell>
  );
}
