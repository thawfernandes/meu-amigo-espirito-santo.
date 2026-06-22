import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { HeartHandshake, Flame, CheckCircle2, BookHeart, Plus, X, Check, Trash2, ChevronRight, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vida")({ component: Vida });

type PrayerKind = "prayer"|"fast"|"purpose"|"answered"|"testimony";
interface Prayer { id:string; kind:PrayerKind; title:string; body:string|null; answered_at:string|null; created_at:string }

const SECTIONS = [
  { kind:"prayer"   as PrayerKind, icon:HeartHandshake, label:"Orações",     emoji:"🙏", placeholder:"Por quem ou o que você quer orar?",   accent:"from-rose-500/25 to-pink-600/15",  border:"oklch(0.65 0.22 355 / 0.3)", glow:"oklch(0.65 0.22 355 / 0.2)", tag:"text-rose-300", tagBg:"oklch(0.65 0.22 355 / 0.15)", tagBorder:"oklch(0.65 0.22 355 / 0.25)" },
  { kind:"answered" as PrayerKind, icon:CheckCircle2,   label:"Respondidas", emoji:"✅", placeholder:"Como Deus respondeu?",                  accent:"from-emerald-500/25 to-green-600/15",  border:"oklch(0.65 0.18 155 / 0.3)", glow:"oklch(0.65 0.18 155 / 0.2)", tag:"text-emerald-300", tagBg:"oklch(0.65 0.18 155 / 0.15)", tagBorder:"oklch(0.65 0.18 155 / 0.25)" },
  { kind:"testimony"as PrayerKind, icon:BookHeart,      label:"Testemunhos", emoji:"✨", placeholder:"Compartilhe um testemunho...",           accent:"from-amber-500/25 to-yellow-600/15",  border:"oklch(0.75 0.18 80 / 0.3)",  glow:"oklch(0.75 0.18 80 / 0.2)",  tag:"text-amber-300", tagBg:"oklch(0.75 0.18 80 / 0.15)", tagBorder:"oklch(0.75 0.18 80 / 0.25)" },
  { kind:"fast"     as PrayerKind, icon:Flame,          label:"Jejuns",      emoji:"🔥", placeholder:"Qual é o propósito deste jejum?",       accent:"from-orange-500/25 to-red-600/15",     border:"oklch(0.65 0.2 40 / 0.3)",   glow:"oklch(0.65 0.2 40 / 0.2)",   tag:"text-orange-300", tagBg:"oklch(0.65 0.2 40 / 0.15)", tagBorder:"oklch(0.65 0.2 40 / 0.25)" },
  { kind:"purpose"  as PrayerKind, icon:Sparkles,       label:"Propósitos",  emoji:"🌱", placeholder:"Que compromisso você quer cultivar?",   accent:"from-sky-500/25 to-blue-600/15",       border:"oklch(0.65 0.18 220 / 0.3)", glow:"oklch(0.65 0.18 220 / 0.2)", tag:"text-sky-300", tagBg:"oklch(0.65 0.18 220 / 0.15)", tagBorder:"oklch(0.65 0.18 220 / 0.25)" },
];

function fmt(d:string){ return new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}); }

function usePrayers(uid:string|null, kind:PrayerKind) {
  const [items, setItems] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const { data } = await supabase.from("prayers").select("*").eq("user_id",uid).eq("kind",kind).order("created_at",{ascending:false});
    setItems((data as Prayer[]) ?? []);
    setLoading(false);
  }, [uid, kind]);
  useEffect(() => { load(); }, [load]);

  const add = async (title:string, body:string) => {
    if (!uid||!title.trim()) return;
    const { data, error } = await supabase.from("prayers").insert({ user_id:uid, kind, title:title.trim(), body:body.trim()||null }).select().single();
    if (error) { toast.error("Erro ao salvar."); return; }
    setItems(p => [data as Prayer, ...p]);
    toast.success("Salvo 🙏");
  };
  const markAnswered = async (id:string) => {
    await supabase.from("prayers").update({ kind:"answered", answered_at:new Date().toISOString() }).eq("id",id);
    setItems(p => p.filter(x => x.id !== id));
    toast.success("Marcada como respondida ✅");
  };
  const remove = async (id:string) => {
    await supabase.from("prayers").delete().eq("id",id);
    setItems(p => p.filter(x => x.id !== id));
  };
  return { items, loading, add, markAnswered, remove };
}

function AddForm({ placeholder, onAdd, onClose }: { placeholder:string; onAdd:(t:string,b:string)=>void; onClose:()=>void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
      className="rounded-2xl p-4 mb-4"
      style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.12)" }}>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/30 border-b border-white/10 pb-2 mb-3" />
      <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Detalhes (opcional)..." rows={3}
        className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none text-white placeholder:text-white/25 focus:ring-1 focus:ring-white/20 transition-all"
        style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }} />
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="rounded-xl px-3 py-1.5 text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all">Cancelar</button>
        <button onClick={() => { if (title.trim()) { onAdd(title,body); onClose(); }}}
          className="rounded-xl px-4 py-1.5 text-sm text-white flex items-center gap-1.5 transition-all"
          style={{ background:"linear-gradient(135deg, oklch(0.65 0.22 355), oklch(0.58 0.22 340))", boxShadow:"0 4px 16px oklch(0.65 0.22 355 / 0.35)" }}>
          <Check className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </motion.div>
  );
}

function PrayerCard({ item, showMark, onMark, onDelete }: { item:Prayer; showMark?:boolean; onMark?:(id:string)=>void; onDelete:(id:string)=>void }) {
  const [exp, setExp] = useState(false);
  return (
    <motion.div layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background:"oklch(1 0 0 / 0.05)", border:"1px solid oklch(1 0 0 / 0.09)" }}>
      <div className="flex items-start justify-between gap-2">
        <button className="flex-1 text-left" onClick={() => setExp(e=>!e)}>
          <p className="text-sm font-medium text-white/85 leading-snug">{item.title}</p>
          {item.answered_at && (
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Respondida em {fmt(item.answered_at)}
            </p>
          )}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {showMark && onMark && (
            <button onClick={() => onMark(item.id)} title="Respondida"
              className="p-1.5 rounded-full hover:bg-emerald-400/15 text-emerald-500 transition-all">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-full hover:bg-rose-400/15 text-white/25 hover:text-rose-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {exp && item.body && (
          <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="text-sm text-white/40 leading-relaxed border-t border-white/8 pt-2">{item.body}</motion.p>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-1.5 text-[11px] text-white/25">
        <Clock className="w-3 h-3" /> {fmt(item.created_at)}
        {item.body && (
          <button onClick={() => setExp(e=>!e)} className="ml-auto flex items-center gap-0.5 hover:text-white/50 transition-colors">
            {exp?"menos":"mais"} <ChevronRight className={`w-3 h-3 transition-transform ${exp?"rotate-90":""}`} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Section({ section, uid }: { section: typeof SECTIONS[0]; uid: string|null }) {
  const [adding, setAdding] = useState(false);
  const { items, loading, add, markAnswered, remove } = usePrayers(uid, section.kind);
  const Icon = section.icon;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:`linear-gradient(135deg, ${section.tagBg}, transparent)`, border:`1px solid ${section.tagBorder}` }}>
            <Icon className={`w-4 h-4 ${section.tag}`} />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">{section.label}</h2>
            {items.length > 0 && <p className="text-[11px] text-white/30">{items.length} registro{items.length!==1?"s":""}</p>}
          </div>
        </div>
        <button onClick={() => setAdding(a=>!a)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          style={{ border:"1px solid oklch(1 0 0 / 0.1)" }}>
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      <AnimatePresence>{adding && <AddForm placeholder={section.placeholder} onAdd={add} onClose={() => setAdding(false)} />}</AnimatePresence>

      {loading ? (
        <div className="text-sm text-white/25 py-4">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl p-8 text-center"
          style={{ background:`linear-gradient(145deg, ${section.tagBg}, transparent)`, border:`1px solid ${section.tagBorder}` }}>
          <p className="text-4xl mb-3">{section.emoji}</p>
          <p className="text-sm text-white/40 mb-4">Nenhum registro ainda.</p>
          <button onClick={() => setAdding(true)}
            className="text-xs rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/15 transition-all"
            style={{ border:"1px solid oklch(1 0 0 / 0.12)" }}>+ Adicionar primeiro</button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map(item => (
              <PrayerCard key={item.id} item={item} showMark={section.kind==="prayer"} onMark={markAnswered} onDelete={remove} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Vida() {
  const [uid, setUid] = useState<string|null>(null);
  const [tab, setTab] = useState<PrayerKind>("prayer");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) setUid(data.user.id); }); }, []);

  const section = SECTIONS.find(s => s.kind === tab)!;

  return (
    <AppShell>
      {/* Hero */}
      <div className="animate-fade-up mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400/60 mb-1">Vida Espiritual</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Sua jornada<br />com Deus.</h1>
        <p className="text-white/40 mt-2 text-sm">Um espaço acolhedor para registrar o que importa.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SECTIONS.map(s => {
          const active = tab === s.kind;
          const Icon = s.icon;
          return (
            <button key={s.kind} onClick={() => setTab(s.kind)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all ${active ? "text-white" : "text-white/40 hover:text-white/70"}`}
              style={active ? {
                background:`linear-gradient(135deg, ${s.tagBg}, transparent)`,
                border:`1px solid ${s.tagBorder}`,
                boxShadow:`0 4px 20px ${s.glow}`,
              } : {
                background:"oklch(1 0 0 / 0.04)",
                border:"1px solid oklch(1 0 0 / 0.08)",
              }}>
              <Icon className={`w-4 h-4 ${active ? s.tag : ""}`} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Active section */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
          <Section section={section} uid={uid} />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
