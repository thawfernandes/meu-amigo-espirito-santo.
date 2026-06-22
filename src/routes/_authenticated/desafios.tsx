import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Target, Calendar, CheckCircle2, Flame, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/desafios")({ component: Challenges });

interface Challenge { id:string; title:string; description:string; icon:string|null; duration_days:number }
interface UserChallenge { id:string; challenge_id:string; progress:number; completed_at:string|null }

const ICON_MAP: Record<string, string> = {
  heart: "❤️", "book-open": "📖", sparkles: "✨", sun: "☀️",
};

// Accent color per duration
function getAccent(days: number) {
  if (days <= 7)  return { bg:"oklch(0.65 0.22 355 / 0.18)", border:"oklch(0.65 0.22 355 / 0.3)", tag:"text-rose-300",   btn:"linear-gradient(135deg, oklch(0.62 0.22 355), oklch(0.55 0.24 340))", glow:"oklch(0.65 0.22 355 / 0.3)" };
  if (days <= 21) return { bg:"oklch(0.65 0.18 255 / 0.18)", border:"oklch(0.65 0.18 255 / 0.3)", tag:"text-blue-300",   btn:"linear-gradient(135deg, oklch(0.65 0.18 255), oklch(0.58 0.2 270))",  glow:"oklch(0.65 0.18 255 / 0.3)" };
  return              { bg:"oklch(0.65 0.18 80  / 0.18)",  border:"oklch(0.65 0.18 80  / 0.3)",  tag:"text-amber-300",  btn:"linear-gradient(135deg, oklch(0.68 0.18 80),  oklch(0.60 0.2  65))",  glow:"oklch(0.65 0.18 80  / 0.3)" };
}

function ChallengeCard({ challenge, userChallenge, onAccept, onProgress }: {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onAccept: (id: string) => void;
  onProgress: (id: string, prog: number) => void;
}) {
  const a = getAccent(challenge.duration_days);
  const emoji = ICON_MAP[challenge.icon ?? ""] ?? "🎯";
  const accepted = !!userChallenge;
  const completed = !!userChallenge?.completed_at;
  const prog = userChallenge?.progress ?? 0;
  const pct = Math.round((prog / challenge.duration_days) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      className="rounded-3xl p-5 flex flex-col transition-all hover:-translate-y-0.5"
      style={{ background:a.bg, border:`1px solid ${a.border}`, boxShadow:`0 20px 60px ${a.glow}` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{emoji}</span>
        <div className="flex items-center gap-2">
          {completed && <span className="text-emerald-400"><Trophy className="w-4 h-4" /></span>}
          <div className="flex items-center gap-1 text-[11px] text-white/40"
            style={{ background:"oklch(1 0 0 / 0.08)", border:"1px solid oklch(1 0 0 / 0.1)", borderRadius:99, padding:"2px 8px" }}>
            <Calendar className="w-3 h-3" /> {challenge.duration_days} dias
          </div>
        </div>
      </div>

      <h3 className="font-display text-lg text-white leading-snug mb-1">{challenge.title}</h3>
      <p className="text-sm text-white/50 flex-1 mb-4">{challenge.description}</p>

      {/* Progress bar (if accepted) */}
      {accepted && !completed && (
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> Progresso</span>
            <span>{prog}/{challenge.duration_days} dias</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:"oklch(1 0 0 / 0.1)" }}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:"easeOut" }}
              className="h-full rounded-full"
              style={{ background:a.btn, boxShadow:`0 0 12px ${a.glow}` }}
            />
          </div>
        </div>
      )}

      {completed ? (
        <div className="rounded-2xl py-2.5 text-sm text-emerald-300 font-medium flex items-center justify-center gap-2"
          style={{ background:"oklch(0.65 0.18 155 / 0.15)", border:"1px solid oklch(0.65 0.18 155 / 0.25)" }}>
          <CheckCircle2 className="w-4 h-4" /> Concluído!
        </div>
      ) : accepted ? (
        <button
          onClick={() => onProgress(userChallenge!.id, prog + 1)}
          className="rounded-2xl py-2.5 text-sm text-white font-medium flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ background:a.btn, boxShadow:`0 4px 20px ${a.glow}` }}
        >
          ✓ Marcar hoje como feito
        </button>
      ) : (
        <button
          onClick={() => onAccept(challenge.id)}
          className="rounded-2xl py-2.5 text-sm text-white font-medium flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ background:"oklch(1 0 0 / 0.15)", border:"1px solid oklch(1 0 0 / 0.2)" }}
        >
          <Target className="w-3.5 h-3.5" /> Aceitar desafio
        </button>
      )}
    </motion.div>
  );
}

function Challenges() {
  const [uid, setUid] = useState<string|null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      const [{ data: ch }, { data: uc }] = await Promise.all([
        supabase.from("challenges").select("*").eq("active", true),
        supabase.from("user_challenges").select("*").eq("user_id", data.user.id),
      ]);
      if (ch) setChallenges(ch as Challenge[]);
      if (uc) setUserChallenges(uc as UserChallenge[]);
      setLoading(false);
    });
  }, []);

  const accept = async (challengeId: string) => {
    if (!uid) return;
    const { data, error } = await supabase.from("user_challenges")
      .insert({ user_id: uid, challenge_id: challengeId, progress: 0 }).select().single();
    if (error) { toast.error("Erro ao aceitar."); return; }
    setUserChallenges(uc => [...uc, data as UserChallenge]);
    toast.success("Desafio aceito! 💪");
  };

  const progress = async (ucId: string, newProg: number) => {
    const uc = userChallenges.find(x => x.id === ucId);
    if (!uc) return;
    const ch = challenges.find(c => c.id === uc.challenge_id);
    const completed_at = ch && newProg >= ch.duration_days ? new Date().toISOString() : null;
    await supabase.from("user_challenges").update({ progress: newProg, ...(completed_at ? { completed_at } : {}) }).eq("id", ucId);
    setUserChallenges(list => list.map(x => x.id===ucId ? { ...x, progress:newProg, completed_at } : x));
    if (completed_at) toast.success("🏆 Desafio concluído! Incrível!");
    else toast.success(`Dia ${newProg} marcado! Continue assim 🔥`);
  };

  const active = challenges.filter(c => userChallenges.find(u => u.challenge_id === c.id && !u.completed_at));
  const available = challenges.filter(c => !userChallenges.find(u => u.challenge_id === c.id));
  const done = challenges.filter(c => userChallenges.find(u => u.challenge_id === c.id && u.completed_at));

  return (
    <AppShell>
      {/* Hero */}
      <div className="animate-fade-up mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 mb-1">Desafios</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Pequenos passos.<br />Grandes mudanças.</h1>
        <p className="text-white/40 mt-2 text-sm max-w-sm">Sem competição. Com propósito.</p>
      </div>

      {/* Stats pill */}
      {!loading && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label:"Em andamento", val:active.length,    color:"text-blue-300",    bg:"oklch(0.65 0.18 255 / 0.12)", border:"oklch(0.65 0.18 255 / 0.25)" },
            { label:"Disponíveis",  val:available.length, color:"text-white/50",    bg:"oklch(1 0 0 / 0.06)",         border:"oklch(1 0 0 / 0.1)" },
            { label:"Concluídos",   val:done.length,      color:"text-emerald-300", bg:"oklch(0.65 0.18 155 / 0.12)", border:"oklch(0.65 0.18 155 / 0.25)" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              style={{ background:s.bg, border:`1px solid ${s.border}` }}>
              <span className={`font-bold text-lg font-display ${s.color}`}>{s.val}</span>
              <span className="text-white/40 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/30">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400/60 mb-3 flex items-center gap-2">
                <Flame className="w-3 h-3" /> Em andamento
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {active.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                    <ChallengeCard challenge={c} userChallenge={userChallenges.find(u => u.challenge_id===c.id)}
                      onAccept={accept} onProgress={progress} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {available.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">Disponíveis</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {available.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                    <ChallengeCard challenge={c} onAccept={accept} onProgress={progress} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 mb-3 flex items-center gap-2">
                <Trophy className="w-3 h-3" /> Concluídos
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {done.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                    <ChallengeCard challenge={c} userChallenge={userChallenges.find(u => u.challenge_id===c.id)}
                      onAccept={accept} onProgress={progress} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
