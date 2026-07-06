import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BIBLE_BOOKS, getBook, TRANSLATIONS, getVerses } from "@/lib/bible-data";
import { getOriginalVerse } from "@/lib/original-translation";
import { getChapterQuiz, BibleQuestion, recordAnswer, recordQuizCompletion } from "@/lib/quiz-data";
import { useAudio } from "@/components/audio/AudioProvider";
import {
  BookOpen, ChevronLeft, ChevronRight, Minus, Plus,
  X, StickyNote, Check, Search, ChevronDown, BookMarked, Info, Award, HelpCircle,
  BookPlus, Scroll, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/biblia")({ component: Bible });

type HighlightColor = "green" | "yellow" | "red";
interface Highlight { verse: number; color: HighlightColor }
interface VerseNote  { verse: number; content: string }

const COLORS: Record<HighlightColor, { dot: string; bg: string; label: string; explanation: string }> = {
  green: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/15 ring-1 ring-emerald-400/30",
    label: "Verde — Entendi e marcou meu coração",
    explanation: "Usado para versículos que o usuário compreendeu e que falaram diretamente ao seu coração. São textos que ele deseja lembrar, aplicar ou revisitar futuramente."
  },
  yellow: {
    dot: "bg-amber-400",
    bg: "bg-amber-400/15 ring-1 ring-amber-400/30",
    label: "Amarelo — Quero revisar depois",
    explanation: "Para passagens que despertaram curiosidade ou que ainda não ficaram totalmente claras. O usuário entende parte do texto, mas sente que precisa voltar e estudá-lo com mais calma."
  },
  red: {
    dot: "bg-rose-400",
    bg: "bg-rose-400/15 ring-1 ring-rose-400/30",
    label: "Vermelho — Preciso estudar profundamente",
    explanation: "Para versículos que geraram dúvidas importantes, possuem um contexto difícil ou exigem um estudo mais aprofundado. Esses versículos ficarão separados para que o usuário possa retornar a eles posteriormente com auxílio da IA exegética."
  },
};

function useHighlights(uid: string|null, book: string, ch: number) {
  const [data, setData] = useState<Highlight[]>([]);
  const audio = useAudio();
  
  useEffect(() => {
    if (!uid) return;
    supabase.from("highlights").select("verse,color")
      .eq("user_id", uid).eq("version", "GLOBAL").eq("book", book).eq("chapter", ch)
      .then(({ data: d }) => { if (d) setData(d as Highlight[]); });
  }, [uid, book, ch]);

  const toggle = useCallback(async (verse: number, color: HighlightColor) => {
    if (!uid) return;
    audio.play("marker");
    const ex = data.find(h => h.verse === verse);
    if (ex?.color === color) {
      await supabase.from("highlights").delete()
        .eq("user_id", uid).eq("version", "GLOBAL").eq("book", book).eq("chapter", ch).eq("verse", verse);
      setData(d => d.filter(x => x.verse !== verse));
    } else {
      await supabase.from("highlights").upsert({ user_id: uid, version: "GLOBAL", book, chapter: ch, verse, color });
      setData(d => [...d.filter(x => x.verse !== verse), { verse, color }]);
    }
  }, [uid, book, ch, data, audio]);

  return { data, toggle };
}

function useNotes(uid: string|null, book: string, ch: number) {
  const [data, setData] = useState<VerseNote[]>([]);
  
  useEffect(() => {
    if (!uid) return;
    supabase.from("verse_notes").select("verse,content")
      .eq("user_id", uid).eq("version", "GLOBAL").eq("book", book).eq("chapter", ch)
      .then(({ data: d }) => { if (d) setData(d as VerseNote[]); });
  }, [uid, book, ch]);

  const save = useCallback(async (verse: number, content: string) => {
    if (!uid) return;
    if (!content.trim()) {
      await supabase.from("verse_notes").delete()
        .eq("user_id", uid).eq("version", "GLOBAL").eq("book", book).eq("chapter", ch).eq("verse", verse);
      setData(d => d.filter(x => x.verse !== verse));
      return;
    }
    await supabase.from("verse_notes").upsert({ user_id: uid, version: "GLOBAL", book, chapter: ch, verse, content });
    setData(d => [...d.filter(x => x.verse !== verse), { verse, content }]);
    toast.success("Anotação salva!");
  }, [uid, book, ch]);

  return { data, save };
}

// Debounce helper for preference sync
function useDebouncedCallback(fn: (...args: any[]) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function parseOriginalText(text: string, keyWords: any[] | null) {
  if (!text) return text;
  
  const regex = /\{\{(.*?)\}\}/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const term = match[1];
    const keyWordData = keyWords?.find(k => k.term === term);

    if (keyWordData) {
      parts.push(
        <Popover key={match.index}>
          <PopoverTrigger asChild>
            <span className="text-amber-300 font-medium underline decoration-amber-300/30 decoration-dashed underline-offset-4 cursor-pointer hover:text-amber-200 transition-colors" onClick={(e) => e.stopPropagation()}>
              {term}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-[#141419] border-white/10 text-white shadow-2xl rounded-2xl" onClick={e => e.stopPropagation()}>
            <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
              <Scroll className="w-3 h-3" /> Termo Original
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-display mt-2">{keyWordData.word}</p>
              <p className="text-[13px] text-white/60 italic">{keyWordData.transliteration}</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-white/90 leading-relaxed">{keyWordData.meaning}</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    } else {
      parts.push(
        <span key={match.index} className="text-amber-200/80">
          {term}
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts.map((p, i) => <span key={i}>{p}</span>)}</> : text;
}

export default function Bible() {
  const audio = useAudio();
  const navigate = useNavigate();
  const [uid, setUid]       = useState<string|null>(null);
  // Start with localStorage values as instant fallback while Supabase loads
  const [abbr, setAbbr]     = useState(() => typeof window !== "undefined" ? localStorage.getItem("bible.last_book") || "jo" : "jo");
  const [ch, setCh]         = useState(() => typeof window !== "undefined" ? Number(localStorage.getItem("bible.last_chapter")) || 1 : 1);
  const [translation] = useState("ORIGINAL");
  const setTranslation = () => {};
  const [showTranslations, setShowTranslations] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [fs, setFs]         = useState(() => typeof window !== "undefined" ? Number(localStorage.getItem("bible.font") || 18) : 18);
  const [showBooks, setShowBooks] = useState(false);
  const [showChs,  setShowChs]  = useState(false);
  const [bookQ, setBookQ]   = useState("");
  const [selVerse, setSelVerse] = useState<number|null>(null);
  const [noteVerse, setNoteVerse] = useState<number|null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [fetchedBibles, setFetchedBibles] = useState<Record<string, any>>({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [showOriginalNote, setShowOriginalNote] = useState<number|null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState<any[]>([]);
  // For "Add to notebook" feature
  const [addToNotebookVerse, setAddToNotebookVerse] = useState<number|null>(null);
  const [notebooks, setNotebooks] = useState<{id:string;title:string}[]>([]);
  const [originalVerses, setOriginalVerses] = useState<Record<number, { text: string; notes: string | null; originalLang: string | null; keyWords: any[] | null }>>({});
  const prefsLoadedRef = useRef(false);

  useEffect(() => {
    async function loadOriginalVerses() {
      if (!abbr || !ch) return;
      const { data, error } = await supabase
        .from("original_bible_verses")
        .select("verse, text, notes, original_lang, key_words")
        .eq("book_abbr", abbr)
        .eq("chapter", ch);
        
      if (!error && data) {
        const map: Record<number, { text: string; notes: string | null; originalLang: string | null; keyWords: any[] | null }> = {};
        data.forEach(row => {
          map[row.verse] = {
            text: row.text,
            notes: row.notes,
            originalLang: row.original_lang,
            keyWords: row.key_words
          };
        });
        setOriginalVerses(map);
      } else {
        setOriginalVerses({});
      }
    }
    loadOriginalVerses();
  }, [abbr, ch]);

  useEffect(() => {
    if (["NVI", "ACF", "AA", "ORIGINAL"].includes(translation)) {
      if (!fetchedBibles[translation]) {
        setLoadingTranslation(true);
        const fetchId = translation === "ORIGINAL" ? "acf" : translation.toLowerCase();
        fetch(`https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${fetchId}.json`)
          .then(r => r.json())
          .then(data => {
            setFetchedBibles(prev => ({ ...prev, [translation]: data }));
            setLoadingTranslation(false);
          })
          .catch(e => {
            console.error(e);
            setLoadingTranslation(false);
          });
      }
    } else if (translation === "AVE") {
      if (!fetchedBibles["AVE"]) {
        setLoadingTranslation(true);
        fetch(`https://raw.githubusercontent.com/fidalgobr/bibliaAveMariaJSON/main/bibliaAveMaria.json`)
          .then(r => r.json())
          .then(data => {
            setFetchedBibles(prev => ({ ...prev, AVE: [...data.antigoTestamento, ...data.novoTestamento] }));
            setLoadingTranslation(false);
          })
          .catch(e => {
            console.error(e);
            setLoadingTranslation(false);
          });
      }
    }
  }, [translation]);

  useEffect(() => {
    audio.setContext("biblia");
    audio.play("page");
  }, []);

  useEffect(() => {
    if (uid) {
      audio.play("page");
    }
  }, [ch, abbr]);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<BibleQuestion[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [hasSubmittedAns, setHasSubmittedAns] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const book = getBook(abbr)!;
  const { data: hl, toggle: toggleHL } = useHighlights(uid, book.name, ch);
  const { data: notes, save: saveNote } = useNotes(uid, book.name, ch);

  // Sync preferences to localStorage (instant) and Supabase (debounced)
  const syncPrefsToSupabase = useCallback((userId: string, newAbbr: string, newCh: number, newTranslation: string, newFs: number) => {
    supabase.from("reader_preferences").upsert({
      user_id: userId,
      last_book: newAbbr,
      last_chapter: newCh,
      translation: newTranslation,
      font_size: newFs
    }, { onConflict: "user_id" }).then(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("bible.translation", translation);
    if (uid) syncPrefsToSupabase(uid, abbr, ch, translation, fs);
  }, [translation]);

  useEffect(() => {
    localStorage.setItem("bible.last_book", abbr);
    localStorage.setItem("bible.last_chapter", String(ch));
    if (uid) syncPrefsToSupabase(uid, abbr, ch, translation, fs);
  }, [abbr, ch]);

  useEffect(() => {
    localStorage.setItem("bible.font", String(fs));
    if (uid) syncPrefsToSupabase(uid, abbr, ch, translation, fs);
  }, [fs]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const userId = data.user.id;
      setUid(userId);

      // ── On first load, pull preferences from Supabase ────────────────
      if (!prefsLoadedRef.current) {
        prefsLoadedRef.current = true;
        const { data: prefs } = await supabase
          .from("reader_preferences")
          .select("last_book, last_chapter, translation, font_size")
          .eq("user_id", userId)
          .maybeSingle();
        if (prefs) {
          // Only update if different from current (avoids spurious re-renders)
          if (prefs.last_book && prefs.last_book !== abbr) setAbbr(prefs.last_book);
          if (prefs.last_chapter && prefs.last_chapter !== ch) setCh(prefs.last_chapter);
          if (prefs.translation && prefs.translation !== translation) setTranslation(prefs.translation);
          if (prefs.font_size && prefs.font_size !== fs) setFs(prefs.font_size);
        }
        // Load notebooks list for "Add to notebook" feature
        const { data: nbs } = await supabase
          .from("study_notebooks")
          .select("id, title")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (nbs) setNotebooks(nbs);
      }
      
      // ── Update reading_progress (last position) ───────────────────────
      supabase.from("reading_progress").upsert({ 
        user_id: userId, 
        version: translation, 
        book: book.name, 
        chapter: ch, 
        verse: 1 
      }).then(() => {});

      // ── Record chapter as read in Supabase (cross-device sync) ────────
      const { error: rcErr } = await supabase
        .from("read_chapters")
        .upsert({ user_id: userId, book: book.name, chapter: ch }, { onConflict: "user_id,book,chapter" });

      if (!rcErr) {
        // It was a new chapter — update walk_progress
        const { count: totalRead } = await supabase
          .from("read_chapters")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const chaptersRead = totalRead || 0;
        const newPercent = Math.min(100, Math.round(chaptersRead * 1.5));

        supabase.from("walk_progress")
          .update({ chapters_read: chaptersRead, percent: newPercent })
          .eq("user_id", userId).then(() => {});

        // Also keep localStorage mirror for offline fallback
        try {
          const readChKey = `bible.readChapters_${userId}`;
          const readChapters = JSON.parse(localStorage.getItem(readChKey) || "[]");
          const entry = `${book.name}-${ch}`;
          if (!readChapters.includes(entry)) {
            readChapters.push(entry);
            localStorage.setItem(readChKey, JSON.stringify(readChapters));
          }
        } catch (_) {}

        logActivity(userId, "reading", { book: book.name, chapter: ch });
      }
    });
  }, [abbr, ch, translation]);

  // Note: font sync is handled in the dedicated useEffect above

  let verses: Record<number, string> = {};
  if (["NVI", "ACF", "AA", "AVE", "ORIGINAL"].includes(translation)) {
    if (loadingTranslation && !fetchedBibles[translation]) {
      verses = { 1: "Carregando tradução, aguarde..." };
    } else {
      const bibleData = fetchedBibles[translation];
      if (bibleData) {
        if (translation === "AVE") {
          const normalizedName = book.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const bookData = bibleData.find((b: any) => {
            const bName = b.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return bName === normalizedName || bName.includes(normalizedName) || normalizedName.includes(bName);
          });
          if (bookData) {
            const cap = bookData.capitulos.find((c: any) => c.capitulo === ch);
            if (cap) {
              cap.versiculos.forEach((v: any) => {
                verses[v.versiculo] = v.texto;
              });
            } else {
              verses = { 1: "Capítulo não encontrado na tradução selecionada." };
            }
          } else {
            verses = { 1: "Livro não encontrado na tradução selecionada." };
          }
        } else {
          const bookData = bibleData.find((b: any) => b.abbrev === abbr);
          if (bookData && bookData.chapters[ch - 1]) {
            bookData.chapters[ch - 1].forEach((text: string, i: number) => {
              verses[i + 1] = text;
            });
          } else {
             verses = { 1: "Capítulo não encontrado na tradução selecionada." };
          }
        }
      }
    }
  } else {
    verses = getVerses(translation, book.abbr, ch);
  }

  const atBooks = BIBLE_BOOKS.filter(b => b.testament==="AT" && b.name.toLowerCase().includes(bookQ.toLowerCase()));
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament==="NT" && b.name.toLowerCase().includes(bookQ.toLowerCase()));

  function goChapter(d: number) {
    const next = ch + d;
    if (next < 1) {
      const i = BIBLE_BOOKS.findIndex(b => b.abbr === abbr);
      if (i > 0) { setAbbr(BIBLE_BOOKS[i-1].abbr); setCh(BIBLE_BOOKS[i-1].chapters); }
    } else if (next > book.chapters) {
      const i = BIBLE_BOOKS.findIndex(b => b.abbr === abbr);
      if (i < BIBLE_BOOKS.length-1) { setAbbr(BIBLE_BOOKS[i+1].abbr); setCh(1); }
    } else {
      setCh(next); setSelVerse(null);
    }
  }

  // Quiz helper handlers
  const handleStartChapterQuiz = () => {
    const questions = getChapterQuiz(book.name, ch, 3);
    setQuizQuestions(questions);
    setQuizStep(0);
    setSelectedAns(null);
    setHasSubmittedAns(false);
    setQuizScore(0);
    setShowQuiz(true);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAns || hasSubmittedAns) return;
    const q = quizQuestions[quizStep];
    const correct = selectedAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    
    if (correct) {
      setQuizScore(s => s + 1);
      toast.success("Resposta Correta! 🎉");
      
      const unlocked = recordAnswer(true);
      unlocked.forEach(achName => {
        toast.success(`🏆 Conquista Desbloqueada: ${achName}!`);
      });
    } else {
      toast.error("Resposta incorreta.");
      
      // Save incorrect question to review list in localStorage
      const reviewListRaw = localStorage.getItem("bible.reviewList") || "[]";
      try {
        const list: BibleQuestion[] = JSON.parse(reviewListRaw);
        if (!list.some(x => x.id === q.id)) {
          list.push(q);
          localStorage.setItem("bible.reviewList", JSON.stringify(list));
        }
      } catch (err) {
        localStorage.setItem("bible.reviewList", JSON.stringify([q]));
      }
    }
    setHasSubmittedAns(true);
  };

  const handleNextQuizStep = () => {
    if (quizStep === quizQuestions.length - 1) {
      const unlocked = recordQuizCompletion(book.name, ch, quizScore, quizQuestions.length);
      unlocked.forEach(achName => {
        toast.success(`🏆 Conquista Desbloqueada: ${achName}!`);
      });
    }
    setSelectedAns(null);
    setHasSubmittedAns(false);
    setQuizStep(s => s + 1);
  };


  return (
    <AppShell>
      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setShowBooks(true); setBookQ(""); setShowChs(false); setShowTranslations(false); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-125"
            style={{ background: "oklch(0.55 0.18 85 / 0.2)", border: "1px solid oklch(0.55 0.18 85 / 0.35)" }}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span className="text-amber-200">{book.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          <button
            onClick={() => { setShowChs(v => !v); setShowBooks(false); setShowTranslations(false); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white/80 transition-all hover:text-white"
            style={{ background: "oklch(1 0 0 / 0.07)", border: "1px solid oklch(1 0 0 / 0.12)" }}
          >
            Cap. {ch} <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>

        <div
          className="flex items-center gap-1 rounded-xl px-2 py-1.5"
          style={{ background: "oklch(1 0 0 / 0.07)", border: "1px solid oklch(1 0 0 / 0.1)" }}
        >
          <button onClick={() => setFs(s => Math.max(14, s-1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-white/50 w-5 text-center">{fs}</span>
          <button onClick={() => setFs(s => Math.min(30, s+1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Legend/Tip Box ── */}
      <div className="mb-5">
        <button
          onClick={() => setShowLegend(v => !v)}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-all rounded-xl px-3 py-1.5"
          style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <Info className="w-3.5 h-3.5 text-amber-300" />
          <span>Guia de Cores dos Marcadores</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showLegend ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden rounded-2xl"
            >
              <div
                className="p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-300 text-left"
                style={{
                  background: "linear-gradient(135deg, oklch(0.18 0.04 260 / 0.8), oklch(0.14 0.03 260 / 0.9))",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Como utilizar os marcadores?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["green", "yellow", "red"] as HighlightColor[]).map(colorKey => (
                    <div
                      key={colorKey}
                      className="flex items-start gap-2.5 p-3 rounded-xl transition-all hover:bg-white/5"
                      style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.05)" }}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ${COLORS[colorKey].dot}`} />
                      <div>
                        <p className="text-xs font-semibold text-white/90">{COLORS[colorKey].label}</p>
                        <p className="text-[11px] text-white/60 leading-normal mt-0.5">{COLORS[colorKey].explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chapter picker ── */}
      <AnimatePresence>
        {showChs && (
          <motion.div
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="rounded-2xl p-4 mb-5 flex flex-wrap gap-1.5"
            style={{ background:"oklch(1 0 0 / 0.06)", border:"1px solid oklch(1 0 0 / 0.1)" }}
          >
            {Array.from({ length: book.chapters }, (_, i) => i+1).map(c => (
              <button
                key={c}
                onClick={() => { setCh(c); setShowChs(false); setSelVerse(null); }}
                className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                style={c === ch ? {
                  background: "linear-gradient(135deg, oklch(0.65 0.18 255), oklch(0.58 0.2 280))",
                  color: "white",
                  boxShadow: "0 4px 16px oklch(0.65 0.18 255 / 0.4)",
                } : { color: "oklch(1 0 0 / 0.6)" }}
                onMouseEnter={e => { if (c !== ch) (e.target as HTMLElement).style.background = "oklch(1 0 0 / 0.08)"; }}
                onMouseLeave={e => { if (c !== ch) (e.target as HTMLElement).style.background = ""; }}
              >{c}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bible text card ── */}
      <div
        className="rounded-3xl p-6 sm:p-10 relative"
        style={{
          background: "linear-gradient(160deg, oklch(0.17 0.04 260 / 0.95), oklch(0.13 0.025 260 / 0.98))",
          border: "1px solid oklch(0.55 0.18 85 / 0.2)",
          boxShadow: "0 0 0 1px oklch(0.55 0.18 85 / 0.08) inset, 0 32px 80px -20px oklch(0.55 0.18 85 / 0.15)",
        }}
        onClick={() => { setSelVerse(null); setShowChs(false); setShowTranslations(false); }}
      >
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400/60 mb-1">{translation}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-left">
            <span className="text-amber-300">{book.name}</span>{" "}
            <span className="text-white/40 font-normal">{ch}</span>
          </h1>
        </div>

        {/* Original translation banner */}
        {translation === "ORIGINAL" && (
          <div className="mb-6 px-4 py-3 rounded-2xl text-xs leading-relaxed" style={{ background: "oklch(0.55 0.18 85 / 0.08)", border: "1px solid oklch(0.55 0.18 85 / 0.25)" }}>
            <p className="text-amber-300/90 font-semibold mb-1 flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5" /> Linguagem Próxima do Original
            </p>
            <p className="text-white/55">
              Tradução com máxima fidelidade aos idiomas originais (hebraico, aramaico e grego).
              Toque nos versículos para visualizar notas exegéticas e detalhes dos idiomas originais onde disponíveis.
            </p>
          </div>
        )}

        {/* Verses */}
        <article className="leading-[1.9] space-y-3 text-left" style={{ fontSize: fs }}>
          {Object.entries(verses).map(([vn, rawText]) => {
            const v = Number(vn);
            const h = hl.find(x => x.verse === v);
            const hasNote = notes.some(n => n.verse === v);
            const isSel = selVerse === v;

            // For ORIGINAL translation: try to get literal verse
            let displayText = rawText;
            let originalData = null;
            let hasLiteralTranslation = false;
            if (translation === "ORIGINAL") {
              const dbVerse = originalVerses[v];
              if (dbVerse) {
                displayText = dbVerse.text;
                hasLiteralTranslation = true;
                originalData = {
                  text: dbVerse.text,
                  notes: dbVerse.notes,
                  originalLang: dbVerse.originalLang,
                  keyWords: dbVerse.keyWords
                };
              } else {
                const localOverride = getOriginalVerse(abbr, ch, v);
                if (localOverride) {
                  displayText = localOverride.text;
                  hasLiteralTranslation = true;
                  originalData = localOverride;
                }
              }
            }

            const isShowingOriginalNote = showOriginalNote === v;

            return (
              <div key={v}>
                <p
                  onClick={e => { e.stopPropagation(); setSelVerse(isSel ? null : v); setShowChs(false); setShowTranslations(false); if (translation === "ORIGINAL" && hasLiteralTranslation) setShowOriginalNote(isShowingOriginalNote ? null : v); }}
                  className={`group relative cursor-pointer rounded-xl px-3 py-2 -mx-3 transition-all text-white/80 ${
                    h ? COLORS[h.color].bg : "hover:bg-white/5"
                  } ${isSel ? "ring-1 ring-blue-400/40 bg-blue-400/5" : ""}`}
                >
                  <sup className="text-amber-400/70 mr-2 text-[0.68em] font-bold">{v}</sup>
                  {translation === "ORIGINAL" && originalData ? parseOriginalText(displayText, originalData.keyWords) : displayText}
                  {hasNote && <span className="inline-block ml-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 align-middle animate-pulse" />}
                </p>
                {/* Exegetical notes panel */}
                <AnimatePresence>
                  {isShowingOriginalNote && originalData?.notes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-3 mb-2 p-4 rounded-2xl text-xs text-white/70 leading-relaxed" style={{ background: "oklch(0.55 0.18 85 / 0.06)", border: "1px solid oklch(0.55 0.18 85 / 0.2)", borderLeft: "3px solid oklch(0.55 0.18 85 / 0.6)" }}>
                        <p className="text-amber-300/80 font-semibold text-[10px] uppercase tracking-wider mb-1.5">📜 Nota Exegética • {originalData.originalLang}</p>
                        <p>{originalData.notes}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </article>

        {/* Chapter test button */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handleStartChapterQuiz(); }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.18 255 / 0.2), oklch(0.58 0.2 280 / 0.1))",
              border: "1px solid oklch(0.65 0.18 255 / 0.35)",
              boxShadow: "0 4px 20px oklch(0.65 0.18 255 / 0.15)",
            }}
          >
            <Award className="w-4 h-4 text-violet-300" />
            <span>🎯 Testar meus conhecimentos (Cap. {ch})</span>
          </button>
        </div>

        {/* Verse action menu */}
        <AnimatePresence>
          {selVerse !== null && (
            <motion.div
              initial={{ opacity:0, y:10, scale:0.95 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:10, scale:0.95 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{
                background: "oklch(0.14 0.03 260 / 0.96)",
                border: "1px solid oklch(1 0 0 / 0.15)",
                boxShadow: "0 20px 60px oklch(0 0 0 / 0.6)",
                backdropFilter: "blur(24px)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[11px] text-white/40 mr-1">v.{selVerse}</span>
              {(["green", "yellow", "red"] as HighlightColor[]).map(c => (
                <button
                  key={c}
                  onClick={() => toggleHL(selVerse, c)}
                  title={COLORS[c].explanation}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${COLORS[c].dot} ${
                    hl.find(h => h.verse === selVerse)?.color === c ? "ring-2 ring-white/50 scale-110" : "opacity-70"
                  }`}
                />
              ))}
              <span className="w-px h-5 bg-white/10" />
              <button
                onClick={() => { const ex = notes.find(n => n.verse === selVerse); setNoteDraft(ex?.content ?? ""); setNoteVerse(selVerse); setSelVerse(null); }}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <StickyNote className="w-3.5 h-3.5" /> Anotar
              </button>
              {notebooks.length > 0 && (
                <button
                  onClick={() => { setAddToNotebookVerse(selVerse); setSelVerse(null); }}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <BookPlus className="w-3.5 h-3.5" /> Caderno
                </button>
              )}
              <button onClick={() => setSelVerse(null)} className="p-1 rounded-full hover:bg-white/10 text-white/30">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chapter navigation ── */}
      <div className="mt-5 flex justify-between items-center">
        <button
          onClick={() => goChapter(-1)}
          disabled={ch === 1 && abbr === BIBLE_BOOKS[0].abbr}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-30 transition-all"
          style={{ background: "oklch(1 0 0 / 0.07)", border: "1px solid oklch(1 0 0 / 0.1)" }}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <span className="text-xs text-white/30">{ch} / {book.chapters}</span>

        <button
          onClick={() => goChapter(1)}
          disabled={ch === book.chapters && abbr === BIBLE_BOOKS[BIBLE_BOOKS.length-1].abbr}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white font-medium disabled:opacity-30 transition-all"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.18 85), oklch(0.48 0.2 70))",
            boxShadow: "0 4px 20px oklch(0.55 0.18 85 / 0.4)",
          }}
        >
          Próximo <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Chapter notes list ── */}
      {notes.length > 0 && (
        <div
          className="mt-6 rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-5 duration-300 text-left"
          style={{
            background: "linear-gradient(160deg, oklch(0.15 0.03 260 / 0.9), oklch(0.12 0.02 260 / 0.95))",
            border: "1px solid oklch(0.55 0.18 85 / 0.2)",
            boxShadow: "0 16px 40px -10px oklch(0 0 0 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <StickyNote className="w-4 h-4 text-violet-400" />
            <h3 className="font-display text-lg text-white font-medium">Suas Anotações deste Capítulo</h3>
          </div>
          <div className="space-y-3.5">
            {notes.slice().sort((a,b) => a.verse - b.verse).map(note => (
              <div
                key={note.verse}
                className="group relative rounded-2xl p-4 transition-all hover:bg-white/5"
                style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.05)" }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-violet-300">Versículo {note.verse}</span>
                  <button
                    onClick={() => {
                      setNoteDraft(note.content);
                      setNoteVerse(note.verse);
                    }}
                    className="text-[11px] text-violet-400 hover:text-violet-300 transition-all sm:opacity-0 sm:group-hover:opacity-100 font-medium"
                  >
                    Editar Anotação
                  </button>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Book picker modal ── */}
      <AnimatePresence>
        {showBooks && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40" style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setShowBooks(false)} />
            <motion.div
              initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
              transition={{ type:"spring", stiffness:300, damping:28 }}
              className="fixed inset-x-4 bottom-4 top-20 z-50 rounded-3xl p-5 flex flex-col max-w-md mx-auto text-left"
              style={{
                background: "oklch(0.13 0.03 260 / 0.97)",
                border: "1px solid oklch(1 0 0 / 0.12)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
                backdropFilter: "blur(32px)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-white">Escolher livro</h2>
                <button onClick={() => setShowBooks(false)} className="p-2 rounded-full hover:bg-white/10 text-white/50">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4" style={{ background:"oklch(1 0 0 / 0.07)", border:"1px solid oklch(1 0 0 / 0.1)" }}>
                <Search className="w-4 h-4 text-white/30" />
                <input autoFocus value={bookQ} onChange={e => setBookQ(e.target.value)} placeholder="Buscar livro..." className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/30" />
              </div>
              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {atBooks.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/50 mb-2 px-1">Antigo Testamento</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {atBooks.map(b => (
                        <button key={b.abbr}
                          onClick={() => { setAbbr(b.abbr); setCh(1); setShowBooks(false); setSelVerse(null); }}
                          className="text-left rounded-xl px-3 py-2.5 text-sm transition-all text-white/70 hover:text-white"
                          style={b.abbr === abbr ? {
                            background: "linear-gradient(135deg, oklch(0.55 0.18 85 / 0.3), oklch(0.48 0.2 70 / 0.2))",
                            border: "1px solid oklch(0.55 0.18 85 / 0.4)",
                            color: "oklch(0.88 0.15 85)",
                          } : { background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}
                        >{b.name}</button>
                      ))}
                    </div>
                  </div>
                )}
                {ntBooks.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400/50 mb-2 px-1">Novo Testamento</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ntBooks.map(b => (
                        <button key={b.abbr}
                          onClick={() => { setAbbr(b.abbr); setCh(1); setShowBooks(false); setSelVerse(null); }}
                          className="text-left rounded-xl px-3 py-2.5 text-sm transition-all text-white/70 hover:text-white"
                          style={b.abbr === abbr ? {
                            background: "linear-gradient(135deg, oklch(0.65 0.18 255 / 0.3), oklch(0.58 0.2 280 / 0.2))",
                            border: "1px solid oklch(0.65 0.18 255 / 0.4)",
                            color: "oklch(0.80 0.14 255)",
                          } : { background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}
                        >{b.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Note modal ── */}
      <AnimatePresence>
        {noteVerse !== null && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40" style={{ background:"oklch(0 0 0 / 0.7)", backdropFilter:"blur(8px)" }}
              onClick={() => { setNoteVerse(null); setShowHistory(false); }} />
            <motion.div
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 max-w-md mx-auto text-left"
              style={{
                background: "oklch(0.14 0.03 270 / 0.97)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7), 0 0 60px oklch(0.65 0.18 280 / 0.15)",
                backdropFilter: "blur(32px)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-white flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-violet-400" />
                  {book.name} {ch}:{noteVerse}
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={async () => {
                      if (!showHistory) {
                        // Load history
                        const { data: noteData } = await supabase.from('verse_notes')
                          .select('id')
                          .eq('user_id', uid)
                          .eq('version', 'GLOBAL')
                          .eq('book', book.name)
                          .eq('chapter', ch)
                          .eq('verse', noteVerse)
                          .maybeSingle();
                        
                        if (noteData?.id) {
                          const { data: hist } = await supabase.from('verse_notes_history')
                            .select('*')
                            .eq('note_id', noteData.id)
                            .order('version_created_at', { ascending: false });
                          setNoteHistory(hist || []);
                        } else {
                          setNoteHistory([]);
                        }
                      }
                      setShowHistory(!showHistory);
                    }} 
                    className={`p-1.5 rounded-lg transition-all ${showHistory ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                    title="Ver histórico de versões"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setNoteVerse(null); setShowHistory(false); }} className="p-1.5 rounded-full hover:bg-white/10 text-white/30">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showHistory ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {noteHistory.length === 0 ? (
                    <p className="text-sm text-white/50 text-center py-4">Nenhum histórico anterior encontrado.</p>
                  ) : (
                    noteHistory.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider flex justify-between">
                          <span>Versão Anterior</span>
                          <span>{new Date(h.version_created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{h.content}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    autoFocus value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                    placeholder="Sua reflexão, insight ou observação..."
                    rows={5}
                    className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none text-white placeholder:text-white/30 focus:ring-2 focus:ring-violet-500/30 transition-all"
                    style={{ background:"oklch(1 0 0 / 0.07)", border:"1px solid oklch(1 0 0 / 0.12)" }}
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => { setNoteVerse(null); setShowHistory(false); }} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">Cancelar</button>
                    <button
                      onClick={async () => { await saveNote(noteVerse, noteDraft); setNoteVerse(null); setShowHistory(false); }}
                      className="rounded-xl px-4 py-2 text-sm text-white flex items-center gap-1.5 font-medium transition-all"
                      style={{ background:"linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))", boxShadow:"0 4px 20px oklch(0.58 0.2 280 / 0.4)" }}
                    >
                      <Check className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Chapter Quiz Modal ── */}
      <AnimatePresence>
        {showQuiz && quizQuestions.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={() => setShowQuiz(false)}
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
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display text-md text-white font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  Quiz: {book.name} {ch}
                </h3>
                <span className="text-[10px] font-mono text-white/40">
                  {quizStep < quizQuestions.length ? `${quizStep + 1} de ${quizQuestions.length}` : "Concluído"}
                </span>
              </div>

              {/* Quiz Body */}
              {quizStep < quizQuestions.length ? (
                // Active question step
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white leading-relaxed">
                    {quizQuestions[quizStep].question}
                  </h4>

                  {/* Render options if they exist */}
                  {quizQuestions[quizStep].options && (
                    <div className="space-y-2">
                      {quizQuestions[quizStep].options!.map(opt => {
                        const isSelected = selectedAns === opt;
                        const isCorrect = opt === quizQuestions[quizStep].correctAnswer;
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
                            className="w-full text-left rounded-xl px-4 py-3 text-xs transition-all hover:bg-white/5 disabled:pointer-events-none"
                            style={optionStyle}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* For fill-blank questions (No options) */}
                  {!quizQuestions[quizStep].options && (
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
                        <p className="text-xs text-white/50 mt-1">
                          Resposta correta: <span className="text-emerald-400 font-semibold">{quizQuestions[quizStep].correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feedback and Explanation */}
                  {hasSubmittedAns && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1.5 text-xs text-white/70"
                    >
                      <p className="font-semibold text-white">
                        {selectedAns?.toLowerCase().trim() === quizQuestions[quizStep].correctAnswer.toLowerCase().trim()
                          ? "🎉 Resposta Correta!"
                          : "❌ Resposta Incorreta!"}
                      </p>
                      <p className="leading-relaxed">{quizQuestions[quizStep].explanation}</p>
                      <p className="text-[10px] text-white/40 font-mono">Leitura sugerida: {quizQuestions[quizStep].suggestedReading}</p>
                    </motion.div>
                  )}

                  {/* Footer actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    {!hasSubmittedAns ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAns}
                        className="rounded-xl px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-40 transition-all"
                        style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
                      >
                        Verificar Resposta
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizStep}
                        className="rounded-xl px-4 py-2 text-xs font-medium text-white hover:brightness-110 transition-all"
                        style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
                      >
                        {quizStep === quizQuestions.length - 1 ? "Ver Resultados" : "Próxima Pergunta"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Final score step
                <div className="space-y-4 text-center py-4">
                  <div className="text-5xl animate-bounce">🏆</div>
                  <h4 className="font-display text-lg text-white font-semibold">Desafio Concluído!</h4>
                  <p className="text-xs text-white/50">
                    Você acertou <span className="text-violet-300 font-bold">{quizScore}</span> de{" "}
                    <span className="text-white font-bold">{quizQuestions.length}</span> perguntas do capítulo.
                  </p>

                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
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
      {/* ── Add to Notebook modal ── */}
      <AnimatePresence>
        {addToNotebookVerse !== null && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40" style={{ background:"oklch(0 0 0 / 0.7)", backdropFilter:"blur(8px)" }}
              onClick={() => setAddToNotebookVerse(null)} />
            <motion.div
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 max-w-sm mx-auto text-left"
              style={{
                background: "oklch(0.14 0.03 270 / 0.97)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
                backdropFilter: "blur(32px)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-white flex items-center gap-2">
                  <BookPlus className="w-4 h-4 text-amber-400" />
                  Adicionar ao Caderno
                </h2>
                <button onClick={() => setAddToNotebookVerse(null)} className="p-1.5 rounded-full hover:bg-white/10 text-white/30">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/50 mb-4">
                Referência: <span className="text-amber-300 font-semibold">{book.name} {ch}:{addToNotebookVerse}</span><br/>
                Selecione o caderno de destino:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notebooks.map(nb => (
                  <button
                    key={nb.id}
                    onClick={async () => {
                      // Insert a new page in the notebook with the verse reference
                      const verseText = verses[addToNotebookVerse!] || "";
                      const refText = `${book.name} ${ch}:${addToNotebookVerse}`;
                      const content = {
                        type: "doc",
                        content: [
                          { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: refText }] },
                          { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: verseText }] }] },
                          { type: "paragraph", content: [{ type: "text", text: "" }] }
                        ]
                      };
                      if (uid) {
                        const { error } = await supabase.from("study_pages").insert({
                          notebook_id: nb.id,
                          user_id: uid,
                          title: refText,
                          content
                        });
                        if (!error) {
                          toast.success(`Adicionado a "${nb.title}" ✓`);
                          setAddToNotebookVerse(null);
                        } else {
                          toast.error("Erro ao adicionar ao caderno.");
                        }
                      }
                    }}
                    className="w-full text-left rounded-2xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)" }}
                  >
                    <BookMarked className="w-4 h-4 text-amber-400/70 shrink-0" />
                    {nb.title}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setAddToNotebookVerse(null); navigate({ to: "/estudos" }); }}
                className="mt-4 w-full text-center text-xs text-amber-400/70 hover:text-amber-300 transition-all"
              >
                + Criar novo caderno em Estudos
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
