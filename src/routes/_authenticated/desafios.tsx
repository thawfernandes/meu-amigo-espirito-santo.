import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import {
  Target,
  Calendar,
  CheckCircle2,
  Flame,
  Loader2,
  Trophy,
  Award,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/components/audio/AudioProvider";
import { logActivity } from "@/lib/activity";
import {
  getAdaptiveQuiz,
  BibleQuestion,
  recordAnswer,
  recordQuizCompletion,
} from "@/lib/quiz-data";
import {
  getActiveChallengesForMonth,
  getAllChallenges,
  MonthlyChallenge,
} from "@/lib/monthly-challenges-data";

export const Route = createFileRoute("/_authenticated/desafios")({ component: Challenges });

interface CompletedMonthlyChallenge {
  id: string;
  completedAt: string;
  experience?: string;
}

function MonthlyChallengeCard({
  challenge,
  completedInfo,
  onComplete,
}: {
  challenge: MonthlyChallenge;
  completedInfo?: CompletedMonthlyChallenge;
  onComplete: (id: string, experience: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [experience, setExperience] = useState("");

  const completed = !!completedInfo;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 flex flex-col gap-4 text-left transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.04 260 / 0.85), oklch(0.14 0.03 260 / 0.95))",
        border: "1px solid oklch(1 0 0 / 0.1)",
        boxShadow: "0 20px 40px oklch(0 0 0 / 0.25)",
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-4xl">{challenge.emoji}</span>
        {completed ? (
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            Disponível
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
          {challenge.title}
        </h3>
        <p className="text-xs text-white/50 leading-relaxed mt-1.5">{challenge.description}</p>
      </div>

      {/* Styled Bible Verse Quote */}
      <div
        className="p-3.5 rounded-2xl bg-white/3 border border-white/5 border-l-2 border-l-rose-400/50"
        style={{ background: "rgba(255, 255, 255, 0.01)" }}
      >
        <p className="text-xs text-white/70 italic leading-relaxed">"{challenge.verseText}"</p>
        <span className="block text-[9px] uppercase tracking-wider text-rose-300/80 font-semibold mt-1.5 text-right font-mono">
          — {challenge.verseRef}
        </span>
      </div>

      {/* Objective */}
      <div className="text-xs">
        <span className="text-white/40 block text-[9px] uppercase tracking-wider font-semibold">
          Objetivo:
        </span>
        <p className="text-white/80 font-medium leading-relaxed mt-0.5">{challenge.objective}</p>
      </div>

      {/* Practical Suggestions */}
      <div className="text-xs">
        <span className="text-white/40 block text-[9px] uppercase tracking-wider font-semibold mb-1">
          Sugestões Práticas:
        </span>
        <ul className="space-y-1 text-white/70 list-disc list-inside">
          {challenge.suggestions.map((s, idx) => (
            <li key={idx} className="leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button & Completion Form */}
      {completed ? (
        <div className="mt-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5 text-xs text-left">
          <div className="flex justify-between items-center text-[10px] font-mono text-white/35">
            <span>Concluído em:</span>
            <span>{new Date(completedInfo.completedAt).toLocaleDateString("pt-BR")}</span>
          </div>
          {completedInfo.experience && (
            <div className="border-t border-white/5 pt-1.5 mt-1.5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                Relato da Experiência:
              </span>
              <p className="text-white/80 leading-relaxed italic">"{completedInfo.experience}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-2xl py-3 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.22 355), oklch(0.55 0.24 340))",
                boxShadow: "0 4px 16px oklch(0.65 0.22 355 / 0.3)",
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Concluir Desafio
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Como foi sua experiência? (Opcional)
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Compartilhe brevemente o que aprendeu ou sentiu ao realizar essa atitude..."
                rows={3}
                className="w-full rounded-xl px-3 py-2 text-xs bg-[#17152b] border border-white/10 text-white outline-none focus:ring-1 focus:ring-rose-400/40 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    setExperience("");
                  }}
                  className="text-[10px] text-white/40 hover:text-white rounded-lg px-2.5 py-1.5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onComplete(challenge.id, experience.trim());
                    setShowConfirm(false);
                    setExperience("");
                  }}
                  className="text-[10px] font-semibold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg px-3.5 py-1.5 transition-all"
                >
                  Confirmar Conclusão
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Challenges() {
  const audio = useAudio();
  const [activeTab, setActiveTab] = useState<"habitos" | "conhecimento">("habitos");
  const [difficulty, setDifficulty] = useState<"beginner" | "walking" | "deepening">("beginner");

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedMonthlyChallenge[]>([]);
  const [celebratingChallenge, setCelebratingChallenge] = useState<MonthlyChallenge | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadCompletedChallenges = useCallback(
    async (userId: string): Promise<CompletedMonthlyChallenge[]> => {
      try {
        // Try Supabase first (source of truth)
        const { data, error } = await supabase
          .from("monthly_challenge_completions")
          .select("challenge_id, experience, completed_at")
          .eq("user_id", userId);
        if (!error && data) {
          const list: CompletedMonthlyChallenge[] = data.map((r) => ({
            id: r.challenge_id,
            completedAt: r.completed_at,
            experience: r.experience || undefined,
          }));
          // Mirror to localStorage for offline fallback
          localStorage.setItem(`local_monthly_challenges_${userId}`, JSON.stringify(list));
          return list;
        }
      } catch (_) {}
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`local_monthly_challenges_${userId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },
    [],
  );

  const saveCompletedChallenge = useCallback(
    async (userId: string, completion: CompletedMonthlyChallenge) => {
      // Save to Supabase
      await supabase.from("monthly_challenge_completions").upsert(
        {
          user_id: userId,
          challenge_id: completion.id,
          experience: completion.experience || null,
          completed_at: completion.completedAt,
        },
        { onConflict: "user_id,challenge_id" },
      );
    },
    [],
  );

  // Stats & Achievements
  const [statsCorrect, setStatsCorrect] = useState(0);
  const [reviewList, setReviewList] = useState<BibleQuestion[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Daily Quiz modal states
  const [showDailyQuiz, setShowDailyQuiz] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<BibleQuestion[]>([]);
  const [dailyStep, setDailyStep] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [hasSubmittedAns, setHasSubmittedAns] = useState(false);
  const [dailyScore, setDailyScore] = useState(0);

  // Daily Quiz complex question states
  const [shuffledChronological, setShuffledChronological] = useState<string[]>([]);
  const [selectedChronological, setSelectedChronological] = useState<string[]>([]);
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  const [shuffledMatchingRight, setShuffledMatchingRight] = useState<string[]>([]);

  // Single Question Review state
  const [reviewQuestion, setReviewQuestion] = useState<BibleQuestion | null>(null);
  const [reviewSelectedAns, setReviewSelectedAns] = useState<string | null>(null);
  const [reviewHasSubmitted, setReviewHasSubmitted] = useState(false);
  const [reviewIsCorrect, setReviewIsCorrect] = useState(false);

  // Review complex question states
  const [revShuffledChronological, setRevShuffledChronological] = useState<string[]>([]);
  const [revSelectedChronological, setRevSelectedChronological] = useState<string[]>([]);
  const [revMatchingSelections, setRevMatchingSelections] = useState<Record<string, string>>({});
  const [revShuffledMatchingRight, setRevShuffledMatchingRight] = useState<string[]>([]);

  // Load stats and history from localStorage
  const loadLocalStats = () => {
    if (typeof window !== "undefined") {
      const correct = Number(localStorage.getItem("bible.stats.correctAnswersCount") || "0");
      setStatsCorrect(correct);

      const revListRaw = localStorage.getItem("bible.reviewList") || "[]";
      try {
        setReviewList(JSON.parse(revListRaw));
      } catch (e) {
        setReviewList([]);
      }

      const badgesRaw = localStorage.getItem("bible.completedChallenges") || "[]";
      try {
        setUnlockedBadges(JSON.parse(badgesRaw));
      } catch (e) {
        setUnlockedBadges([]);
      }
    }
  };

  useEffect(() => {
    loadLocalStats();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const userId = data.user.id;
      setUid(userId);

      // Load difficulty level
      const profileDiff = data.user.user_metadata?.quiz_profile;
      if (profileDiff === "beginner" || profileDiff === "walking" || profileDiff === "deepening") {
        setDifficulty(profileDiff);
      } else {
        const { data: quizData } = await supabase
          .from("onboarding_quiz")
          .select("answers")
          .eq("user_id", userId)
          .maybeSingle();
        const answersObj = quizData?.answers as Record<string, string> | undefined;
        if (
          answersObj?.profile === "beginner" ||
          answersObj?.profile === "walking" ||
          answersObj?.profile === "deepening"
        ) {
          setDifficulty(answersObj.profile as any);
        }
      }

      // Load quiz stats from Supabase
      const { data: stats } = await supabase
        .from("quiz_stats")
        .select("correct_answers")
        .eq("user_id", userId)
        .maybeSingle();
      if (stats) {
        setStatsCorrect(stats.correct_answers || 0);
        localStorage.setItem("bible.stats.correctAnswersCount", String(stats.correct_answers || 0));
      }

      // Load unlocked badges from profiles
      const { data: pData } = await supabase
        .from("profiles")
        .select("completed_challenges")
        .eq("id", userId)
        .maybeSingle();
      if (pData?.completed_challenges && Array.isArray(pData.completed_challenges)) {
        setUnlockedBadges(pData.completed_challenges);
        localStorage.setItem(
          "bible.completedChallenges",
          JSON.stringify(pData.completed_challenges),
        );
      }

      const localCompleted = await loadCompletedChallenges(userId);
      setCompletedChallenges(localCompleted);
      setLoading(false);
    });
  }, [loadCompletedChallenges]);

  // Sync complex question structures for Daily Quiz
  useEffect(() => {
    if (!dailyQuestions || dailyQuestions.length === 0 || dailyStep >= dailyQuestions.length)
      return;
    const q = dailyQuestions[dailyStep];
    if (q.type === "chronological" && q.chronologicalItems) {
      setShuffledChronological([...q.chronologicalItems].sort(() => Math.random() - 0.5));
      setSelectedChronological([]);
    } else if (q.type === "matching" && q.matchingRight) {
      setShuffledMatchingRight([...q.matchingRight].sort(() => Math.random() - 0.5));
      setMatchingSelections({});
    }
    setSelectedAns(null);
    setHasSubmittedAns(false);
  }, [dailyStep, dailyQuestions]);

  // Sync complex question structures for Single Review Question
  useEffect(() => {
    if (!reviewQuestion) return;
    const q = reviewQuestion;
    if (q.type === "chronological" && q.chronologicalItems) {
      setRevShuffledChronological([...q.chronologicalItems].sort(() => Math.random() - 0.5));
      setRevSelectedChronological([]);
    } else if (q.type === "matching" && q.matchingRight) {
      setRevShuffledMatchingRight([...q.matchingRight].sort(() => Math.random() - 0.5));
      setRevMatchingSelections({});
    }
    setReviewSelectedAns(null);
    setReviewHasSubmitted(false);
    setReviewIsCorrect(false);
  }, [reviewQuestion]);

  const handleCompleteChallenge = (challengeId: string, expText: string) => {
    if (!uid) return;
    const now = new Date().toISOString();
    const newCompletion: CompletedMonthlyChallenge = {
      id: challengeId,
      completedAt: now,
      experience: expText || undefined,
    };

    const updated = [newCompletion, ...completedChallenges.filter((x) => x.id !== challengeId)];
    setCompletedChallenges(updated);
    // Sync to localStorage mirror
    try {
      localStorage.setItem(`local_monthly_challenges_${uid}`, JSON.stringify(updated));
    } catch (_) {}
    // Sync to Supabase
    saveCompletedChallenge(uid, newCompletion);

    // Update walk_progress challenges_done counter
    supabase
      .from("walk_progress")
      .select("challenges_done")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data: wp }) => {
        if (wp) {
          supabase
            .from("walk_progress")
            .update({ challenges_done: (wp.challenges_done || 0) + 1 })
            .eq("user_id", uid)
            .then(() => {});
        }
      });

    try {
      audio.play("achievement");
    } catch (e) {}

    const ch = getAllChallenges().find((c) => c.id === challengeId);
    if (ch) {
      setCelebratingChallenge(ch);
      logActivity(uid, "challenge", { challengeId, title: ch.title, experience: expText });
    } else {
      logActivity(uid, "challenge", { challengeId, title: challengeId, experience: expText });
    }
    toast.success("Desafio concluído! Que atitude incrível! 🎉");
  };

  const saveToReviewList = (q: BibleQuestion) => {
    const reviewListRaw = localStorage.getItem("bible.reviewList") || "[]";
    try {
      const list: BibleQuestion[] = JSON.parse(reviewListRaw);
      if (!list.some((x) => x.id === q.id)) {
        list.push(q);
        localStorage.setItem("bible.reviewList", JSON.stringify(list));
      }
    } catch (err) {
      localStorage.setItem("bible.reviewList", JSON.stringify([q]));
    }
  };

  // Daily Quiz functions
  const handleStartDailyQuiz = () => {
    const questions = getAdaptiveQuiz(difficulty, 5);
    setDailyQuestions(questions);
    setDailyStep(0);
    setDailyScore(0);
    setSelectedAns(null);
    setHasSubmittedAns(false);
    setShowDailyQuiz(true);
  };

  const handleDailySubmit = () => {
    if (hasSubmittedAns) return;
    const q = dailyQuestions[dailyStep];
    let correct = false;

    if (q.type === "chronological") {
      correct = selectedChronological.join("|") === q.chronologicalItems?.join("|");
    } else if (q.type === "matching") {
      correct =
        q.matchingLeft?.every((leftItem, idx) => {
          return matchingSelections[leftItem] === q.matchingRight?.[idx];
        }) ?? false;
    } else {
      correct = (selectedAns || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    }

    if (correct) {
      setDailyScore((s) => s + 1);
      toast.success("Resposta Correta! 🎉");
      try {
        audio.play("chime");
      } catch (e) {}

      const unlocked = recordAnswer(true);
      unlocked.forEach((achName) => {
        toast.success(`🏆 Conquista Desbloqueada: ${achName}!`);
      });
    } else {
      toast.error("Resposta incorreta.");
      saveToReviewList(q);
    }
    setHasSubmittedAns(true);
    loadLocalStats();
  };

  const handleDailyNext = () => {
    if (dailyStep === dailyQuestions.length - 1) {
      const unlocked = recordQuizCompletion("", 0, dailyScore, dailyQuestions.length);
      unlocked.forEach((achName) => {
        toast.success(`🏆 Conquista Desbloqueada: ${achName}!`);
      });
      loadLocalStats();
    }
    setSelectedAns(null);
    setHasSubmittedAns(false);
    setDailyStep((s) => s + 1);
  };

  // Review Question functions
  const handleStartReviewQuestion = (q: BibleQuestion) => {
    setReviewQuestion(q);
  };

  const handleReviewSubmit = () => {
    if (!reviewQuestion || reviewHasSubmitted) return;
    const q = reviewQuestion;
    let correct = false;

    if (q.type === "chronological") {
      correct = revSelectedChronological.join("|") === q.chronologicalItems?.join("|");
    } else if (q.type === "matching") {
      correct =
        q.matchingLeft?.every((leftItem, idx) => {
          return revMatchingSelections[leftItem] === q.matchingRight?.[idx];
        }) ?? false;
    } else {
      correct =
        (reviewSelectedAns || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    }

    setReviewIsCorrect(correct);
    setReviewHasSubmitted(true);

    if (correct) {
      toast.success("Correto! Questão resolvida e removida da revisão. 🌟");
      try {
        audio.play("chime");
      } catch (e) {}

      const updated = reviewList.filter((x) => x.id !== q.id);
      localStorage.setItem("bible.reviewList", JSON.stringify(updated));
      setReviewList(updated);

      const unlocked = recordAnswer(true);
      unlocked.forEach((achName) => {
        toast.success(`🏆 Conquista Desbloqueada: ${achName}!`);
      });
    } else {
      toast.error("Resposta incorreta. Ela continuará na sua lista de revisão.");
    }
    loadLocalStats();
  };

  const monthIndex = new Date().getMonth();
  const activeMonthlyChallenges = getActiveChallengesForMonth(monthIndex);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const capitalizedMonth = monthNames[monthIndex];

  return (
    <AppShell>
      {/* Hero */}
      <div className="animate-fade-up mb-6 text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 mb-1">Desafios</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">
          Pequenos passos.
          <br />
          Grandes mudanças.
        </h1>
        <p className="text-white/40 mt-2 text-sm max-w-sm">Sem competição. Com propósito.</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 p-1 mb-8 rounded-2xl bg-white/5 border border-white/10 max-w-md animate-in fade-in duration-300">
        <button
          onClick={() => setActiveTab("habitos")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "habitos"
              ? "bg-white/10 text-white shadow-lg"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>🌍 Desafios Mensais</span>
        </button>
        <button
          onClick={() => setActiveTab("conhecimento")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "conhecimento"
              ? "bg-white/10 text-white shadow-lg"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>🧠 Desafios de Conhecimento</span>
        </button>
      </div>

      {activeTab === "habitos" ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/30">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Intro Banner */}
              <div
                className="rounded-3xl p-5 sm:p-6 text-left flex items-start gap-4"
                style={{
                  background: "oklch(1 0 0 / 0.03)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl shrink-0 mt-0.5 animate-pulse">
                  🌍
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">
                    Sobre os Desafios Mensais
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Esta seção nos lembra que o Evangelho também é vivido através de atitudes
                    diárias de amor ao próximo, serviço, compaixão e misericórdia. Todos os meses,
                    disponibilizamos novos desafios práticos baseados nas Escrituras para te ajudar
                    a colocar a fé em ação. Eles são privados e voluntários.
                  </p>
                </div>
              </div>

              {/* Active Challenges for current month */}
              <section className="text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400/60 mb-3.5 flex items-center gap-1.5 font-semibold">
                  <Flame className="w-3 h-3 text-rose-400 animate-pulse" /> Ativos em{" "}
                  {capitalizedMonth} de {new Date().getFullYear()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {activeMonthlyChallenges.map((c) => {
                    const completedInfo = completedChallenges.find((x) => x.id === c.id);
                    return (
                      <MonthlyChallengeCard
                        key={c.id}
                        challenge={c}
                        completedInfo={completedInfo}
                        onComplete={handleCompleteChallenge}
                      />
                    );
                  })}
                </div>
              </section>

              {/* Collapsible History Section */}
              {completedChallenges.length > 0 && (
                <div className="mt-8 border-t border-white/5 pt-6 text-left">
                  <button
                    onClick={() => setShowHistory((h) => !h)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all text-white"
                  >
                    <span className="text-xs font-semibold text-white/70 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-rose-300 font-semibold" />
                      <span>
                        📜 Histórico de Desafios Concluídos ({completedChallenges.length})
                      </span>
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-white/40 transition-transform ${showHistory ? "rotate-90" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 mt-3 pl-1"
                      >
                        {completedChallenges.map((item, idx) => {
                          const ch = getAllChallenges().find((c) => c.id === item.id);
                          if (!ch) return null;
                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2 text-xs text-left"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{ch.emoji}</span> {ch.title}
                                </span>
                                <span className="text-[10px] text-white/35 font-mono">
                                  {new Date(item.completedAt).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              {item.experience && (
                                <p className="text-white/60 italic leading-relaxed border-l border-white/10 pl-2.5 py-0.5">
                                  "{item.experience}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // ── Bible challenges knowledge tab ──
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Level overview */}
          <div
            className="rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-left"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.04 260 / 0.8), oklch(0.14 0.03 260 / 0.9))",
              border: "1px solid oklch(1 0 0 / 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/25 shrink-0">
                <Trophy className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Seu Perfil de Estudo
                </p>
                <h3 className="font-display text-lg text-white font-semibold mt-0.5">
                  {difficulty === "beginner" && "🌱 Iniciante na Caminhada"}
                  {difficulty === "walking" && "🏃 Caminhante Constante"}
                  {difficulty === "deepening" && "📚 Aprofundado na Palavra"}
                </h3>
                <p className="text-[11px] text-white/50 mt-1 leading-normal">
                  Os quizzes de conhecimento são adaptados ao seu progresso e perfil atual.
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
              <div className="rounded-xl px-4 py-2 bg-white/3 border border-white/5 text-center min-w-[80px]">
                <p className="text-lg font-bold text-emerald-400 font-mono leading-none">
                  {statsCorrect}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1.5">Acertos</p>
              </div>
              <div className="rounded-xl px-4 py-2 bg-white/3 border border-white/5 text-center min-w-[80px]">
                <p className="text-lg font-bold text-amber-300 font-mono leading-none">
                  {reviewList.length}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1.5">Revisar</p>
              </div>
              <div className="rounded-xl px-4 py-2 bg-white/3 border border-white/5 text-center min-w-[80px]">
                <p className="text-lg font-bold text-violet-300 font-mono leading-none">
                  {unlockedBadges.length} / 4
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1.5">Medalhas</p>
              </div>
            </div>
          </div>

          {/* Interactive features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily quiz */}
            <div
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.65 0.18 255 / 0.12), oklch(0.58 0.2 270 / 0.06))",
                border: "1px solid oklch(0.65 0.18 255 / 0.25)",
                boxShadow: "0 20px 40px oklch(0.65 0.18 255 / 0.08)",
              }}
            >
              <div className="text-left">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/25 mb-4 shrink-0">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-display text-lg text-white font-semibold mb-2">
                  Desafio Diário Adaptativo
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-6">
                  Responda a um quiz dinâmico de 5 questões escolhidas conforme sua maturidade de
                  leitura. Excelente para fixar a Palavra de Deus em sua mente.
                </p>
              </div>
              <button
                onClick={handleStartDailyQuiz}
                className="w-full rounded-2xl py-3 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.18 255), oklch(0.58 0.2 270))",
                  boxShadow: "0 4px 20px oklch(0.65 0.18 255 / 0.35)",
                }}
              >
                <Play className="w-3.5 h-3.5 fill-white text-transparent" />
                Começar Quiz do Dia
              </button>
            </div>

            {/* Smart review list */}
            <div
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.65 0.18 80 / 0.12), oklch(0.60 0.2 65 / 0.06))",
                border: "1px solid oklch(0.65 0.18 80 / 0.25)",
                boxShadow: "0 20px 40px oklch(0.65 0.18 80 / 0.08)",
              }}
            >
              <div className="w-full text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/25 mb-4 shrink-0">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-display text-lg text-white font-semibold mb-2">
                  Revisão Inteligente
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  Estude novamente as passagens ou perguntas que geraram dúvidas ou erros em quizzes
                  anteriores para retirá-las da fila.
                </p>

                {/* Review scrollable content */}
                <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
                  {reviewList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-white/30 border border-white/5 border-dashed rounded-2xl bg-white/1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400/40 mb-2 animate-pulse" />
                      <p className="text-[10px] uppercase font-semibold">Tudo revisado!</p>
                      <p className="text-[9px] text-white/20">Seus erros serão listados aqui.</p>
                    </div>
                  ) : (
                    reviewList.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-amber-300 font-semibold font-mono uppercase tracking-wider">
                            {q.book ? `${q.book} ${q.chapter}` : "Conhecimento Geral"}
                          </p>
                          <p className="text-[11px] text-white/70 truncate mt-0.5">{q.question}</p>
                        </div>
                        <button
                          onClick={() => handleStartReviewQuestion(q)}
                          className="shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-white bg-white/10 hover:bg-white/15 transition-all"
                        >
                          Refazer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Conquistas (Badges) Gallery */}
          <section className="mt-12 text-left">
            <div className="border-b border-white/5 pb-3 mb-6">
              <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                Galeria de Conquistas Acadêmicas
              </h3>
              <p className="text-xs text-white/40 mt-1">
                Conquiste medalhas estudando a Bíblia e acertando quizzes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  id: "first_step",
                  title: "Primeiro Passo",
                  description: "Acerte a primeira questão bíblica.",
                  icon: "📖",
                  glow: "rgba(99, 102, 241, 0.15)",
                  border: "rgba(99, 102, 241, 0.3)",
                },
                {
                  id: "constancy",
                  title: "Constância",
                  description: "Acerte 10 questões bíblicas.",
                  icon: "🌱",
                  glow: "rgba(34, 197, 94, 0.15)",
                  border: "rgba(34, 197, 94, 0.3)",
                },
                {
                  id: "genesis_specialist",
                  title: "Especialista em Gênesis",
                  description: "Gabarite o quiz de Gênesis 1.",
                  icon: "📚",
                  glow: "rgba(245, 158, 11, 0.15)",
                  border: "rgba(245, 158, 11, 0.3)",
                },
                {
                  id: "gospels_connoisseur",
                  title: "Conhecedor dos Evangelhos",
                  description: "Gabarite o quiz de João 1.",
                  icon: "👑",
                  glow: "rgba(236, 72, 153, 0.15)",
                  border: "rgba(236, 72, 153, 0.3)",
                },
              ].map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-500 ${
                      isUnlocked ? "opacity-100 scale-100" : "opacity-40 grayscale"
                    }`}
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, oklch(0.18 0.04 260 / 0.8), oklch(0.14 0.03 260 / 0.9))`
                        : "oklch(1 0 0 / 0.03)",
                      border: isUnlocked
                        ? `1px solid ${badge.border}`
                        : "1px solid oklch(1 0 0 / 0.06)",
                      boxShadow: isUnlocked ? `0 12px 32px ${badge.glow}` : "none",
                    }}
                  >
                    <span className="text-4xl mb-3 block">{badge.icon}</span>
                    <h4 className="text-xs font-semibold text-white/95 leading-tight">
                      {badge.title}
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1.5 leading-snug">
                      {badge.description}
                    </p>
                    {isUnlocked ? (
                      <span className="mt-3 text-[9px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="mt-3 text-[9px] uppercase tracking-wider font-semibold text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        Bloqueado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ── Daily Quiz Modal ── */}
      <AnimatePresence>
        {showDailyQuiz && dailyQuestions.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={() => setShowDailyQuiz(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] rounded-3xl p-6 max-w-md mx-auto space-y-4 text-left"
              style={{
                background: "oklch(0.14 0.03 270 / 0.98)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display text-md text-white font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  Quiz Diário Adaptativo
                </h3>
                <span className="text-[10px] font-mono text-white/40">
                  {dailyStep < dailyQuestions.length
                    ? `${dailyStep + 1} de ${dailyQuestions.length}`
                    : "Concluído"}
                </span>
              </div>

              {/* Modal Body */}
              {dailyStep < dailyQuestions.length ? (
                <div className="space-y-4">
                  {/* Difficulty Tag */}
                  <span className="inline-block text-[9px] font-semibold text-violet-300 bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20 uppercase tracking-wider">
                    Nível: {dailyQuestions[dailyStep].difficulty}
                  </span>

                  <h4 className="text-sm font-semibold text-white leading-relaxed">
                    {dailyQuestions[dailyStep].question}
                  </h4>

                  {/* Render based on question type */}
                  {/* MULTIPLE CHOICE / TRUE FALSE / CONTEXT */}
                  {(dailyQuestions[dailyStep].type === "multiple-choice" ||
                    dailyQuestions[dailyStep].type === "true-false" ||
                    dailyQuestions[dailyStep].type === "context") && (
                    <div className="space-y-2">
                      {dailyQuestions[dailyStep].options?.map((opt) => {
                        const isSelected = selectedAns === opt;
                        const isCorrect = opt === dailyQuestions[dailyStep].correctAnswer;
                        let optionStyle: React.CSSProperties = {
                          background: "oklch(1 0 0 / 0.04)",
                          border: "1px solid oklch(1 0 0 / 0.08)",
                          color: "oklch(1 0 0 / 0.8)",
                        };

                        if (hasSubmittedAns) {
                          if (isCorrect) {
                            optionStyle = {
                              background: "oklch(0.65 0.18 155 / 0.15)",
                              border: "1px solid oklch(0.65 0.18 155 / 0.4)",
                              color: "oklch(0.85 0.15 155)",
                            };
                          } else if (isSelected) {
                            optionStyle = {
                              background: "oklch(0.65 0.22 355 / 0.15)",
                              border: "1px solid oklch(0.65 0.22 355 / 0.4)",
                              color: "oklch(0.85 0.22 355)",
                            };
                          }
                        } else if (isSelected) {
                          optionStyle = {
                            background: "oklch(0.65 0.18 255 / 0.15)",
                            border: "1px solid oklch(0.65 0.18 255 / 0.4)",
                            color: "oklch(0.85 0.1 255)",
                          };
                        }

                        return (
                          <button
                            key={opt}
                            disabled={hasSubmittedAns}
                            onClick={() => setSelectedAns(opt)}
                            className="w-full text-left rounded-xl px-4 py-3 text-xs transition-all hover:bg-white/5 disabled:pointer-events-none active:scale-95"
                            style={optionStyle}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* FILL BLANK */}
                  {dailyQuestions[dailyStep].type === "fill-blank" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        disabled={hasSubmittedAns}
                        value={selectedAns || ""}
                        onChange={(e) => setSelectedAns(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="w-full rounded-xl px-4 py-2.5 text-xs bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                      />
                      {hasSubmittedAns && (
                        <p className="text-xs text-white/55 mt-1 text-left">
                          Resposta correta:{" "}
                          <span className="text-emerald-400 font-semibold">
                            {dailyQuestions[dailyStep].correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* CHRONOLOGICAL ORDERING */}
                  {dailyQuestions[dailyStep].type === "chronological" && (
                    <div className="space-y-3.5 text-left">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                          Sua Sequência (Clique para remover):
                        </p>
                        <div className="min-h-[44px] p-2.5 rounded-xl bg-white/3 border border-white/5 flex flex-wrap gap-1.5 items-center">
                          {selectedChronological.length === 0 ? (
                            <span className="text-[11px] text-white/20 italic">
                              Selecione os itens abaixo na ordem correta...
                            </span>
                          ) : (
                            selectedChronological.map((item, index) => (
                              <button
                                key={item}
                                disabled={hasSubmittedAns}
                                onClick={() => {
                                  setSelectedChronological(
                                    selectedChronological.filter((x) => x !== item),
                                  );
                                  setShuffledChronological([...shuffledChronological, item]);
                                }}
                                className="text-[10px] bg-violet-500/10 border border-violet-500/30 text-violet-300 font-semibold rounded-lg px-2.5 py-1 flex items-center gap-1 active:scale-95"
                              >
                                <span className="text-[8px] bg-violet-500/30 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                {item}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {!hasSubmittedAns && shuffledChronological.length > 0 && (
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                            Opções Disponíveis:
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {shuffledChronological.map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  setSelectedChronological([...selectedChronological, item]);
                                  setShuffledChronological(
                                    shuffledChronological.filter((x) => x !== item),
                                  );
                                }}
                                className="w-full text-left rounded-xl bg-white/5 border border-white/8 text-white/80 hover:bg-white/8 hover:text-white px-4 py-2.5 text-xs transition-all active:scale-95"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasSubmittedAns && selectedChronological.length > 0 && (
                        <button
                          onClick={() => {
                            setShuffledChronological(
                              [...dailyQuestions[dailyStep].chronologicalItems!].sort(
                                () => Math.random() - 0.5,
                              ),
                            );
                            setSelectedChronological([]);
                          }}
                          className="text-[10px] font-semibold text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Resetar ordem
                        </button>
                      )}

                      {hasSubmittedAns && (
                        <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                          <p className="text-[10px] uppercase font-bold text-white/40">
                            Gabarito Cronológico:
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-white/70">
                            {dailyQuestions[dailyStep].chronologicalItems?.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MATCHING CORRESPONDENCE */}
                  {dailyQuestions[dailyStep].type === "matching" && (
                    <div className="space-y-4 text-left">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">
                        Relacione cada item:
                      </p>

                      <div className="space-y-3">
                        {dailyQuestions[dailyStep].matchingLeft?.map((leftItem, idx) => (
                          <div
                            key={leftItem}
                            className="space-y-1 bg-white/2 border border-white/5 p-3 rounded-2xl"
                          >
                            <span className="text-xs font-semibold text-white/90">{leftItem}</span>

                            <select
                              disabled={hasSubmittedAns}
                              value={matchingSelections[leftItem] || ""}
                              onChange={(e) =>
                                setMatchingSelections({
                                  ...matchingSelections,
                                  [leftItem]: e.target.value,
                                })
                              }
                              className="w-full rounded-xl px-3 py-2 text-xs bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                            >
                              <option value="" className="bg-[#141225] text-white/40">
                                Selecione correspondência...
                              </option>
                              {shuffledMatchingRight.map((opt) => (
                                <option key={opt} value={opt} className="bg-[#141225] text-white">
                                  {opt}
                                </option>
                              ))}
                            </select>

                            {hasSubmittedAns && (
                              <p className="text-[10px] text-white/50 mt-1 leading-normal">
                                Resposta correta:{" "}
                                <span className="text-emerald-400 font-semibold">
                                  {dailyQuestions[dailyStep].matchingRight?.[idx]}
                                </span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback and Explanation */}
                  {hasSubmittedAns && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1.5 text-xs text-white/70 text-left"
                    >
                      <p className="font-semibold text-white">
                        {(() => {
                          const q = dailyQuestions[dailyStep];
                          let correct = false;
                          if (q.type === "chronological") {
                            correct =
                              selectedChronological.join("|") === q.chronologicalItems?.join("|");
                          } else if (q.type === "matching") {
                            correct =
                              q.matchingLeft?.every((leftItem, idx) => {
                                return matchingSelections[leftItem] === q.matchingRight?.[idx];
                              }) ?? false;
                          } else {
                            correct =
                              (selectedAns || "").toLowerCase().trim() ===
                              q.correctAnswer.toLowerCase().trim();
                          }
                          return correct ? "🎉 Resposta Correta!" : "❌ Resposta Incorreta!";
                        })()}
                      </p>
                      <p className="leading-relaxed">{dailyQuestions[dailyStep].explanation}</p>
                      <p className="text-[10px] text-white/40 font-mono">
                        Leitura sugerida: {dailyQuestions[dailyStep].suggestedReading}
                      </p>
                    </motion.div>
                  )}

                  {/* Footer actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    {!hasSubmittedAns ? (
                      <button
                        onClick={handleDailySubmit}
                        disabled={
                          (dailyQuestions[dailyStep].type === "chronological" &&
                            selectedChronological.length <
                              dailyQuestions[dailyStep].chronologicalItems!.length) ||
                          (dailyQuestions[dailyStep].type === "matching" &&
                            Object.keys(matchingSelections).length <
                              dailyQuestions[dailyStep].matchingLeft!.length) ||
                          ((dailyQuestions[dailyStep].type === "multiple-choice" ||
                            dailyQuestions[dailyStep].type === "true-false" ||
                            dailyQuestions[dailyStep].type === "context" ||
                            dailyQuestions[dailyStep].type === "fill-blank") &&
                            !selectedAns)
                        }
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 transition-all active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                        }}
                      >
                        Verificar Resposta
                      </button>
                    ) : (
                      <button
                        onClick={handleDailyNext}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                        }}
                      >
                        {dailyStep === dailyQuestions.length - 1
                          ? "Ver Resultados"
                          : "Próxima Pergunta"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Daily Quiz Results
                <div className="space-y-4 text-center py-4">
                  <div className="text-5xl animate-bounce">🏆</div>
                  <h4 className="font-display text-lg text-white font-semibold">
                    Quiz do Dia Concluído!
                  </h4>
                  <p className="text-xs text-white/50">
                    Você acertou <span className="text-violet-300 font-bold">{dailyScore}</span> de{" "}
                    <span className="text-white font-bold">{dailyQuestions.length}</span> perguntas
                    adaptadas.
                  </p>

                  <div className="flex justify-center gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setShowDailyQuiz(false)}
                      className="rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                      }}
                    >
                      Fechar Desafio
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Single Review Question Modal ── */}
      <AnimatePresence>
        {reviewQuestion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={() => setReviewQuestion(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] rounded-3xl p-6 max-w-md mx-auto space-y-4 text-left"
              style={{
                background: "oklch(0.14 0.03 270 / 0.98)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display text-md text-white font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Revisar:{" "}
                  {reviewQuestion.book
                    ? `${reviewQuestion.book} ${reviewQuestion.chapter}`
                    : "Estudo"}
                </h3>
                <button
                  onClick={() => setReviewQuestion(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white leading-relaxed">
                  {reviewQuestion.question}
                </h4>

                {/* Multiple choice options */}
                {(reviewQuestion.type === "multiple-choice" ||
                  reviewQuestion.type === "true-false" ||
                  reviewQuestion.type === "context") && (
                  <div className="space-y-2">
                    {reviewQuestion.options?.map((opt) => {
                      const isSelected = reviewSelectedAns === opt;
                      const isCorrect = opt === reviewQuestion.correctAnswer;
                      let optionStyle: React.CSSProperties = {
                        background: "oklch(1 0 0 / 0.04)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                        color: "oklch(1 0 0 / 0.8)",
                      };

                      if (reviewHasSubmitted) {
                        if (isCorrect) {
                          optionStyle = {
                            background: "oklch(0.65 0.18 155 / 0.15)",
                            border: "1px solid oklch(0.65 0.18 155 / 0.4)",
                            color: "oklch(0.85 0.15 155)",
                          };
                        } else if (isSelected) {
                          optionStyle = {
                            background: "oklch(0.65 0.22 355 / 0.15)",
                            border: "1px solid oklch(0.65 0.22 355 / 0.4)",
                            color: "oklch(0.85 0.22 355)",
                          };
                        }
                      } else if (isSelected) {
                        optionStyle = {
                          background: "oklch(0.65 0.18 255 / 0.15)",
                          border: "1px solid oklch(0.65 0.18 255 / 0.4)",
                          color: "oklch(0.85 0.1 255)",
                        };
                      }

                      return (
                        <button
                          key={opt}
                          disabled={reviewHasSubmitted}
                          onClick={() => setReviewSelectedAns(opt)}
                          className="w-full text-left rounded-xl px-4 py-3 text-xs transition-all hover:bg-white/5 disabled:pointer-events-none active:scale-95"
                          style={optionStyle}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill blank */}
                {reviewQuestion.type === "fill-blank" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      disabled={reviewHasSubmitted}
                      value={reviewSelectedAns || ""}
                      onChange={(e) => setReviewSelectedAns(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="w-full rounded-xl px-4 py-2.5 text-xs bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                    />
                    {reviewHasSubmitted && (
                      <p className="text-xs text-white/55 mt-1 text-left">
                        Resposta correta:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {reviewQuestion.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Chronological */}
                {reviewQuestion.type === "chronological" && (
                  <div className="space-y-3.5 text-left">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                        Sua Sequência (Clique para remover):
                      </p>
                      <div className="min-h-[44px] p-2.5 rounded-xl bg-white/3 border border-white/5 flex flex-wrap gap-1.5 items-center">
                        {revSelectedChronological.length === 0 ? (
                          <span className="text-[11px] text-white/20 italic">
                            Selecione os itens abaixo na ordem correta...
                          </span>
                        ) : (
                          revSelectedChronological.map((item, index) => (
                            <button
                              key={item}
                              disabled={reviewHasSubmitted}
                              onClick={() => {
                                setRevSelectedChronological(
                                  revSelectedChronological.filter((x) => x !== item),
                                );
                                setRevShuffledChronological([...revShuffledChronological, item]);
                              }}
                              className="text-[10px] bg-violet-500/10 border border-violet-500/30 text-violet-300 font-semibold rounded-lg px-2.5 py-1 flex items-center gap-1 active:scale-95"
                            >
                              <span className="text-[8px] bg-violet-500/30 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              {item}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {!reviewHasSubmitted && revShuffledChronological.length > 0 && (
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                          Opções Disponíveis:
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {revShuffledChronological.map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                setRevSelectedChronological([...revSelectedChronological, item]);
                                setRevShuffledChronological(
                                  revShuffledChronological.filter((x) => x !== item),
                                );
                              }}
                              className="w-full text-left rounded-xl bg-white/5 border border-white/8 text-white/80 hover:bg-white/8 hover:text-white px-4 py-2.5 text-xs transition-all active:scale-95"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!reviewHasSubmitted && revSelectedChronological.length > 0 && (
                      <button
                        onClick={() => {
                          setRevShuffledChronological(
                            [...reviewQuestion.chronologicalItems!].sort(() => Math.random() - 0.5),
                          );
                          setRevSelectedChronological([]);
                        }}
                        className="text-[10px] font-semibold text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resetar ordem
                      </button>
                    )}

                    {reviewHasSubmitted && (
                      <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                        <p className="text-[10px] uppercase font-bold text-white/40">Gabarito:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-white/70">
                          {reviewQuestion.chronologicalItems?.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* Matching */}
                {reviewQuestion.type === "matching" && (
                  <div className="space-y-4 text-left">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      Relacione cada item:
                    </p>

                    <div className="space-y-3">
                      {reviewQuestion.matchingLeft?.map((leftItem, idx) => (
                        <div
                          key={leftItem}
                          className="space-y-1 bg-white/2 border border-white/5 p-3 rounded-2xl"
                        >
                          <span className="text-xs font-semibold text-white/90">{leftItem}</span>

                          <select
                            disabled={reviewHasSubmitted}
                            value={revMatchingSelections[leftItem] || ""}
                            onChange={(e) =>
                              setRevMatchingSelections({
                                ...revMatchingSelections,
                                [leftItem]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl px-3 py-2 text-xs bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          >
                            <option value="" className="bg-[#141225] text-white/40">
                              Selecione correspondência...
                            </option>
                            {revShuffledMatchingRight.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#141225] text-white">
                                {opt}
                              </option>
                            ))}
                          </select>

                          {reviewHasSubmitted && (
                            <p className="text-[10px] text-white/50 mt-1 leading-normal">
                              Resposta correta:{" "}
                              <span className="text-emerald-400 font-semibold">
                                {reviewQuestion.matchingRight?.[idx]}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback explanation */}
                {reviewHasSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1.5 text-xs text-white/70 text-left"
                  >
                    <p className="font-semibold text-white">
                      {reviewIsCorrect
                        ? "🎉 Parabéns! Resposta Correta!"
                        : "❌ Resposta Incorreta!"}
                    </p>
                    <p className="leading-relaxed">{reviewQuestion.explanation}</p>
                    <p className="text-[10px] text-white/40 font-mono">
                      Leitura sugerida: {reviewQuestion.suggestedReading}
                    </p>
                  </motion.div>
                )}

                {/* Action button */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {!reviewHasSubmitted ? (
                    <button
                      onClick={handleReviewSubmit}
                      disabled={
                        (reviewQuestion.type === "chronological" &&
                          revSelectedChronological.length <
                            reviewQuestion.chronologicalItems!.length) ||
                        (reviewQuestion.type === "matching" &&
                          Object.keys(revMatchingSelections).length <
                            reviewQuestion.matchingLeft!.length) ||
                        ((reviewQuestion.type === "multiple-choice" ||
                          reviewQuestion.type === "true-false" ||
                          reviewQuestion.type === "context" ||
                          reviewQuestion.type === "fill-blank") &&
                          !reviewSelectedAns)
                      }
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 transition-all active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                      }}
                    >
                      Verificar Resposta
                    </button>
                  ) : (
                    <button
                      onClick={() => setReviewQuestion(null)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                      }}
                    >
                      Concluir Revisão
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Celebration Overlay ── */}
      <AnimatePresence>
        {celebratingChallenge && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setCelebratingChallenge(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
                transition={{ type: "spring", damping: 15 }}
                className="rounded-3xl p-8 max-w-sm w-full text-center space-y-5 border relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.2 0.04 260 / 0.95), oklch(0.14 0.03 260 / 0.98))",
                  border: "1px solid oklch(0.65 0.18 280 / 0.35)",
                  boxShadow: "0 32px 80px -10px oklch(0.65 0.18 280 / 0.4)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Floating sparkles background */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  <div className="absolute bottom-10 right-10 w-3 h-3 bg-rose-400 rounded-full animate-ping" />
                </div>

                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Trophy className="w-8 h-8 text-amber-300" />
                  </div>
                  {/* Decorative Sparkle icons */}
                  <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    Desafio Concluído! 🌟
                  </h3>
                  <p className="text-xs text-white/50 uppercase tracking-widest font-mono">
                    Fé em Ação
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-2xl block">{celebratingChallenge.emoji}</span>
                  <p className="text-xs font-semibold text-white/90 leading-snug">
                    {celebratingChallenge.title}
                  </p>
                </div>

                <p className="text-xs text-white/60 leading-relaxed px-2">
                  Você colocou o Evangelho em prática hoje. Lembre-se: a fé sem obras é infrutífera,
                  mas o amor demonstrado em atitudes aproxima as pessoas do amor do Pai.
                </p>

                <button
                  onClick={() => setCelebratingChallenge(null)}
                  className="w-full rounded-2xl py-3 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 355), oklch(0.55 0.24 340))",
                    boxShadow: "0 4px 16px oklch(0.65 0.22 355 / 0.3)",
                  }}
                >
                  Continuar Caminhada
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
