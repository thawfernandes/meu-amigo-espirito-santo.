import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { BIBLE_BOOKS, getVerses } from "@/lib/bible-data";
import { BibleQuestion } from "@/lib/quiz-data";
import {
  Telescope, Flame, BookOpen, Clock, Award, Target, HelpCircle,
  TrendingUp, Calendar, HeartHandshake, CheckCircle2, Bookmark,
  FileText, Trophy, Search, ChevronRight, Activity, ArrowUpRight,
  BookMarked, Lightbulb, Compass, Star, Sparkles, Check, Sparkle, AlertCircle, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export const Route = createFileRoute("/_authenticated/estatisticas")({ component: Stats });

interface Profile {
  created_at: string;
  display_name: string | null;
}

interface WalkProgress {
  percent: number;
  streak_days: number;
  chapters_read: number;
  prayers_count: number;
  studies_count: number;
  challenges_done: number;
  reading_minutes: number;
}

interface DatabasePrayer {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  answered_at: string | null;
  created_at: string;
}

interface NotebookStudy {
  id: string;
  title: string;
  status: "progress" | "completed";
  updatedAt: string;
}

interface HighlightItem {
  book: string;
  chapter: number;
  verse: number;
  color: "green" | "yellow" | "red";
  created_at: string;
}

interface NoteItem {
  book: string;
  chapter: number;
  verse: number;
  content: string;
  created_at: string;
}

interface ActivityItem {
  date: string; // YYYY-MM-DD
  type: "reading" | "prayer" | "study" | "challenge" | "note" | "highlight" | "quiz";
  detail: string;
}

function fmtDate(dStr: string) {
  return new Date(dStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

function fmtDateFull(dStr: string) {
  return new Date(dStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function Stats() {
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"constancia" | "biblia" | "conhecimento">("constancia");

  // User & DB Data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walk, setWalk] = useState<WalkProgress | null>(null);
  const [prayers, setPrayers] = useState<DatabasePrayer[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Local Storage Data
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [readChaptersHistory, setReadChaptersHistory] = useState<{ book: string; chapter: number; readAt: string }[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizHistory, setQuizHistory] = useState<{ date: string; isCorrect: boolean }[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [completedMonthlyChallenges, setCompletedMonthlyChallenges] = useState<{ id: string; completedAt: string }[]>([]);
  const [notebooks, setNotebooks] = useState<NotebookStudy[]>([]);

  // UI state for details
  const [selectedDayActivities, setSelectedDayActivities] = useState<{ date: string; items: ActivityItem[] } | null>(null);
  const [highlightModalColor, setHighlightModalColor] = useState<"green" | "yellow" | "red" | null>(null);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [bookFilter, setBookFilter] = useState<"all" | "AT" | "NT">("all");

  // 1. Initial Data Fetching
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const userId = u.user.id;
      setUid(userId);

      // Load Profile
      const { data: p } = await supabase.from("profiles").select("created_at, display_name").eq("id", userId).maybeSingle();
      if (p) setProfile(p as Profile);

      // Load Walk Progress
      const { data: w } = await supabase.from("walk_progress").select("*").eq("user_id", userId).maybeSingle();
      if (w) setWalk(w as WalkProgress);

      // Load Prayers/Devotionals
      const { data: prs } = await supabase.from("prayers").select("id, kind, title, body, answered_at, created_at").eq("user_id", userId);
      if (prs) setPrayers(prs as DatabasePrayer[]);

      // Load Highlights
      const { data: hls } = await supabase.from("highlights").select("book, chapter, verse, color, created_at").eq("user_id", userId);
      if (hls) setHighlights(hls as HighlightItem[]);

      // Load Notes
      const { data: nts } = await supabase.from("verse_notes").select("book, chapter, verse, content, created_at").eq("user_id", userId);
      if (nts) setNotes(nts as NoteItem[]);

      // Load Read Chapters from Supabase
      const { data: readChs } = await supabase.from("read_chapters").select("book, chapter").eq("user_id", userId);
      if (readChs) {
        const list = readChs.map(c => `${c.book}-${c.chapter}`);
        setReadChapters(list);
      }

      // Load Activity Log (Reading & Quiz history)
      const { data: acts } = await supabase.from("activity_log")
        .select("kind, payload, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (acts) {
        // Reading history
        const readHistory = acts.filter(a => a.kind === "reading").map(a => ({
          book: a.payload.book || "",
          chapter: a.payload.chapter || 1,
          readAt: a.created_at
        }));
        setReadChaptersHistory(readHistory);

        // Quiz history
        const qHistory = acts.filter(a => a.kind === "quiz").map(a => ({
          date: a.created_at,
          isCorrect: a.payload.isCorrect ?? true
        }));
        setQuizHistory(qHistory);
      }

      // Load Quiz Stats from Supabase
      const { data: stats } = await supabase.from("quiz_stats").select("correct_answers, total_answers").eq("user_id", userId).maybeSingle();
      if (stats) {
        setCorrectAnswersCount(stats.correct_answers || 0);
        setTotalQuestionsCount(stats.total_answers || 0);
      }

      // Load Unlocked Badges (completed challenges) from profiles
      const { data: pData } = await supabase.from("profiles").select("completed_challenges").eq("id", userId).maybeSingle();
      if (pData?.completed_challenges && Array.isArray(pData.completed_challenges)) {
        setUnlockedBadges(pData.completed_challenges);
      }

      // Load Completed Monthly Challenges
      const { data: mc } = await supabase.from("monthly_challenge_completions").select("challenge_id, completed_at, experience").eq("user_id", userId);
      if (mc) {
        setCompletedMonthlyChallenges(mc.map(r => ({
          id: r.challenge_id,
          completedAt: r.completed_at,
          experience: r.experience || undefined
        })));
      }

      // Load study notebooks count to determine studies_count
      const { count: nbCount } = await supabase.from("study_notebooks").select("*", { count: "exact", head: true }).eq("user_id", userId);
      setNotebooks(Array(nbCount || 0).fill({}));

      setLoading(false);
    })();
  }, []);

  // 2. Synchronize Walk Progress table on load (keeps GameWorld and Stats in perfect sync)
  useEffect(() => {
    if (!uid || loading) return;
    (async () => {
      const uniqueRead = readChapters.length;
      const totalPrayers = prayers.filter(p => p.kind === "prayer").length;
      const totalStudies = notebooks.length + prayers.filter(p => p.kind === "learning").length;
      const totalChallenges = completedMonthlyChallenges.length + unlockedBadges.length;

      // Formula for walked percentage progress in the Lumini game
      const computedPercent = Math.min(100, Math.round((uniqueRead * 1.5) + (totalPrayers * 4) + (totalStudies * 6) + (totalChallenges * 8)));

      await supabase.from("walk_progress").update({
        chapters_read: uniqueRead,
        prayers_count: totalPrayers,
        studies_count: totalStudies,
        challenges_done: totalChallenges,
        percent: computedPercent
      }).eq("user_id", uid);
    })();
  }, [uid, loading, readChapters, prayers, notebooks, completedMonthlyChallenges, unlockedBadges]);

  // 3. Composite all activities dynamically to build Constancy Grid and Timeline
  const allActivities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    // Bible chapters read
    readChaptersHistory.forEach(ch => {
      list.push({
        date: ch.readAt.split("T")[0],
        type: "reading",
        detail: `Leitura concluída: ${ch.book} ${ch.chapter}`
      });
    });

    // Highlights marked
    highlights.forEach(h => {
      list.push({
        date: h.created_at.split("T")[0],
        type: "highlight",
        detail: `Marcou ${h.book} ${h.chapter}:${h.verse} (${h.color === "green" ? "Coração" : h.color === "yellow" ? "Revisar" : "Estudo"})`
      });
    });

    // Notes created
    notes.forEach(n => {
      list.push({
        date: n.created_at.split("T")[0],
        type: "note",
        detail: `Anotação criada em ${n.book} ${n.chapter}:${n.verse}`
      });
    });

    // Prayers and Devotionals registered
    prayers.forEach(p => {
      const typeLabel = p.kind === "prayer" ? "Oração registrada" :
                        p.kind === "devotional" ? "Devocional escrito" :
                        p.kind === "purpose" ? "Propósito firmado" :
                        p.kind === "fast" ? "Jejum iniciado" :
                        p.kind === "gratitude" ? "Motivo de gratidão" :
                        p.kind === "learning" ? "Estudo / Aprendizado" : "Registro de Vida";
      list.push({
        date: p.created_at.split("T")[0],
        type: p.kind as any,
        detail: `${typeLabel}: "${p.title}"`
      });

      if (p.answered_at) {
        list.push({
          date: p.answered_at.split("T")[0],
          type: "prayer",
          detail: `Oração respondida por Deus: "${p.title}"`
        });
      }
    });

    // Monthly Challenges completed
    completedMonthlyChallenges.forEach(c => {
      list.push({
        date: c.completedAt.split("T")[0],
        type: "challenge",
        detail: `Concluiu o Desafio Mensal: "${c.id}"`
      });
    });

    // Quizzes answered
    quizHistory.forEach(q => {
      list.push({
        date: q.date.split("T")[0],
        type: "quiz",
        detail: `Respondeu a uma questão bíblica (${q.isCorrect ? "Acerto" : "Erro"})`
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [readChaptersHistory, highlights, notes, prayers, completedMonthlyChallenges, quizHistory]);

  // 4. Generate grid cells for GitHub-like Constancy Calendar (Last 24 Weeks)
  const constancyGrid = useMemo(() => {
    const cells = [];
    const today = new Date();
    // Align to Sunday 24 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 24 * 7);
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    // Generate 24 weeks of days
    const totalDays = 24 * 7;
    const tempDate = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = tempDate.toISOString().split("T")[0];
      const dayActivities = allActivities.filter(act => act.date === dateStr);
      
      cells.push({
        date: new Date(tempDate),
        dateStr,
        activitiesCount: dayActivities.length,
        activities: dayActivities
      });

      tempDate.setDate(tempDate.getDate() + 1);
    }
    return cells;
  }, [allActivities]);

  // Group constancy calendar by days of the week (to render grid rows)
  const constancyRows = useMemo(() => {
    const rows = Array.from({ length: 7 }).map(() => [] as typeof constancyGrid);
    const daysMin = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    const weeksCount = 24;
    for (let col = 0; col < weeksCount; col++) {
      for (let row = 0; row < 7; row++) {
        const index = col * 7 + row;
        if (constancyGrid[index]) {
          rows[row].push(constancyGrid[index]);
        }
      }
    }
    return rows;
  }, [constancyGrid]);

  // 5. Calculate Monthly Activity Evolution Data for Recharts Graph
  const monthlyData = useMemo(() => {
    const data = [];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const year = d.getFullYear();
      
      const mStr = `${year}-${String(mIdx + 1).padStart(2, "0")}`;

      const readingCount = allActivities.filter(a => a.date.startsWith(mStr) && a.type === "reading").length;
      const studiesCount = allActivities.filter(a => a.date.startsWith(mStr) && (a.type === "study" || a.type === "learning")).length;
      const prayersCount = allActivities.filter(a => a.date.startsWith(mStr) && a.type === "prayer").length;
      const challengesCount = allActivities.filter(a => a.date.startsWith(mStr) && a.type === "challenge").length;
      
      // Calculate unique active days in this month
      const uniqueDays = new Set(allActivities.filter(a => a.date.startsWith(mStr)).map(a => a.date));

      data.push({
        name: months[mIdx],
        "Leituras Bíblicas": readingCount,
        Estudos: studiesCount,
        Orações: prayersCount,
        Desafios: challengesCount,
        "Dias Ativos": uniqueDays.size
      });
    }
    return data;
  }, [allActivities]);

  // 6. Calculate Curiosities
  const curiosities = useMemo(() => {
    const facts: string[] = [];

    // Account creation date
    const createdDate = profile?.created_at ? new Date(profile.created_at) : new Date();
    const daysSinceStart = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // Day of the week of highest activity
    const weekdayCounts = Array(7).fill(0);
    const weekdayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    allActivities.forEach(a => {
      const d = new Date(a.date + "T12:00:00");
      weekdayCounts[d.getDay()]++;
    });
    const maxDayIdx = weekdayCounts.indexOf(Math.max(...weekdayCounts));
    if (weekdayCounts[maxDayIdx] > 0) {
      facts.push(`Seu dia preferido para caminhar é ${weekdayNames[maxDayIdx]}.`);
    }

    // Most studied/read book
    const bookCounts: Record<string, number> = {};
    readChaptersHistory.forEach(ch => { bookCounts[ch.book] = (bookCounts[ch.book] || 0) + 1; });
    highlights.forEach(h => { bookCounts[h.book] = (bookCounts[h.book] || 0) + 1; });
    notes.forEach(n => { bookCounts[n.book] = (bookCounts[n.book] || 0) + 1; });
    
    let favoriteBook = "";
    let maxBookCount = 0;
    Object.entries(bookCounts).forEach(([b, count]) => {
      if (count > maxBookCount) {
        maxBookCount = count;
        favoriteBook = b;
      }
    });
    if (favoriteBook) {
      facts.push(`O livro da Bíblia que você mais revisitou foi ${favoriteBook}.`);
    }

    // Peak active hour
    const hourCounts = Array(24).fill(0);
    // Parse read histories, notes, highlights timestamps
    readChaptersHistory.forEach(ch => { hourCounts[new Date(ch.readAt).getHours()]++; });
    highlights.forEach(h => { hourCounts[new Date(h.created_at).getHours()]++; });
    notes.forEach(n => { hourCounts[new Date(n.created_at).getHours()]++; });
    prayers.forEach(p => { hourCounts[new Date(p.created_at).getHours()]++; });

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    if (hourCounts[maxHour] > 0) {
      facts.push(`Seu horário preferido para comunhão é entre ${maxHour}h e ${maxHour + 1}h.`);
    }

    // Streak
    const currentStreak = walk?.streak_days || 0;
    if (currentStreak > 0) {
      facts.push(`Você está em uma sequência de constância de ${currentStreak} dia${currentStreak > 1 ? "s" : ""}.`);
    } else {
      facts.push("Que tal ler um capítulo hoje e iniciar uma sequência de constância?");
    }

    // Notes and markers highlights
    const bookWithMostHighlights = highlights.reduce((acc, h) => {
      acc[h.book] = (acc[h.book] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favHighlightBook = Object.entries(bookWithMostHighlights).sort((a,b) => b[1] - a[1])[0];
    if (favHighlightBook) {
      facts.push(`O livro com maior número de marcações de versículos é ${favHighlightBook[0]}.`);
    }

    const chapterWithMostNotes = notes.reduce((acc, n) => {
      const key = `${n.book} ${n.chapter}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favNotesChapter = Object.entries(chapterWithMostNotes).sort((a,b) => b[1] - a[1])[0];
    if (favNotesChapter) {
      facts.push(`Sua maior concentração de reflexões anotadas está em ${favNotesChapter[0]}.`);
    }

    return facts;
  }, [allActivities, profile, walk, readChaptersHistory, highlights, notes, prayers]);

  // 7. Calculate Milestones for the Timeline
  const timelineMilestones = useMemo(() => {
    const milestones: { icon: string; title: string; desc: string; date: string }[] = [];

    // Account creation
    if (profile?.created_at) {
      milestones.push({
        icon: "🌱",
        title: "Iniciou sua Caminhada",
        desc: "Criou sua conta e deu os primeiros passos de fé.",
        date: profile.created_at
      });
    }

    // Genesis completion
    const genesisChapters = readChaptersHistory.filter(ch => ch.book.toLowerCase() === "gênesis").map(ch => ch.chapter);
    const uniqueGenCh = new Set(genesisChapters);
    if (uniqueGenCh.size === 50) {
      const finishDate = readChaptersHistory.filter(ch => ch.book.toLowerCase() === "gênesis").sort((a,b) => b.readAt.localeCompare(a.readAt))[0]?.readAt;
      milestones.push({
        icon: "📖",
        title: "Concluiu Gênesis",
        desc: "Finalizou a leitura completa de todas as origens divinas.",
        date: finishDate || new Date().toISOString()
      });
    }

    // First prayer
    const oldestPrayer = [...prayers].filter(p => p.kind === "prayer").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
    if (oldestPrayer) {
      milestones.push({
        icon: "🙏",
        title: "Primeiro Clamor",
        desc: "Registrou sua primeira oração entregando suas súplicas ao Pai.",
        date: oldestPrayer.created_at
      });
    }

    // First study
    const completedStudies = [...notebooks].filter(n => n.status === "completed").sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))[0];
    if (completedStudies) {
      milestones.push({
        icon: "📚",
        title: "Primeiro Estudo Exegético",
        desc: `Concluiu seu primeiro caderno de estudos: "${completedStudies.title}".`,
        date: completedStudies.updatedAt
      });
    }

    // First quiz
    if (quizHistory.length > 0) {
      const oldestQuiz = [...quizHistory].sort((a,b) => a.date.localeCompare(b.date))[0];
      milestones.push({
        icon: "🏆",
        title: "Primeiro Quiz Respondido",
        desc: "Desafiou seus conhecimentos e memorização das Escrituras.",
        date: oldestQuiz.date
      });
    }

    // First monthly challenge
    if (completedMonthlyChallenges.length > 0) {
      const oldestChallenge = [...completedMonthlyChallenges].sort((a,b) => a.completedAt.localeCompare(b.completedAt))[0];
      milestones.push({
        icon: "❤️",
        title: "Fé em Ação",
        desc: "Concluiu com êxito seu primeiro desafio de amor e caridade.",
        date: oldestChallenge.completedAt
      });
    }

    return milestones.sort((a,b) => b.date.localeCompare(a.date));
  }, [profile, readChaptersHistory, prayers, notebooks, quizHistory, completedMonthlyChallenges]);

  // 8. Filter and Calculate Bible Books Progress
  const filteredBibleBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(bookSearchQuery.toLowerCase());
      const matchFilter = bookFilter === "all" || b.testament === bookFilter;
      return matchSearch && matchFilter;
    }).map(b => {
      // Find read chapters of this book
      const bookReadCh = readChapters.filter(c => c.startsWith(`${b.name}-`));
      const readCount = bookReadCh.length;
      const pct = Math.round((readCount / b.chapters) * 100);
      let status: "not_started" | "in_progress" | "completed" = "not_started";
      if (pct === 100) status = "completed";
      else if (pct > 0) status = "in_progress";

      return {
        ...b,
        readCount,
        pct,
        status
      };
    });
  }, [bookSearchQuery, bookFilter, readChapters]);

  // 9. Load Verses Text for Markers Modals
  const getHighlightedVersesList = (color: "green" | "yellow" | "red") => {
    const list = highlights.filter(h => h.color === color);
    return list.map(h => {
      // Load actual text from bible-data if available
      const verses = getVerses("NVI", h.book, h.chapter);
      const text = verses[h.verse] || "Texto indisponível para este livro.";
      return {
        ...h,
        text
      };
    });
  };

  const getQuizPerformance = () => {
    const pct = totalQuestionsCount > 0 ? Math.round((correctAnswersCount / totalQuestionsCount) * 100) : 0;
    
    // Performance subjects based on question history
    const booksDone: Record<string, { correct: number; total: number }> = {};
    
    readChaptersHistory.forEach(ch => {
      if (!booksDone[ch.book]) booksDone[ch.book] = { correct: 0, total: 0 };
    });

    // Add some default categories based on quizzes completed
    const bestSubjects: string[] = [];
    const revisionSubjects: string[] = [];

    if (correctAnswersCount > 0) {
      if (correctAnswersCount >= 1) bestSubjects.push("Evangelhos e Ensinos de Jesus (João)");
      if (correctAnswersCount >= 5) bestSubjects.push("Pentateuco e Origens (Gênesis)");
      if (correctAnswersCount >= 10) bestSubjects.push("Poesia e Orações (Salmos)");
    } else {
      bestSubjects.push("Inicie um Quiz para ver seu desempenho");
    }

    if (totalQuestionsCount - correctAnswersCount > 0) {
      revisionSubjects.push("Profecias do Antigo Testamento");
      revisionSubjects.push("Epístolas Paulinas e Aplicação Prática");
    } else {
      revisionSubjects.push("Sem assuntos críticos pendentes de revisão");
    }

    return {
      pct,
      best: bestSubjects,
      rev: revisionSubjects
    };
  };

  const quizPerf = getQuizPerformance();

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 text-white/30 gap-3">
          <Activity className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-sm font-semibold">Calculando sua caminhada cristã...</p>
        </div>
      </AppShell>
    );
  }

  // Count active days
  const createdDate = profile?.created_at ? new Date(profile.created_at) : new Date();
  const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const totalPrayersCount = prayers.filter(p => p.kind === "prayer").length;
  const totalPrayersAnswered = prayers.filter(p => p.kind === "prayer" && p.answered_at).length;
  const totalStudiesCount = notebooks.length + prayers.filter(p => p.kind === "learning").length;

  return (
    <AppShell>
      {/* ── Title and Heading ── */}
      <div className="animate-fade-up mb-6 text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-sky-400/60 mb-1">Estatísticas</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Sua jornada visual</h1>
        <p className="text-white/40 mt-1.5 text-sm max-w-md">
          Acompanhe os hábitos que você tem fortalecido e sua constância diária em Deus.
        </p>
      </div>

      {/* ── Resumo Geral (Topo da Página) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        {[
          { icon: Calendar, label: "Dias caminhando", v: `${diffDays} d`, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/5", glow: "oklch(0.65 0.18 155 / 0.12)" },
          { icon: Flame, label: "Dias consecutivos", v: `${walk?.streak_days || 0} d`, color: "text-orange-400", bg: "from-orange-500/10 to-amber-500/5", glow: "oklch(0.65 0.2 40 / 0.12)" },
          { icon: BookOpen, label: "Capítulos lidos", v: `${readChapters.length}`, color: "text-amber-400", bg: "from-amber-500/10 to-yellow-500/5", glow: "oklch(0.75 0.18 80 / 0.12)" },
          { icon: BookMarked, label: "Livros concluídos", v: `${BIBLE_BOOKS.filter(b => readChapters.filter(c => c.startsWith(`${b.name}-`)).length === b.chapters).length}`, color: "text-rose-400", bg: "from-rose-500/10 to-pink-500/5", glow: "oklch(0.65 0.22 355 / 0.12)" },
          { icon: Bookmark, label: "Versículos marcados", v: `${highlights.length}`, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/5", glow: "oklch(0.6 0.2 280 / 0.12)" },
          { icon: FileText, label: "Reflexões escritas", v: `${notes.length}`, color: "text-sky-400", bg: "from-sky-500/10 to-blue-500/5", glow: "oklch(0.65 0.18 220 / 0.12)" },
          { icon: Trophy, label: "Estudos concluídos", v: `${totalStudiesCount}`, color: "text-fuchsia-400", bg: "from-fuchsia-500/10 to-indigo-500/5", glow: "oklch(0.6 0.2 280 / 0.12)" },
          { icon: HelpCircle, label: "Quizzes resolvidos", v: `${totalQuestionsCount}`, color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-500/5", glow: "oklch(0.65 0.18 220 / 0.12)" },
          { icon: Target, label: "Desafios mensais", v: `${completedMonthlyChallenges.length}`, color: "text-emerald-300", bg: "from-emerald-400/10 to-green-500/5", glow: "oklch(0.65 0.18 155 / 0.12)" },
          { icon: HeartHandshake, label: "Orações feitas", v: `${totalPrayersCount}`, color: "text-red-400", bg: "from-red-500/10 to-rose-500/5", glow: "oklch(0.62 0.22 15 / 0.12)" },
          { icon: CheckCircle2, label: "Orações respondidas", v: `${totalPrayersAnswered}`, color: "text-emerald-400", bg: "from-emerald-500/10 to-green-500/5", glow: "oklch(0.65 0.18 155 / 0.12)" },
          { icon: Sparkles, label: "Aproveitamento Quiz", v: `${quizPerf.pct}%`, color: "text-amber-300", bg: "from-amber-400/10 to-yellow-500/5", glow: "oklch(0.75 0.18 80 / 0.12)" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-3xl p-5 flex flex-col justify-between text-left transition-all hover:scale-[1.02] duration-300"
            style={{
              background: `linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))`,
              border: "1px solid oklch(1 0 0 / 0.13)",
              boxShadow: `0 12px 28px -8px ${s.glow}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider text-white/50 leading-tight`}>{s.label}</span>
              <s.icon className={`w-4.5 h-4.5 ${s.color} opacity-85 shrink-0`} />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white mt-3 leading-none">{s.v}</p>
          </div>
        ))}
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex gap-2 p-1.5 mb-8 rounded-2xl bg-white/4 border border-white/8 max-w-xl mx-auto sm:mx-0">
        {[
          { id: "constancia", label: "Constância & Evolução", icon: Calendar },
          { id: "biblia", label: "Progresso Bíblico", icon: BookOpen },
          { id: "conhecimento", label: "Conhecimento & Conquistas", icon: Trophy }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === t.id
                ? "bg-white/10 text-white shadow-lg border border-white/10"
                : "text-white/45 hover:text-white/85"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN TAB CONTENTS ── */}
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* ==================== TAB: CONSTANCIA & EVOLUCAO ==================== */}
        {activeTab === "constancia" && (
          <div className="space-y-6">
            
            {/* Grid 2 Columns: Chart & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Monthly Evolution Chart */}
              <div
                className="lg:col-span-7 rounded-3xl p-5 sm:p-6 text-left flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
              >
                <div className="mb-4">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-sky-400" />
                    Evolução da Atividade Mensal
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Acompanhe a constância de suas atividades espirituais nos últimos meses.</p>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.75 0.18 80)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="oklch(0.75 0.18 80)" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorPrayers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.62 0.22 15)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="oklch(0.62 0.22 15)" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          background: "oklch(0.14 0.03 260 / 0.98)", 
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "16px",
                          color: "#fff"
                        }}
                      />
                      <Area type="monotone" dataKey="Leituras Bíblicas" stroke="oklch(0.75 0.18 80)" fillOpacity={1} fill="url(#colorRead)" />
                      <Area type="monotone" dataKey="Orações" stroke="oklch(0.62 0.22 15)" fillOpacity={1} fill="url(#colorPrayers)" />
                      <Area type="monotone" dataKey="Dias Ativos" stroke="oklch(0.65 0.18 155)" fillOpacity={1} fill="url(#colorActive)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Constancy Calendar (Contribution Grid) */}
              <div
                className="lg:col-span-5 rounded-3xl p-5 sm:p-6 text-left flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
              >
                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    Calendário de Constância
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Sua presença nas Escrituras e orações ao longo dos últimos meses.</p>
                </div>

                {/* Contribution Map Grid */}
                <div className="my-5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                  <div className="flex flex-col gap-1 min-w-[280px]">
                    {constancyRows.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-1 items-center">
                        <span className="w-5 text-[9px] text-white/30 text-right mr-1.5 font-mono">
                          {rowIdx === 1 ? "Seg" : rowIdx === 3 ? "Qua" : rowIdx === 5 ? "Sex" : ""}
                        </span>
                        {row.map((cell, cellIdx) => {
                          let colorClass = "bg-white/5 border-white/3";
                          if (cell.activitiesCount > 0) {
                            if (cell.activitiesCount <= 2) colorClass = "bg-emerald-500/25 border-emerald-400/20";
                            else if (cell.activitiesCount <= 4) colorClass = "bg-emerald-500/50 border-emerald-400/40";
                            else colorClass = "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/20";
                          }
                          const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

                          return (
                            <button
                              key={cellIdx}
                              onClick={() => setSelectedDayActivities({ date: cell.dateStr, items: cell.activities })}
                              className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 border hover:scale-125 focus:outline-none ${colorClass} ${
                                isToday ? "ring-1 ring-white scale-110" : ""
                              }`}
                              title={`${cell.date.toLocaleDateString("pt-BR")}: ${cell.activitiesCount} atividades`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-[10px] text-white/35 font-mono border-t border-white/5 pt-3.5">
                  <span>Menos ativo</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/5" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/25 border border-emerald-400/20" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50 border border-emerald-400/40" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
                  </div>
                  <span>Mais ativo</span>
                </div>
              </div>

            </div>

            {/* Selected day activity display card */}
            <AnimatePresence>
              {selectedDayActivities && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-5 rounded-3xl text-left border relative"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.16 0.03 260 / 0.95), oklch(0.12 0.02 260 / 0.98))",
                      border: "1px solid oklch(0.65 0.18 155 / 0.25)",
                    }}
                  >
                    <button
                      onClick={() => setSelectedDayActivities(null)}
                      className="absolute top-4 right-4 text-white/30 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/5"
                    >
                      Fechar
                    </button>
                    <h4 className="font-semibold text-sm text-emerald-400 font-mono">
                      📅 Atividades em {fmtDateFull(selectedDayActivities.date)}
                    </h4>
                    
                    {selectedDayActivities.items.length === 0 ? (
                      <p className="text-xs text-white/45 mt-3">Nenhum registro de atividade inserido neste dia específico.</p>
                    ) : (
                      <ul className="space-y-2 mt-4">
                        {selectedDayActivities.items.map((act, i) => (
                          <li key={i} className="text-xs text-white/80 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{act.detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Curiosidades Pessoais (Fun Facts) */}
            <section className="text-left">
              <h3 className="font-display text-lg text-white font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse" />
                Curiosidades da sua Caminhada
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {curiosities.slice(0, 6).map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl flex items-start gap-3.5 transition-all hover:bg-white/4"
                    style={{
                      background: "oklch(1 0 0 / 0.03)",
                      border: "1px solid oklch(1 0 0 / 0.07)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg shrink-0 mt-0.5">
                      💡
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed font-medium mt-1">{fact}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB: BIBLE PROGRESS ==================== */}
        {activeTab === "biblia" && (
          <div className="space-y-6">
            
            {/* Markers highlight section */}
            <section className="text-left">
              <h3 className="font-display text-lg text-white font-semibold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-violet-400" />
                Versículos Marcados por Categoria
              </h3>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { color: "green" as const, dot: "bg-emerald-400", label: "Coração", count: highlights.filter(h => h.color === "green").length, desc: "Textos que tocaram profundamente o coração.", glow: "oklch(0.65 0.18 155 / 0.1)" },
                  { color: "yellow" as const, dot: "bg-amber-400", label: "Para Revisar", count: highlights.filter(h => h.color === "yellow").length, desc: "Passagens para reler com calma.", glow: "oklch(0.75 0.18 80 / 0.1)" },
                  { color: "red" as const, dot: "bg-rose-400", label: "Estudo Profundo", count: highlights.filter(h => h.color === "red").length, desc: "Versículos com dúvidas exegéticas a estudar.", glow: "oklch(0.65 0.22 355 / 0.1)" },
                ].map(item => (
                  <button
                    key={item.color}
                    onClick={() => setHighlightModalColor(item.color)}
                    className="p-5 rounded-3xl flex flex-col justify-between text-left transition-all hover:scale-[1.02] duration-300"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
                      border: "1px solid oklch(1 0 0 / 0.13)",
                      boxShadow: `0 12px 28px -10px ${item.glow}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${item.dot}`} />
                      <h4 className="font-semibold text-sm text-white">{item.label}</h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-auto">
                      <span className="text-2xl font-bold text-white font-mono">{item.count}</span>
                      <span className="text-[10px] uppercase font-bold text-violet-300 hover:text-white flex items-center gap-1.5 transition-colors">
                        Ver Lista <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Bible Books progress view */}
            <section className="text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-lg text-white font-semibold flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-amber-300" />
                    Leitura dos Livros da Bíblia
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Monitore quais livros você está lendo ou já concluiu.</p>
                </div>

                {/* Filter and search controls */}
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/5 border border-white/10 w-full sm:w-52">
                    <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <input
                      value={bookSearchQuery}
                      onChange={e => setBookSearchQuery(e.target.value)}
                      placeholder="Buscar livro..."
                      className="bg-transparent text-xs text-white outline-none w-full placeholder:text-white/30"
                    />
                  </div>

                  <select
                    value={bookFilter}
                    onChange={e => setBookFilter(e.target.value as any)}
                    className="bg-white/5 text-white rounded-xl px-2.5 py-2 text-xs border border-white/10 outline-none shrink-0"
                  >
                    <option value="all" className="bg-[#17152b]">Todos</option>
                    <option value="AT" className="bg-[#17152b]">A. Testamento</option>
                    <option value="NT" className="bg-[#17152b]">N. Testamento</option>
                  </select>
                </div>
              </div>

              {/* Grid of Books */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {filteredBibleBooks.map(b => (
                  <div
                    key={b.name}
                    className="rounded-2xl p-4.5 transition-all text-left flex flex-col justify-between"
                    style={{
                      background: "oklch(1 0 0 / 0.03)",
                      border: b.status === "completed" ? "1px solid oklch(0.65 0.18 155 / 0.4)" :
                              b.status === "in_progress" ? "1px solid oklch(0.65 0.18 220 / 0.4)" :
                              "1px solid oklch(1 0 0 / 0.06)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-white/95 leading-tight">{b.name}</h4>
                        <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider block mt-1">
                          {b.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"}
                        </span>
                      </div>
                      
                      {b.status === "completed" && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                          Concluído
                        </span>
                      )}
                      {b.status === "in_progress" && (
                        <span className="text-[9px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          Lendo
                        </span>
                      )}
                      {b.status === "not_started" && (
                        <span className="text-[9px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                          Não Lido
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center text-[10px] text-white/40 mb-1.5 font-mono">
                        <span>{b.readCount} de {b.chapters} capítulos</span>
                        <span className="font-bold text-white/80">{b.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            b.status === "completed" ? "bg-emerald-500" : "bg-sky-500"
                          }`}
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB: CONHECIMENTO & CONQUISTAS ==================== */}
        {activeTab === "conhecimento" && (
          <div className="space-y-8">
            
            {/* Biblical Knowledge Stats & Revision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stats & Topics */}
              <div
                className="rounded-3xl p-5 sm:p-6 text-left flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
              >
                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-400" />
                    Desempenho Bíblico
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Evolução do aprendizado nos questionários bíblicos.</p>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <span className="text-[10px] text-white/45 uppercase tracking-wider block font-semibold mb-1.5">Tópicos com Melhor Aproveitamento</span>
                    <ul className="space-y-1.5">
                      {quizPerf.best.map((topic, i) => (
                        <li key={i} className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-[10px] text-white/45 uppercase tracking-wider block font-semibold mb-1.5">Tópicos para Revisão e Reforço</span>
                    <ul className="space-y-1.5">
                      {quizPerf.rev.map((topic, i) => (
                        <li key={i} className="text-xs text-amber-300/80 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[10px] text-white/30 border-t border-white/5 pt-3.5">
                  * Os dados de conhecimento bíblico visam puramente inspirar constância no aprendizado diário.
                </div>
              </div>

              {/* Milestones timeline */}
              <div
                className="rounded-3xl p-5 sm:p-6 text-left flex flex-col"
                style={{
                  background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
              >
                <div className="mb-5">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-sky-400" />
                    Marcos Históricos da Jornada
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Momentos marcantes da sua constância com Deus.</p>
                </div>

                {/* Timeline */}
                <div className="relative border-l border-white/10 ml-3 pl-5 space-y-5 max-h-[250px] overflow-y-auto pr-1">
                  {timelineMilestones.length === 0 ? (
                    <div className="text-xs text-white/40 italic py-4">
                      Sua linha do tempo está aguardando os primeiros marcos! Comece lendo a Bíblia ou fazendo uma oração.
                    </div>
                  ) : (
                    timelineMilestones.map((ms, idx) => (
                      <div key={idx} className="relative">
                        {/* circle */}
                        <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-sky-400 flex items-center justify-center text-[10px] ring-4 ring-slate-900">
                          
                        </span>
                        
                        <span className="text-[10px] font-mono text-white/35 block">{fmtDate(ms.date)}</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1.5">
                          <span>{ms.icon}</span> {ms.title}
                        </h4>
                        <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">{ms.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Achievements Collection Gallery */}
            <section className="text-left">
              <div className="border-b border-white/5 pb-3 mb-6">
                <h3 className="font-display text-lg text-white font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  Galeria de Conquistas da Jornada
                </h3>
                <p className="text-xs text-white/45 mt-1">Conquistas celebrando a leitura constante e a fé prática.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { id: "first_step", title: "Primeiro Passo", desc: "Respondeu à primeira questão bíblica.", icon: "📖", check: correctAnswersCount >= 1 },
                  { id: "constancy", title: "Constância", desc: "Respondeu a 10 questões bíblicas.", icon: "🌱", check: correctAnswersCount >= 10 },
                  { id: "notebook_creator", title: "Escrivão", desc: "Criou o primeiro caderno de estudos.", icon: "📚", check: notebooks.length >= 1 },
                  { id: "prayer_life", title: "Vida de Clamor", desc: "Registrou sua primeira oração.", icon: "🙏", check: totalPrayersCount >= 1 },
                  { id: "charity_first", title: "Fé com Obras", desc: "Concluiu o primeiro Desafio Mensal.", icon: "❤️", check: completedMonthlyChallenges.length >= 1 },
                ].map(badge => (
                  <div
                    key={badge.id}
                    className={`rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 ${
                      badge.check ? "opacity-100 scale-100" : "opacity-45 grayscale"
                    }`}
                    style={{
                      background: badge.check
                        ? "linear-gradient(135deg, oklch(0.18 0.04 260 / 0.8), oklch(0.14 0.03 260 / 0.9))"
                        : "oklch(1 0 0 / 0.03)",
                      border: badge.check ? "1px solid oklch(0.65 0.18 255 / 0.3)" : "1px solid oklch(1 0 0 / 0.06)",
                    }}
                  >
                    <span className="text-3.5xl mb-2.5 block">{badge.icon}</span>
                    <h4 className="text-[11px] font-semibold text-white/95 leading-tight">{badge.title}</h4>
                    <p className="text-[9px] text-white/40 mt-1 leading-snug">{badge.desc}</p>
                    {badge.check ? (
                      <span className="mt-3 text-[9px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        Adquirido
                      </span>
                    ) : (
                      <span className="mt-3 text-[9px] uppercase tracking-wider font-semibold text-white/25 bg-white/4 px-2 py-0.5 rounded-full">
                        Bloqueado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </div>

      {/* ── Inspiring final message card ── */}
      <div
        className="mt-8 rounded-3xl p-6 text-left flex flex-col sm:flex-row items-center gap-5 justify-between"
        style={{
          background: "linear-gradient(135deg, oklch(0.14 0.03 260 / 0.95), oklch(0.1 0.02 260 / 0.98))",
          border: "1px solid oklch(0.65 0.18 255 / 0.2)",
          boxShadow: "0 16px 40px -12px oklch(0.65 0.18 255 / 0.15)",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl shrink-0 mt-0.5">
            ✨
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Sua caminhada é única</h4>
            <p className="text-xs text-white/50 leading-relaxed mt-1 max-w-lg">
              Esta tela funciona como um diário visual de comunhão. Cada capítulo lido, oração anotada e quiz respondido são pequenos passos que constroem uma grande história de fé ao longo do tempo. O importante é continuar avançando, um dia de cada vez.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="rounded-2xl px-5 py-3 text-xs font-semibold text-white transition-all shrink-0 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.18 255), oklch(0.58 0.2 280))",
            boxShadow: "0 4px 16px oklch(0.65 0.18 255 / 0.25)"
          }}
        >
          Voltar ao Início
        </button>
      </div>

      {/* ── MODAL: Marked Verses List ── */}
      <AnimatePresence>
        {highlightModalColor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHighlightModalColor(null)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] rounded-3xl p-6 max-w-lg mx-auto flex flex-col text-left"
              style={{
                background: "oklch(0.14 0.03 260 / 0.98)",
                border: "1px solid oklch(0.65 0.18 255 / 0.35)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
                maxHeight: "75vh"
              }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4 shrink-0">
                <h3 className="font-display text-md text-white font-semibold flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-violet-400" />
                  Versículos Marcados — {
                    highlightModalColor === "green" ? "Coração" :
                    highlightModalColor === "yellow" ? "Revisar Depois" : "Estudo Profundo"
                  }
                </h3>
                <button
                  onClick={() => setHighlightModalColor(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/40"
                >
                  Fechar
                </button>
              </div>

              {/* Verses scrollable container */}
              <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
                {getHighlightedVersesList(highlightModalColor).length === 0 ? (
                  <div className="py-12 text-center text-white/30 text-xs">
                    Nenhum versículo marcado nesta categoria.
                  </div>
                ) : (
                  getHighlightedVersesList(highlightModalColor).map((v, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setHighlightModalColor(null);
                        // Navigate to the specific book & chapter in Bible reader
                        navigate({ to: "/biblia" });
                      }}
                      className="p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/6 transition-all cursor-pointer text-left"
                    >
                      <div className="flex justify-between items-center text-[10px] text-violet-300 font-mono font-bold uppercase tracking-wider mb-1.5">
                        <span>{v.book} {v.chapter}:{v.verse}</span>
                        <span className="text-[8px] text-white/30 font-normal">NVI</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed italic">"{v.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </AppShell>
  );
}
