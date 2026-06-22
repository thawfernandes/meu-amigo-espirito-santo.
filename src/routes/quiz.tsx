import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LowPolyWorld } from "@/components/world/LowPolyWorld";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Vamos te conhecer — Amigo, Espírito Santo" }] }),
  component: QuizPage,
});

// ── Questões exatas conforme especificação ─────────────────────────────
interface Option { value: string; emoji: string; label: string; sub?: string }
interface Question { key: string; title: string; note?: string; options: Option[] }

const QUESTIONS: Question[] = [
  {
    key: "bible_read",
    title: "Você já leu toda a Bíblia?",
    options: [
      { value: "never",   emoji: "📖", label: "Nunca" },
      { value: "first",   emoji: "🌱", label: "Estou lendo pela primeira vez" },
      { value: "once",    emoji: "⭐", label: "Sim, uma vez" },
      { value: "twice",   emoji: "⭐⭐", label: "Sim, duas vezes" },
      { value: "many",    emoji: "⭐⭐⭐", label: "Três vezes ou mais" },
    ],
  },
  {
    key: "bible_study",
    title: "Você costuma estudar a Bíblia além da leitura?",
    options: [
      { value: "no",       emoji: "📚", label: "Ainda não" },
      { value: "starting", emoji: "🌱", label: "Estou começando agora" },
      { value: "some",     emoji: "📖", label: "Sim, estudo há algum tempo" },
      { value: "deep",     emoji: "🎓", label: "Sim, estudo com frequência há anos" },
    ],
  },
  {
    key: "learn_style",
    title: "Como você prefere aprender?",
    options: [
      { value: "read",  emoji: "📖", label: "Lendo" },
      { value: "audio", emoji: "🎧", label: "Ouvindo" },
      { value: "video", emoji: "🎥", label: "Assistindo vídeos" },
      { value: "mixed", emoji: "🧠", label: "Gosto de misturar tudo" },
    ],
  },
  {
    key: "prayer_routine",
    title: "Como está sua rotina de oração atualmente?",
    options: [
      { value: "daily",    emoji: "🙏", label: "Todos os dias" },
      { value: "most",     emoji: "🙂", label: "Na maioria dos dias" },
      { value: "sometimes",emoji: "😅", label: "Algumas vezes" },
      { value: "starting", emoji: "🌱", label: "Quero começar" },
    ],
  },
  {
    key: "bible_difficulty",
    title: "Você sente dificuldade para entender alguns textos bíblicos?",
    options: [
      { value: "rarely",  emoji: "😊", label: "Raramente" },
      { value: "sometimes",emoji: "🤔", label: "Às vezes" },
      { value: "often",   emoji: "😵", label: "Muitas vezes" },
      { value: "always",  emoji: "📚", label: "Quase sempre preciso de ajuda" },
    ],
  },
  {
    key: "daily_time",
    title: "Quanto tempo você costuma dedicar para Deus durante um dia comum?",
    options: [
      { value: "10",  emoji: "⏱️", label: "Menos de 10 minutos" },
      { value: "20",  emoji: "🌱", label: "Entre 10 e 20 minutos" },
      { value: "40",  emoji: "📖", label: "Entre 20 e 40 minutos" },
      { value: "60+", emoji: "✨", label: "Mais de 40 minutos" },
    ],
  },
];

// ── Perfis resultado ────────────────────────────────────────────────────
type Profile = "beginner" | "walking" | "deepening";

function calcProfile(answers: Record<string, string>): Profile {
  let score = 0;
  if (["once","twice","many"].includes(answers.bible_read ?? ""))  score += 2;
  if (["some","deep"].includes(answers.bible_study ?? ""))          score += 2;
  if (["daily","most"].includes(answers.prayer_routine ?? ""))      score += 1;
  if (answers.daily_time === "60+")                                  score += 2;
  if (answers.daily_time === "40")                                   score += 1;
  if (["rarely"].includes(answers.bible_difficulty ?? ""))           score += 1;
  if (score >= 6) return "deepening";
  if (score >= 3) return "walking";
  return "beginner";
}

const PROFILES: Record<Profile, {
  emoji: string; title: string; subtitle: string;
  description: string; color: string; glow: string;
}> = {
  beginner: {
    emoji: "🌱",
    title: "Iniciando a Jornada",
    subtitle: "O começo de algo lindo",
    description: "Para quem está começando ou quer criar novos hábitos. Você receberá incentivos, explicações simples e desafios acessíveis que crescem com você.",
    color: "from-emerald-500/30 to-green-600/20",
    glow: "oklch(0.65 0.18 155 / 0.4)",
  },
  walking: {
    emoji: "🚶",
    title: "Caminhando com Constância",
    subtitle: "Uma jornada com ritmo",
    description: "Para quem já possui alguma rotina espiritual. O app vai sugerir planos de leitura mais completos e desafios intermediários para fortalecer o que você já construiu.",
    color: "from-sky-500/30 to-blue-600/20",
    glow: "oklch(0.65 0.18 220 / 0.4)",
  },
  deepening: {
    emoji: "🎓",
    title: "Aprofundando o Conhecimento",
    subtitle: "Raízes profundas",
    description: "Para quem já estuda com frequência. Você terá acesso facilitado a estudos exegéticos, comparações entre traduções e palavras no original grego e hebraico.",
    color: "from-violet-500/30 to-purple-600/20",
    glow: "oklch(0.65 0.2 280 / 0.4)",
  },
};

// ── Partículas de fundo ─────────────────────────────────────────────────
function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="absolute rounded-full"
          style={{
            left: `${(i * 37 + 10) % 100}%`,
            top: `${(i * 53 + 5) % 100}%`,
            width: 3 + (i % 4),
            height: 3 + (i % 4),
            background: i % 3 === 0
              ? "oklch(0.82 0.14 85 / 0.6)"
              : i % 3 === 1
              ? "oklch(0.75 0.18 290 / 0.5)"
              : "oklch(0.75 0.18 155 / 0.5)",
            animation: `twinkle ${3 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}

// ── Card de opção ──────────────────────────────────────────────────────
function OptionCard({ opt, onSelect, delay }: { opt: Option; onSelect: () => void; delay: number }) {
  const [pressing, setPressing] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => { setPressing(false); onSelect(); }}
      className="relative flex items-center gap-4 w-full rounded-2xl text-left overflow-hidden group transition-all"
      style={{
        background: pressing
          ? "oklch(0.65 0.18 270 / 0.2)"
          : "oklch(1 0 0 / 0.07)",
        border: `1px solid ${pressing ? "oklch(0.65 0.18 270 / 0.5)" : "oklch(1 0 0 / 0.12)"}`,
        padding: "18px 20px",
        boxShadow: pressing ? "0 0 30px oklch(0.65 0.18 270 / 0.3)" : "none",
      }}
    >
      {/* Glow hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 270 / 0.1), transparent)" }} />

      <span className="text-3xl shrink-0 relative z-10">{opt.emoji}</span>
      <div className="relative z-10">
        <p className="font-medium text-white text-sm sm:text-base">{opt.label}</p>
        {opt.sub && <p className="text-xs text-white/40 mt-0.5">{opt.sub}</p>}
      </div>

      {/* Right arrow indicator */}
      <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors relative z-10 text-lg">›</span>
    </motion.button>
  );
}

// ── Componente principal ────────────────────────────────────────────────
function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | number | "result">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [direction, setDirection] = useState(1);

  function pick(value: string) {
    const q = QUESTIONS[step as number];
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    const nextStep = (step as number) + 1;
    setDirection(1);
    if (nextStep >= QUESTIONS.length) {
      setProfile(calcProfile(next));
      setStep("result");
    } else {
      setStep(nextStep);
    }
  }

  function startQuiz() {
    setDirection(1);
    setStep(0);
  }

  function goToSignup() {
    // Salvar respostas no sessionStorage para recuperar na tela de cadastro
    sessionStorage.setItem("quiz_answers", JSON.stringify(answers));
    sessionStorage.setItem("quiz_profile", profile ?? "beginner");
    navigate({ to: "/auth", search: { mode: "signup" } as never });
  }

  const currentQ = typeof step === "number" ? QUESTIONS[step] : null;
  const progressPct = typeof step === "number"
    ? ((step + 1) / QUESTIONS.length) * 100
    : step === "result" ? 100 : 0;

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#0d0b1e] text-white">
      {/* Background world */}
      <div className="absolute inset-0 opacity-40">
        <LowPolyWorld />
      </div>
      <Particles />
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(8,5,24,.85) 100%)" }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Progress bar */}
        {step !== "intro" && (
          <div className="w-full h-0.5 bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, oklch(0.75 0.18 290), oklch(0.82 0.14 85))" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}

        {/* Back button */}
        {typeof step === "number" && step > 0 && (
          <button onClick={() => { setDirection(-1); setStep(step - 1); }}
            className="absolute top-6 left-5 text-xs text-white/30 hover:text-white/70 transition-colors z-20 flex items-center gap-1">
            ← voltar
          </button>
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:py-16">
          <div className="w-full max-w-md">

            {/* ── INTRO ── */}
            <AnimatePresence mode="wait">
              {step === "intro" && (
                <motion.div key="intro"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl mb-6"
                  >🕊️</motion.div>

                  <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/60 mb-3">Quiz de Personalização</p>
                  <h1 className="font-display text-3xl sm:text-4xl mb-4 leading-snug">
                    Antes de começar,<br />
                    <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-violet-300 bg-clip-text text-transparent">
                      queremos te conhecer.
                    </span>
                  </h1>

                  <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-sm mx-auto">
                    Não existe resposta certa ou errada. Seja sincero. Assim conseguiremos preparar uma experiência que realmente faça sentido para você.
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-6 mb-8 text-center">
                    {[
                      { val: "6", label: "perguntas" },
                      { val: "~1min", label: "de duração" },
                      { val: "0", label: "julgamentos" },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="font-display text-2xl text-white">{s.val}</p>
                        <p className="text-[11px] text-white/35">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={startQuiz}
                    className="w-full rounded-2xl py-4 text-base font-semibold text-white relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.68 0.18 260), oklch(0.55 0.2 295))",
                      boxShadow: "0 8px 40px oklch(0.65 0.2 280 / 0.5)",
                    }}
                  >
                    <span className="relative z-10">✨ Começar o quiz</span>
                    <div className="absolute inset-0 animate-shimmer opacity-30" />
                  </motion.button>

                  <button onClick={() => navigate({ to: "/auth" })}
                    className="mt-4 text-sm text-white/30 hover:text-white/60 transition-colors w-full py-2">
                    Já tenho conta — entrar
                  </button>
                </motion.div>
              )}

              {/* ── QUESTION ── */}
              {typeof step === "number" && currentQ && (
                <motion.div key={`q-${step}`}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                      Pergunta {step + 1} de {QUESTIONS.length}
                    </span>
                    <span className="text-[10px] text-white/20">{Math.round(progressPct)}%</span>
                  </div>

                  {/* Question */}
                  <h2 className="font-display text-2xl sm:text-3xl text-white mb-6 leading-snug">
                    {currentQ.title}
                  </h2>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, i) => (
                      <OptionCard key={opt.value} opt={opt} onSelect={() => pick(opt.value)} delay={i * 0.06} />
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[11px] text-white/20 mt-6 text-center">
                    Suas respostas servem apenas para personalizar sua experiência.
                  </p>
                </motion.div>
              )}

              {/* ── RESULT ── */}
              {step === "result" && profile && (
                <motion.div key="result"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  {/* Stars burst */}
                  <div className="relative mb-6">
                    {[0,1,2,3,4,5,6,7].map(i => (
                      <motion.span key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: Math.cos(i / 8 * Math.PI * 2) * 60, y: Math.sin(i / 8 * Math.PI * 2) * 60 - 20 }}
                        transition={{ duration: 1.2, delay: i * 0.08 }}
                        className="absolute left-1/2 top-1/2 text-lg pointer-events-none"
                      >✦</motion.span>
                    ))}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-6xl"
                    >{PROFILES[profile].emoji}</motion.div>
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">Seu perfil inicial</p>
                  <h2 className="font-display text-3xl text-white mb-1">{PROFILES[profile].title}</h2>
                  <p className="text-sm text-white/40 mb-5">{PROFILES[profile].subtitle}</p>

                  <div className="rounded-3xl p-5 mb-6 text-left"
                    style={{
                      background: `linear-gradient(145deg, ${PROFILES[profile].color.split(" ")[1]}, transparent)`,
                      border: `1px solid oklch(1 0 0 / 0.1)`,
                      boxShadow: `0 20px 60px ${PROFILES[profile].glow}`,
                    }}>
                    <p className="text-sm text-white/70 leading-relaxed">{PROFILES[profile].description}</p>
                    <p className="text-[11px] text-white/30 mt-3">
                      Este perfil não é definitivo — ele vai crescer com você à medida que você usa o app.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={goToSignup}
                    className="w-full rounded-2xl py-4 text-base font-semibold text-white mb-3"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.68 0.18 260))",
                      boxShadow: "0 8px 40px oklch(0.65 0.2 280 / 0.5)",
                    }}
                  >
                    🚀 Criar minha conta e começar
                  </motion.button>

                  <p className="text-xs text-white/25">Rápido e sem verificação de e-mail.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
