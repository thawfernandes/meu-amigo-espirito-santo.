import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { BookOpen, Clock, X, Search, BookMarked, MessageSquare, Sparkles, Lightbulb, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/estudos")({ component: Estudos });

interface StudyTheme {
  id: string; icon: string; title: string; description: string;
  tags: string[]; duration: string; passages: string[];
  accent: string; glow: string;
}

const THEMES: StudyTheme[] = [
  { id:"fe", icon:"✨", title:"O que é a Fé?", description:"Entenda o significado bíblico da fé — não como sentimento, mas como confiança ativa.",
    tags:["Fundamentos","Hebreus","NT"], duration:"15–20 min", passages:["Hb 11:1","Rm 10:17","Tg 2:17"],
    accent:"from-amber-500/30 to-yellow-600/20", glow:"oklch(0.75 0.18 80 / 0.25)" },
  { id:"es", icon:"🕊️", title:"O Espírito Santo na Bíblia", description:"Quem é o Espírito Santo, como Ele age e qual é o Seu papel na vida do crente.",
    tags:["Teologia","ES","NT"], duration:"25–30 min", passages:["Jo 14:26","At 2:1-4","Gl 5:22"],
    accent:"from-sky-500/30 to-blue-600/20", glow:"oklch(0.65 0.18 220 / 0.25)" },
  { id:"oracao", icon:"🙏", title:"Como Jesus ensinava a orar", description:"O Pai Nosso como modelo — muito além de uma repetição, um estilo de vida.",
    tags:["Oração","Mateus","Prática"], duration:"20 min", passages:["Mt 6:9-13","Lc 11:1-4","Fp 4:6"],
    accent:"from-violet-500/30 to-purple-600/20", glow:"oklch(0.65 0.2 280 / 0.25)" },
  { id:"graca", icon:"🌿", title:"Graça: presente imerecido", description:"O que a Bíblia ensina sobre a graça de Deus e como ela transforma a vida cristã.",
    tags:["Graça","Paulo","NT"], duration:"20 min", passages:["Ef 2:8-9","Rm 5:15","2Co 12:9"],
    accent:"from-emerald-500/30 to-green-600/20", glow:"oklch(0.65 0.18 155 / 0.25)" },
  { id:"sl23", icon:"🌾", title:"Salmo 23 em profundidade", description:"Um dos salmos mais amados estudado versículo por versículo no contexto histórico.",
    tags:["Salmos","AT","Pastoreio"], duration:"30 min", passages:["Sl 23:1-6"],
    accent:"from-orange-500/30 to-amber-600/20", glow:"oklch(0.68 0.18 55 / 0.25)" },
  { id:"amor", icon:"❤️", title:"O amor que Paulo descreve", description:"1 Coríntios 13 — o hino do amor. Uma análise palavra por palavra do grego original.",
    tags:["Amor","1Co","Grego"], duration:"25 min", passages:["1Co 13:1-13"],
    accent:"from-rose-500/30 to-pink-600/20", glow:"oklch(0.65 0.22 355 / 0.25)" },
];

function StartModal({ theme, onClose, onStart }: {
  theme: StudyTheme;
  onClose: () => void;
  onStart: (m: "own"|"ai"|"none") => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-40" style={{ background:"oklch(0 0 0 / 0.75)", backdropFilter:"blur(10px)" }}
        onClick={onClose} />
      <motion.div
        initial={{ opacity:0, y:40, scale:0.96 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:40, scale:0.96 }}
        transition={{ type:"spring", stiffness:300, damping:28 }}
        className="fixed inset-x-4 bottom-4 z-50 rounded-3xl p-6 max-w-md mx-auto"
        style={{
          background:"oklch(0.13 0.03 270 / 0.97)", backdropFilter:"blur(32px)",
          border:`1px solid oklch(1 0 0 / 0.14)`,
          boxShadow:`0 32px 80px oklch(0 0 0 / 0.7), 0 0 60px ${theme.glow}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/30 transition-all">
          <X className="w-4 h-4" />
        </button>
        <div className="text-4xl mb-3">{theme.icon}</div>
        <h2 className="font-display text-2xl text-white mb-1">{theme.title}</h2>
        <p className="text-sm text-white/50 mb-4">{theme.description}</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {theme.passages.map(p => (
            <span key={p} className="text-xs rounded-full px-3 py-1 font-mono text-white/60"
              style={{ background:"oklch(1 0 0 / 0.08)", border:"1px solid oklch(1 0 0 / 0.12)" }}>{p}</span>
          ))}
        </div>
        <div className="rounded-2xl p-4 mb-4 text-sm"
          style={{ background:"oklch(0.65 0.2 280 / 0.12)", border:"1px solid oklch(0.65 0.2 280 / 0.2)" }}>
          <p className="font-medium text-violet-300 flex items-center gap-2">🙏 Antes de começar, que tal uma oração?</p>
          <p className="text-white/40 text-xs mt-1">Pedir ao Espírito Santo que ilumine é o melhor início.</p>
        </div>
        <div className="space-y-2">
          {[
            { mode:"own" as const, icon:"🙏", label:"Orarei por conta própria", sub:"Faça sua oração e volte para começar" },
            { mode:"ai"  as const, icon:"✨", label:"Sugestão de oração",        sub:"Receber uma oração para este estudo"  },
          ].map(opt => (
            <button key={opt.mode} onClick={() => onStart(opt.mode)}
              className="w-full rounded-2xl px-4 py-3 text-sm text-left flex items-center gap-3 hover:brightness-110 transition-all"
              style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }}>
              <span className="text-xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{opt.label}</p>
                <p className="text-white/40 text-xs">{opt.sub}</p>
              </div>
              <span className="text-white/20">›</span>
            </button>
          ))}
          <button onClick={() => onStart("none")}
            className="w-full rounded-2xl px-4 py-3 text-sm text-white/30 text-left hover:text-white/60 hover:bg-white/5 transition-all">
            Começar direto →
          </button>
        </div>
      </motion.div>
    </>
  );
}

function StudyView({ theme, prayerMode, onExit }: {
  theme: StudyTheme; prayerMode: "own"|"ai"|"none"; onExit: () => void;
}) {
  const [done, setDone] = useState(prayerMode === "none");
  const [notes, setNotes] = useState("");
  const [q, setQ] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-violet-400/60">Estudo em andamento</p>
          <h1 className="font-display text-2xl sm:text-3xl text-white mt-0.5">{theme.icon} {theme.title}</h1>
        </div>
        <button onClick={onExit}
          className="rounded-xl px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" /> Encerrar
        </button>
      </div>

      {!done && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="rounded-3xl p-6"
          style={{ background:"oklch(0.65 0.2 280 / 0.1)", border:"1px solid oklch(0.65 0.2 280 / 0.2)" }}>
          {prayerMode === "own" ? (
            <>
              <p className="font-display text-xl text-white mb-2">🙏 Momento de oração</p>
              <p className="text-sm text-white/50 mb-5">Tome um instante para se aproximar de Deus.</p>
              <button onClick={() => setDone(true)}
                className="rounded-2xl px-5 py-2.5 text-sm text-white font-medium"
                style={{ background:"linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))", boxShadow:"0 4px 20px oklch(0.58 0.2 280 / 0.4)" }}>
                ✓ Amém — Começar estudo
              </button>
            </>
          ) : (
            <>
              <p className="font-display text-xl text-white mb-3">✨ Sugestão de oração</p>
              <p className="text-sm leading-relaxed italic text-white/60 rounded-2xl p-4 mb-5"
                style={{ background:"oklch(1 0 0 / 0.05)", border:"1px solid oklch(1 0 0 / 0.08)" }}>
                "Senhor, antes de iniciar este estudo sobre '{theme.title}', pedimos que o Seu Espírito Santo nos ilumine. Que possamos compreender a Sua Palavra com clareza e um coração aberto. Amém."
              </p>
              <button onClick={() => setDone(true)}
                className="rounded-2xl px-5 py-2.5 text-sm text-white font-medium"
                style={{ background:"linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))", boxShadow:"0 4px 20px oklch(0.58 0.2 280 / 0.4)" }}>
                ✓ Amém — Começar estudo
              </button>
            </>
          )}
        </motion.div>
      )}

      {done && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
          {/* Passagens */}
          <div className="rounded-3xl p-5"
            style={{ background:"oklch(1 0 0 / 0.05)", border:"1px solid oklch(1 0 0 / 0.1)" }}>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3 flex items-center gap-2">
              <BookMarked className="w-3 h-3" /> Passagens deste estudo
            </p>
            <div className="flex gap-2 flex-wrap">
              {theme.passages.map(p => (
                <a key={p} href="/biblia"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 hover:text-white flex items-center gap-1.5 transition-all hover:brightness-125"
                  style={{ background:"oklch(0.55 0.18 85 / 0.15)", border:"1px solid oklch(0.55 0.18 85 / 0.25)" }}>
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> {p}
                </a>
              ))}
            </div>
          </div>

          {/* Contexto */}
          <div className="rounded-3xl p-5 flex gap-3"
            style={{ background:"oklch(1 0 0 / 0.04)", border:"1px solid oklch(1 0 0 / 0.08)" }}>
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">{theme.description}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                {theme.tags.map(t => (
                  <span key={t} className="text-[11px] rounded-full px-2.5 py-0.5 text-violet-300"
                    style={{ background:"oklch(0.65 0.2 280 / 0.15)", border:"1px solid oklch(0.65 0.2 280 / 0.2)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Anotações */}
          <div className="rounded-3xl p-5"
            style={{ background:"oklch(1 0 0 / 0.05)", border:"1px solid oklch(1 0 0 / 0.1)" }}>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">Minhas anotações</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Escreva seus insights e aprendizados..."
              rows={4}
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none text-white placeholder:text-white/25 focus:ring-1 focus:ring-violet-500/40 transition-all"
              style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }} />
          </div>

          {/* Dúvidas */}
          <div className="rounded-3xl p-5"
            style={{ background:"oklch(1 0 0 / 0.04)", border:"1px solid oklch(1 0 0 / 0.08)" }}>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Dúvidas para explorar
            </p>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && q.trim()) { setQuestions(qs => [...qs, q.trim()]); setQ(""); }}}
              placeholder="Anote uma dúvida e pressione Enter..."
              className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none mb-3 focus:ring-1 focus:ring-white/20"
              style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }} />
            {questions.map((qi, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/50 py-1">
                <span className="text-violet-400 text-xs">?</span> {qi}
                <button onClick={() => setQuestions(qs => qs.filter((_,j) => j!==i))} className="ml-auto hover:text-rose-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* IA em breve */}
          <div className="rounded-3xl p-5 flex items-center gap-4"
            style={{ background:"oklch(0.65 0.2 280 / 0.08)", border:"1px solid oklch(0.65 0.2 280 / 0.15)" }}>
            <Sparkles className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Assistente de Estudo com IA</p>
              <p className="text-xs text-white/40 mt-0.5">Em breve: perguntas, grego/hebraico e explicações exegéticas.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Estudos() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StudyTheme|null>(null);
  const [active, setActive] = useState<{ theme: StudyTheme; mode:"own"|"ai"|"none" }|null>(null);

  const filtered = THEMES.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (active) return (
    <AppShell>
      <StudyView theme={active.theme} prayerMode={active.mode} onExit={() => setActive(null)} />
    </AppShell>
  );

  return (
    <AppShell>
      {/* Hero */}
      <div className="animate-fade-up mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400/60 mb-1">Estudos Bíblicos</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Aprofunde sua<br />caminhada.</h1>
        <p className="text-white/40 mt-2 text-sm max-w-sm">
          Contexto, reflexão e espaço para suas perguntas.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-6"
        style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }}>
        <Search className="w-4 h-4 text-white/25 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por tema, livro ou palavra..."
          className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/25" />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((t, i) => (
          <motion.div key={t.id}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i*0.06 }}
            className={`group rounded-3xl p-5 flex flex-col cursor-pointer transition-all hover:-translate-y-1 bg-gradient-to-br ${t.accent}`}
            style={{ border:"1px solid oklch(1 0 0 / 0.1)", boxShadow:`0 20px 60px ${t.glow}` }}
            onClick={() => setSelected(t)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex items-center gap-1 text-[11px] text-white/40">
                <Clock className="w-3 h-3" /> {t.duration}
              </div>
            </div>
            <h3 className="font-display text-lg text-white leading-snug mb-1">{t.title}</h3>
            <p className="text-sm text-white/50 flex-1">{t.description}</p>
            <div className="flex gap-1.5 flex-wrap mt-4 mb-4">
              {t.tags.map(tag => (
                <span key={tag} className="text-[10px] rounded-full px-2.5 py-0.5 text-white/50"
                  style={{ background:"oklch(1 0 0 / 0.08)", border:"1px solid oklch(1 0 0 / 0.1)" }}>{tag}</span>
              ))}
            </div>
            <button
              className="w-full rounded-2xl py-2.5 text-sm font-medium text-white flex items-center justify-center gap-2 transition-all group-hover:brightness-110"
              style={{ background:"oklch(1 0 0 / 0.15)", border:"1px solid oklch(1 0 0 / 0.2)" }}
            >
              <BookOpen className="w-3.5 h-3.5" /> Iniciar estudo
            </button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-white/30 text-sm mt-12">Nenhum resultado para "{search}".</p>
      )}

      <AnimatePresence>
        {selected && (
          <StartModal theme={selected} onClose={() => setSelected(null)}
            onStart={mode => { setActive({ theme: selected, mode }); setSelected(null); }} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
