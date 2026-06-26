import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAudio } from "@/components/audio/AudioProvider";
import {
  BookOpen, Clock, X, Search, BookMarked, MessageSquare, Sparkles, Lightbulb, Check, Plus,
  Library, Calendar, HelpCircle, FileText, ChevronRight, Globe, Layers, ArrowRight, Star, Award, Compass, Edit2, Bookmark
} from "lucide-react";
import {
  DICTIONARY, CHARACTERS, COMMENTARIES, CROSS_REFERENCES, ARCHEOLOGY, MAPS, TIMELINE, STUDY_CHALLENGES, searchAll,
  DictionaryTerm, CharacterProfile, ScholarCommentary, ArcheologyDiscovery, MapRoute, TimelinePeriod, StudyChallenge
} from "@/lib/study-data";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/estudos")({ component: EstudosPage });

interface Notebook {
  id: string;
  title: string;
  objective: string;
  startDate: string;
  book: string;
  chapter: number;
  observations: string;
  questions: string;
  conclusions: string;
  references: string;
  isFavorite: boolean;
  status: "progress" | "completed";
  updatedAt: string;
}

interface Doubt {
  id: string;
  question: string;
  answer: string;
  isResolved: boolean;
  references: string;
  createdAt: string;
}

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: "note-1",
    title: "O Evangelho de João",
    objective: "Compreender a revelação do Logos encarnado e a teologia do amor prático.",
    startDate: "2026-08-05",
    book: "João",
    chapter: 8,
    observations: "A expressão de Jesus 'Eu Sou' (ego eimi) remete diretamente ao nome divino YHWH revelado a Moisés no deserto.",
    questions: "Qual a relação teológica exata entre o cordeiro pascoal e o cordeiro de Deus citado no capítulo 1?",
    conclusions: "João apresenta Jesus sob uma perspectiva altamente divina e focada na comunhão pessoal com o Espírito Santo.",
    references: "Comentário de F.F. Bruce, Exegese de João por Paulo Won.",
    isFavorite: true,
    status: "progress",
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_DOUBTS: Doubt[] = [
  {
    id: "doubt-1",
    question: "Quem foi de fato Melquisedeque citado em Gênesis e Hebreus?",
    answer: "Muitos estudiosos o identificam como uma teofania (aparição pré-encarnada de Cristo), enquanto outros defendem que era um rei-sacerdote histórico de Salém que serviu como protótipo tipológico do Messias.",
    isResolved: true,
    references: "Hebreus 7:1-3, Gênesis 14:18-20",
    createdAt: "2026-06-19T10:00:00.000Z"
  },
  {
    id: "doubt-2",
    question: "Por que os Evangelhos sinóticos diferem um pouco em cronologia comparados a João?",
    answer: "",
    isResolved: false,
    references: "",
    createdAt: "2026-06-22T14:30:00.000Z"
  }
];

function getVerseComparison(book: string, chapter: number, verse: number) {
  const b = book.toLowerCase().trim();
  if (b === "joão" && chapter === 1 && verse === 1) {
    return {
      NVI: "No princípio era aquele que é a Palavra. Ele estava com Deus e era Deus.",
      ARA: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
      NT: "No princípio era a Palavra (Logos), e a Palavra (Logos) estava junto ao Deus, e Deus era a Palavra (Logos).",
      NAA: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
      NTLH: "Antes de ser criado o mundo, aquele que é a Palavra já existia. Ele estava com Deus e era Deus.",
      ARC: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
      ACF: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
      Católica: "No princípio era o Verbo, e o Verbo estava junto de Deus, e o Verbo era Deus."
    };
  }
  if (b === "joão" && chapter === 3 && verse === 16) {
    return {
      NVI: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
      ARA: "Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
      NT: "Porque assim amou o Deus o cosmos, a ponto de o Filho, o Unigênito, entregar, para que todo o crendo nele não venha a perecer, mas tenha vida eterna.",
      NAA: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.",
      NTLH: "Porque Deus amou o mundo de tal maneira que deu o seu único Filho, para que todo aquele que nele crer não morra, mas tenha a vida eterna.",
      ARC: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.",
      ACF: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.",
      Católica: "Com efeito, de tal modo Deus amou o mundo, que lhe deu seu Filho único, para que todo o que nele crer não pereça, mas tenha a vida eterna."
    };
  }
  if (b === "gênesis" && chapter === 1 && verse === 1) {
    return {
      NVI: "No princípio Deus criou os céus e a terra.",
      ARA: "No princípio, criou Deus os céus e a terra.",
      NT: "No princípio criou Elohim (Deus) os céus e a terra.",
      NAA: "No princípio, Deus criou os céus e a terra.",
      NTLH: "No começo Deus criou os céus e a terra.",
      ARC: "No princípio criou Deus os céus e a terra.",
      ACF: "No princípio criou Deus os céus e a terra.",
      Católica: "No princípio, Deus criou o céu e a terra."
    };
  }
  return {
    NVI: `[NVI] Leitura correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    ARA: `[ARA] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    NT: `[Nossa Tradução] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse} traduzido literalmente das línguas originais.`,
    NAA: `[NAA] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    NTLH: `[NTLH] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    ARC: `[ARC] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    ACF: `[ACF] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`,
    Católica: `[Católica] Texto correspondente ao livro de ${book}, capítulo ${chapter}, versículo ${verse}.`
  };
}

export function EstudosPage() {
  const audio = useAudio();
  const [uid, setUid] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState("biblioteca");

  useEffect(() => {
    audio.setContext("estudos");
  }, []);

  
  // Dynamic markers count from Supabase
  const [markedCount, setMarkedCount] = useState(0);
  const [markedVerses, setMarkedVerses] = useState<{ book: string; chapter: number; verse: number; color: string }[]>([]);

  // Notebooks (OneNote style) state
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteObjective, setNewNoteObjective] = useState("");
  const [newNoteBook, setNewNoteBook] = useState("João");
  const [newNoteChapter, setNewNoteChapter] = useState(1);

  // Doubts state
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [newDoubtQ, setNewDoubtQ] = useState("");
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState("");
  const [doubtRefsText, setDoubtRefsText] = useState("");

  // Search Central state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchCategory, setSearchCategory] = useState("all");

  // Exegese state
  const [exegeseSubTab, setExegeseSubTab] = useState("comparacao");
  
  // Translation comparison selected verse
  const [compBook, setCompBook] = useState("João");
  const [compChapter, setCompChapter] = useState(3);
  const [compVerse, setCompVerse] = useState(16);

  // Dictionary active term
  const [dictSearch, setDictSearch] = useState("");
  const [selectedDictTerm, setSelectedDictTerm] = useState<DictionaryTerm | null>(null);

  // Characters active
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);

  // Challenges state
  const [completedChalls, setCompletedChalls] = useState<string[]>([]);

  // 1. Initial loads
  useEffect(() => {
    // Load from local storage
    const localNotes = localStorage.getItem("bible.notebooks");
    if (localNotes) {
      setNotebooks(JSON.parse(localNotes));
    } else {
      setNotebooks(DEFAULT_NOTEBOOKS);
      localStorage.setItem("bible.notebooks", JSON.stringify(DEFAULT_NOTEBOOKS));
    }

    const localDoubts = localStorage.getItem("bible.doubts");
    if (localDoubts) {
      setDoubts(JSON.parse(localDoubts));
    } else {
      setDoubts(DEFAULT_DOUBTS);
      localStorage.setItem("bible.doubts", JSON.stringify(DEFAULT_DOUBTS));
    }

    const localChalls = localStorage.getItem("bible.completedChallenges");
    if (localChalls) {
      setCompletedChalls(JSON.parse(localChalls));
    }

    // Load active user and fetch highlights
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      
      supabase.from("highlights").select("book,chapter,verse,color")
        .eq("user_id", data.user.id)
        .in("color", ["yellow", "red"])
        .then(({ data: d }) => {
          if (d) {
            setMarkedCount(d.length);
            setMarkedVerses(d as any);
          }
        });
    });
  }, []);

  // Save changes helper for Notebooks
  const saveNotebooks = (updated: Notebook[]) => {
    setNotebooks(updated);
    localStorage.setItem("bible.notebooks", JSON.stringify(updated));
  };

  // Save changes helper for Doubts
  const saveDoubts = (updated: Doubt[]) => {
    setDoubts(updated);
    localStorage.setItem("bible.doubts", JSON.stringify(updated));
  };

  // 2. Notebook action handlers
  const handleCreateNotebook = () => {
    if (!newNoteTitle.trim()) {
      toast.error("Por favor, digite um título.");
      return;
    }
    const newNotebook: Notebook = {
      id: "note-" + Date.now(),
      title: newNoteTitle,
      objective: newNoteObjective,
      startDate: new Date().toLocaleDateString("pt-BR"),
      book: newNoteBook,
      chapter: newNoteChapter,
      observations: "",
      questions: "",
      conclusions: "",
      references: "",
      isFavorite: false,
      status: "progress",
      updatedAt: new Date().toISOString()
    };
    const updated = [...notebooks, newNotebook];
    saveNotebooks(updated);
    setNewNoteTitle("");
    setNewNoteObjective("");
    setShowNewNotebookModal(false);
    setSelectedNotebook(newNotebook);
    if (uid) {
      logActivity(uid, "study", { title: newNoteTitle, book: newNoteBook, chapter: newNoteChapter });
    }
    toast.success("Novo caderno de estudos criado!");
  };

  const handleUpdateNotebookField = (field: keyof Notebook, value: any) => {
    if (!selectedNotebook) return;
    const updatedNotebook = { ...selectedNotebook, [field]: value, updatedAt: new Date().toISOString() };
    setSelectedNotebook(updatedNotebook);
    const updatedList = notebooks.map(n => n.id === selectedNotebook.id ? updatedNotebook : n);
    saveNotebooks(updatedList);
  };

  const handleDeleteNotebook = (id: string) => {
    const updated = notebooks.filter(n => n.id !== id);
    saveNotebooks(updated);
    setSelectedNotebook(null);
    toast.success("Caderno excluído.");
  };

  // 3. Doubt action handlers
  const handleAddDoubt = () => {
    if (!newDoubtQ.trim()) return;
    const newDoubt: Doubt = {
      id: "doubt-" + Date.now(),
      question: newDoubtQ.trim(),
      answer: "",
      isResolved: false,
      references: "",
      createdAt: new Date().toISOString()
    };
    const updated = [...doubts, newDoubt];
    saveDoubts(updated);
    setNewDoubtQ("");
    toast.success("Dúvida registrada!");
  };

  const handleOpenDoubtModal = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setDoubtAnswerText(doubt.answer);
    setDoubtRefsText(doubt.references);
  };

  const handleSaveDoubtAnswer = () => {
    if (!selectedDoubt) return;
    const updatedDoubt = {
      ...selectedDoubt,
      answer: doubtAnswerText,
      references: doubtRefsText,
      isResolved: doubtAnswerText.trim() !== ""
    };
    const updatedList = doubts.map(d => d.id === selectedDoubt.id ? updatedDoubt : d);
    saveDoubts(updatedList);
    setSelectedDoubt(null);
    toast.success("Resolução da dúvida salva!");
  };

  const handleToggleResolveDoubt = (id: string, state: boolean) => {
    const updatedList = doubts.map(d => d.id === id ? { ...d, isResolved: state } : d);
    saveDoubts(updatedList);
    toast.success(state ? "Dúvida marcada como resolvida!" : "Dúvida reaberta.");
  };

  const handleDeleteDoubt = (id: string) => {
    const updated = doubts.filter(d => d.id !== id);
    saveDoubts(updated);
    toast.success("Dúvida removida.");
  };

  // 4. Challenges toggle handler
  const handleToggleChallenge = (id: string) => {
    let updated: string[];
    if (completedChalls.includes(id)) {
      updated = completedChalls.filter(x => x !== id);
    } else {
      updated = [...completedChalls, id];
      audio.play("achievement");
      toast.success("Desafio concluído! Bom trabalho!");
    }
    setCompletedChalls(updated);
    localStorage.setItem("bible.completedChallenges", JSON.stringify(updated));
  };

  // 5. Global Search trigger
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      const res = searchAll(val);
      setSearchResults(res);
    } else {
      setSearchResults(null);
    }
  };

  return (
    <AppShell>
      {/* ── Title and Heading ── */}
      <div className="animate-fade-up mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400/60 mb-1">Hub de Estudos</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Exegese e Aprendizado</h1>
        <p className="text-white/40 mt-1.5 text-sm max-w-md">
          Aprofunde sua reflexão com dicionários, comentários de estudiosos, contexto arqueológico e cadernos personalizados.
        </p>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-white/5">
        {[
          { id: "biblioteca", label: "Biblioteca", icon: Library },
          { id: "exegese", label: "Ferramentas de Exegese", icon: Compass },
          { id: "duvidas", label: "Minhas Dúvidas", icon: HelpCircle },
          { id: "linha-do-tempo", label: "Linha do Tempo", icon: Clock },
          { id: "pesquisa", label: "Pesquisa Central", icon: Search },
          { id: "marcadores", label: "Marcadores & Desafios", icon: Award },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedNotebook(null); }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm transition-all shrink-0 font-medium"
              style={isActive ? {
                background: "linear-gradient(135deg, oklch(0.65 0.18 255 / 0.25), oklch(0.58 0.2 280 / 0.15))",
                border: "1px solid oklch(0.65 0.18 255 / 0.4)",
                color: "oklch(0.85 0.1 255)",
              } : {
                background: "oklch(1 0 0 / 0.04)",
                border: "1px solid oklch(1 0 0 / 0.08)",
                color: "oklch(1 0 0 / 0.6)",
              }}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : ""}`} />
              <span>{tab.label}</span>
              {tab.id === "marcadores" && markedCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {markedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Contents ── */}
      <div className="min-h-[400px]">
        {/* ==================== TAB: BIBLIOTECA (OneNote style) ==================== */}
        {activeTab === "biblioteca" && (
          <div className="space-y-6">
            {!selectedNotebook ? (
              <>
                {/* Header bar */}
                <div className="flex justify-between items-center gap-3">
                  <h2 className="font-display text-lg text-white font-medium text-left">Seus Cadernos de Estudo</h2>
                  <button
                    onClick={() => setShowNewNotebookModal(true)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))", boxShadow: "0 4px 16px oklch(0.58 0.2 280 / 0.3)" }}
                  >
                    <Plus className="w-4 h-4" /> Novo Caderno
                  </button>
                </div>

                {/* Notebooks Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notebooks.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNotebook(note)}
                      className="group cursor-pointer rounded-2xl p-5 transition-all hover:bg-white/5 text-left flex flex-col justify-between"
                      style={{
                        background: "oklch(1 0 0 / 0.03)",
                        border: "1px solid oklch(1 0 0 / 0.06)",
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="text-2xl">📖</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = notebooks.map(n => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n);
                              saveNotebooks(updated);
                            }}
                            className={`p-1.5 rounded-xl hover:bg-white/10 transition-all ${note.isFavorite ? "text-amber-400" : "text-white/20"}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <h3 className="font-display text-md text-white font-semibold leading-snug group-hover:text-violet-300 transition-colors">{note.title}</h3>
                        <p className="text-xs text-white/40 mt-1 line-clamp-2">{note.objective || "Sem objetivo definido."}</p>
                      </div>
                      <div className="mt-5 border-t border-white/5 pt-3 flex items-center justify-between text-[10px] text-white/30 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {note.startDate}
                        </span>
                        <span className="bg-violet-500/10 px-2 py-0.5 rounded text-violet-300">
                          {note.book} {note.chapter}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* OneNote notebook Editor details view */
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Back bar */}
                <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <button
                    onClick={() => setSelectedNotebook(null)}
                    className="text-xs text-violet-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    ← Voltar à Biblioteca
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNotebookField("isFavorite", !selectedNotebook.isFavorite)}
                      className={`p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all ${selectedNotebook.isFavorite ? "text-amber-400" : "text-white/40"}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotebook(selectedNotebook.id)}
                      className="text-xs rounded-xl px-3 py-2 text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all font-medium"
                    >
                      Excluir Caderno
                    </button>
                  </div>
                </div>

                {/* Main Notebook fields */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4 md:col-span-1">
                    <div
                      className="p-5 rounded-2xl space-y-4 text-left"
                      style={{ background: "oklch(1 0 0 / 0.02)", border: "1px solid oklch(1 0 0 / 0.05)" }}
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Título do Caderno</label>
                        <input
                          type="text"
                          value={selectedNotebook.title}
                          onChange={(e) => handleUpdateNotebookField("title", e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Objetivo do Estudo</label>
                        <textarea
                          rows={3}
                          value={selectedNotebook.objective}
                          onChange={(e) => handleUpdateNotebookField("objective", e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Livro Alvo</label>
                          <input
                            type="text"
                            value={selectedNotebook.book}
                            onChange={(e) => handleUpdateNotebookField("book", e.target.value)}
                            className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Capítulo Atual</label>
                          <input
                            type="number"
                            value={selectedNotebook.chapter}
                            onChange={(e) => handleUpdateNotebookField("chapter", Number(e.target.value))}
                            className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-white/30 border-t border-white/5 pt-3">
                        <span className="block">Iniciado em: {selectedNotebook.startDate}</span>
                        <span className="block mt-0.5">Última edição: {new Date(selectedNotebook.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Write boards (Observations, Questions, Conclusions, References) */}
                  <div className="md:col-span-2 space-y-4">
                    <div
                      className="p-6 rounded-3xl space-y-5 text-left"
                      style={{
                        background: "linear-gradient(160deg, oklch(0.16 0.03 260 / 0.95), oklch(0.12 0.02 260 / 0.98))",
                        border: "1px solid oklch(0.55 0.18 85 / 0.15)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                        <Edit2 className="w-4 h-4 text-violet-400" />
                        <h3 className="font-display text-md text-white font-medium">Caderno de Anotações Exegéticas</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">Observações e Insights</label>
                          <textarea
                            rows={4}
                            placeholder="Escreva livremente reflexões, significados das palavras do original hebraico/grego..."
                            value={selectedNotebook.observations}
                            onChange={(e) => handleUpdateNotebookField("observations", e.target.value)}
                            className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">Perguntas e Dúvidas</label>
                          <textarea
                            rows={3}
                            placeholder="Que questionamentos este texto te levanta?"
                            value={selectedNotebook.questions}
                            onChange={(e) => handleUpdateNotebookField("questions", e.target.value)}
                            className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">Conclusões e Aplicação Prática</label>
                          <textarea
                            rows={3}
                            placeholder="Como este aprendizado se aplica ao seu dia a dia?"
                            value={selectedNotebook.conclusions}
                            onChange={(e) => handleUpdateNotebookField("conclusions", e.target.value)}
                            className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">Referências Utilizadas</label>
                          <input
                            type="text"
                            placeholder="Ex: F.F. Bruce, Dicionário Bíblico, Comentário Histórico-Cultural..."
                            value={selectedNotebook.references}
                            onChange={(e) => handleUpdateNotebookField("references", e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ==================== TAB: EXEGESE ==================== */}
        {activeTab === "exegese" && (
          <div className="space-y-6">
            {/* Exegese Sub Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/5">
              {[
                { id: "comparacao", label: "Comparação de Traduções" },
                { id: "dicionario", label: "Dicionário Bíblico" },
                { id: "personagens", label: "Fichas de Personagens" },
                { id: "arqueologia", label: "Arqueologia & Mapas" },
                { id: "comentarios", label: "Comentários Teológicos" },
                { id: "contexto", label: "Contexto Histórico" },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setExegeseSubTab(sub.id)}
                  className="rounded-lg px-3 py-1.5 text-xs transition-all shrink-0 font-medium"
                  style={exegeseSubTab === sub.id ? {
                    background: "oklch(1 0 0 / 0.1)",
                    color: "white"
                  } : {
                    color: "oklch(1 0 0 / 0.45)"
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub Tab contents */}
            <div className="pt-2 animate-in fade-in duration-300">
              {/* SUB TAB: COMPARACAO */}
              {exegeseSubTab === "comparacao" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-left">
                    <div>
                      <h3 className="font-display text-md text-white font-medium">Comparação Lado a Lado</h3>
                      <p className="text-xs text-white/40">Selecione um versículo chave para comparar as traduções.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <select
                        value={compBook}
                        onChange={(e) => setCompBook(e.target.value)}
                        className="bg-white/10 text-white rounded-xl px-3 py-2 text-xs border border-white/10 outline-none"
                      >
                        <option value="João" className="bg-neutral-900 text-white">João</option>
                        <option value="Gênesis" className="bg-neutral-900 text-white">Gênesis</option>
                        <option value="Salmos" className="bg-neutral-900 text-white">Salmos</option>
                      </select>
                      <select
                        value={compChapter}
                        onChange={(e) => setCompChapter(Number(e.target.value))}
                        className="bg-white/10 text-white rounded-xl px-3 py-2 text-xs border border-white/10 outline-none"
                      >
                        <option value={1} className="bg-neutral-900 text-white">Cap. 1</option>
                        <option value={3} className="bg-neutral-900 text-white">Cap. 3</option>
                        <option value={23} className="bg-neutral-900 text-white">Cap. 23</option>
                      </select>
                      <select
                        value={compVerse}
                        onChange={(e) => setCompVerse(Number(e.target.value))}
                        className="bg-white/10 text-white rounded-xl px-3 py-2 text-xs border border-white/10 outline-none"
                      >
                        <option value={1} className="bg-neutral-900 text-white">v. 1</option>
                        <option value={2} className="bg-neutral-900 text-white">v. 2</option>
                        <option value={3} className="bg-neutral-900 text-white">v. 3</option>
                        <option value={16} className="bg-neutral-900 text-white">v. 16</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-left">
                    {Object.entries(getVerseComparison(compBook, compChapter, compVerse)).map(([trans, text]) => (
                      <div
                        key={trans}
                        className="p-5 rounded-2xl flex flex-col justify-between"
                        style={{
                          background: "oklch(1 0 0 / 0.03)",
                          border: "1px solid oklch(1 0 0 / 0.06)",
                        }}
                      >
                        <div>
                          <span className="text-[10px] font-mono text-amber-300 font-semibold uppercase tracking-wider">{trans}</span>
                          <p className="text-sm text-white/85 leading-relaxed mt-2 italic">"{text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB TAB: DICIONARIO */}
              {exegeseSubTab === "dicionario" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-left">
                    <Search className="w-4 h-4 text-white/20 shrink-0" />
                    <input
                      value={dictSearch}
                      onChange={(e) => setDictSearch(e.target.value)}
                      placeholder="Busque termos como Graça, Pecado, Messias..."
                      className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/25"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    {/* List */}
                    <div className="md:col-span-1 space-y-2">
                      {DICTIONARY.filter(d => d.term.toLowerCase().includes(dictSearch.toLowerCase())).map(item => (
                        <button
                          key={item.term}
                          onClick={() => setSelectedDictTerm(item)}
                          className="w-full text-left rounded-xl px-4 py-3 text-sm transition-all hover:bg-white/5 flex items-center justify-between"
                          style={selectedDictTerm?.term === item.term ? {
                            background: "oklch(1 0 0 / 0.06)",
                            borderLeft: "3px solid oklch(0.65 0.18 255)",
                          } : {
                            background: "oklch(1 0 0 / 0.02)",
                          }}
                        >
                          <span className="font-medium text-white">{item.term}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      ))}
                    </div>

                    {/* Details card */}
                    <div className="md:col-span-2">
                      {selectedDictTerm ? (
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 text-left">
                          <h3 className="font-display text-2xl text-amber-300">{selectedDictTerm.term}</h3>
                          
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block">Origem Etimológica</span>
                            <p className="text-sm text-violet-300 mt-0.5">{selectedDictTerm.origin}</p>
                          </div>
                          
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block">Significado Bíblico</span>
                            <p className="text-sm text-white/80 leading-relaxed mt-0.5">{selectedDictTerm.meaning}</p>
                          </div>

                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block">Onde aparece</span>
                            <p className="text-xs text-white/60 font-mono mt-0.5">{selectedDictTerm.whereItAppears}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white/60">
                            <span className="font-semibold text-white block mb-1">💡 Curiosidade Histórica:</span>
                            {selectedDictTerm.curiosities}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[250px] rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-white/30 text-sm gap-2">
                          <HelpCircle className="w-8 h-8 opacity-40 text-violet-400" />
                          <span>Selecione uma palavra à esquerda para ver os detalhes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: PERSONAGENS */}
              {exegeseSubTab === "personagens" && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* List */}
                    <div className="md:col-span-1 space-y-2">
                      {CHARACTERS.map(char => (
                        <button
                          key={char.name}
                          onClick={() => setSelectedCharacter(char)}
                          className="w-full text-left rounded-xl px-4 py-3.5 text-sm transition-all hover:bg-white/5 flex items-center justify-between"
                          style={selectedCharacter?.name === char.name ? {
                            background: "oklch(1 0 0 / 0.06)",
                            borderLeft: "3px solid oklch(0.65 0.18 255)",
                          } : {
                            background: "oklch(1 0 0 / 0.02)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👥</span>
                            <span className="font-medium text-white">{char.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      ))}
                    </div>

                    {/* Profile detail card */}
                    <div className="md:col-span-2">
                      {selectedCharacter ? (
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 text-left">
                          <h3 className="font-display text-2xl text-amber-300">{selectedCharacter.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3 text-xs">
                            <div>
                              <span className="text-white/40 block">Origem/Nascimento:</span>
                              <span className="text-white/80 font-medium">{selectedCharacter.birth}</span>
                            </div>
                            <div>
                              <span className="text-white/40 block">Núcleo Familiar:</span>
                              <span className="text-white/80 font-medium">{selectedCharacter.family}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Acontecimentos e Linha do Tempo</span>
                            <div className="space-y-2 border-l border-white/10 pl-4 py-1 ml-1 text-xs">
                              {selectedCharacter.timeline.map((step, idx) => (
                                <div key={idx} className="relative">
                                  <span className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-violet-400" />
                                  <span className="text-white/80">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                            <div>
                              <span className="text-[10px] text-white/40 uppercase tracking-wider block">Principais Passagens</span>
                              <div className="flex gap-1.5 flex-wrap mt-1">
                                {selectedCharacter.mainVerses.map(v => (
                                  <span key={v} className="text-[10px] font-mono text-white/50 bg-white/5 rounded px-2 py-0.5">{v}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/40 uppercase tracking-wider block">Curiosidades</span>
                              <p className="text-xs text-white/70 italic mt-1 font-medium">"{selectedCharacter.curiosities}"</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[250px] rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-white/30 text-sm gap-2">
                          <HelpCircle className="w-8 h-8 opacity-40 text-violet-400" />
                          <span>Selecione uma figura bíblica à esquerda para ver a ficha</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: ARQUEOLOGIA & MAPAS */}
              {exegeseSubTab === "arqueologia" && (
                <div className="space-y-6 text-left">
                  {/* Archeology */}
                  <div>
                    <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                      <span className="text-amber-400">🏺</span> Descobertas Arqueológicas Recentes
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {ARCHEOLOGY.map(item => (
                        <div
                          key={item.title}
                          className="p-5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                            <p className="text-[10px] text-violet-300 font-mono mt-1">{item.location} • {item.date}</p>
                            <p className="text-xs text-white/60 leading-relaxed mt-2.5">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Maps */}
                  <div className="border-t border-white/5 pt-6">
                    <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-violet-400" /> Mapas e Rotas Históricas
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {MAPS.map(route => (
                        <div
                          key={route.title}
                          className="p-5 rounded-2xl bg-white/3 border border-white/5"
                        >
                          <h4 className="font-semibold text-white mb-1">{route.title}</h4>
                          <p className="text-xs text-white/40 mb-3">{route.description}</p>
                          <div className="space-y-1.5 border-l border-violet-400/30 pl-4 py-1 ml-1 text-xs">
                            {route.stops.map((stop, idx) => (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[20px] top-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
                                <span className="text-white/70">{stop}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: COMENTARIOS */}
              {exegeseSubTab === "comentarios" && (
                <div className="space-y-4 text-left">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-md text-white font-medium">Comentários de Estudiosos</h3>
                      <p className="text-xs text-white/40">Análise e interpretação exegética dos versículos, separadas por teólogos.</p>
                    </div>
                    <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-3 py-1 rounded-xl border border-violet-500/20">
                      Exemplo: João 3:16
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {COMMENTARIES["jo-3-16"].map(comment => (
                      <div
                        key={comment.scholar}
                        className="p-5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center gap-2 border-b border-white/5 pb-2 mb-2">
                            <span className="font-semibold text-sm text-white">{comment.scholar}</span>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded">
                              {comment.focus}
                            </span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed italic">"{comment.summary}"</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cross references */}
                  <div className="border-t border-white/5 pt-5">
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> Referências Cruzadas para João 3:16
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {CROSS_REFERENCES["jo-3-16"].map(ref => (
                        <span
                          key={ref}
                          className="text-xs rounded-xl px-3 py-1.5 font-mono text-white/70 flex items-center gap-1"
                          style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)" }}
                        >
                          <BookOpen className="w-3 h-3 text-amber-300" /> {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: CONTEXTO HISTORICO */}
              {exegeseSubTab === "contexto" && (
                <div className="space-y-5 text-left">
                  <div className="p-5 rounded-3xl bg-white/3 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <span className="text-lg">🌍</span>
                      <h3 className="font-display text-md text-white font-medium">Contexto Histórico do Evangelho de João</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider text-[9px]">Autor</span>
                        <span className="text-white/80 font-medium">Apóstolo João (o discípulo amado), em Éfeso.</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider text-[9px]">Público Alvo</span>
                        <span className="text-white/80 font-medium">Cristãos judeus e gentios no Império Romano do final do século I.</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider text-[9px]">Costumes e Cultura</span>
                        <span className="text-white/80 font-medium">Grande influência filosófica grega (Gnosticismo primitivo) e cultura das Festas Judaicas (Páscoa, Tabernáculos).</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider text-[9px]">Política & Religião</span>
                        <span className="text-white/80 font-medium">Destruição do Templo de Jerusalém (70 d.C.) já ocorrida; tensões elevadas entre o sinédrio judaico e os seguidores de Jesus.</span>
                      </div>
                    </div>
                  </div>

                  {/* Curiosities */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-950/20 to-neutral-900 border border-violet-500/15">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-300" /> Você Sabia? (Curiosidades Bíblicas)
                    </h4>
                    <div className="space-y-3 text-xs text-white/60">
                      <div className="flex items-start gap-2">
                        <span className="text-violet-400">•</span>
                        <p>O livro de Salmos é o mais longo da Bíblia, e o Salmo 119 é o capítulo mais longo.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-violet-400">•</span>
                        <p>A frase 'Não temas' ou semelhantes aparece mais de 300 vezes na Bíblia, servindo de encorajamento diário.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-violet-400">•</span>
                        <p>O nome Jerusalém aparece mais de 800 vezes no texto bíblico canonizado.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: DUVIDAS ==================== */}
        {activeTab === "duvidas" && (
          <div className="space-y-6">
            {/* Input box */}
            <div
              className="p-5 rounded-3xl space-y-4 text-left"
              style={{
                background: "linear-gradient(160deg, oklch(0.16 0.03 260 / 0.95), oklch(0.12 0.02 260 / 0.98))",
                border: "1px solid oklch(0.55 0.18 85 / 0.15)",
              }}
            >
              <h3 className="font-display text-md text-white font-medium flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-violet-400" />
                Registrar uma Dúvida de Estudo
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDoubtQ}
                  onChange={(e) => setNewDoubtQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddDoubt(); }}
                  placeholder="Escreva sua dúvida bíblica (ex: Qual a diferença entre Aliança e Lei?)..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                />
                <button
                  onClick={handleAddDoubt}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shrink-0"
                  style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
                >
                  Registrar
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3.5">
              {doubts.map(doubt => (
                <div
                  key={doubt.id}
                  className="p-5 rounded-2xl transition-all hover:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{
                    background: "oklch(1 0 0 / 0.03)",
                    border: "1px solid oklch(1 0 0 / 0.05)",
                  }}
                >
                  <div className="flex-1 space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-violet-400 text-xs">?</span>
                      <h4 className="font-semibold text-sm text-white leading-normal">{doubt.question}</h4>
                    </div>
                    {doubt.answer ? (
                      <p className="text-xs text-white/70 italic border-l-2 border-violet-500/20 pl-3 ml-1">{doubt.answer}</p>
                    ) : (
                      <p className="text-[11px] text-white/30 italic pl-4">Ainda sem resposta de estudo.</p>
                    )}
                    {doubt.references && (
                      <p className="text-[10px] text-white/30 pl-4 font-mono">Refs: {doubt.references}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenDoubtModal(doubt)}
                      className="text-[11px] font-semibold text-violet-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                      Editar/Responder
                    </button>
                    <button
                      onClick={() => handleToggleResolveDoubt(doubt.id, !doubt.isResolved)}
                      className={`rounded-xl p-1.5 border transition-all ${
                        doubt.isResolved ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-white/10 text-white/30 hover:bg-white/5"
                      }`}
                      title={doubt.isResolved ? "Resolvida" : "Marcar como resolvida"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoubt(doubt.id)}
                      className="p-1.5 rounded-xl border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-white/30 hover:text-rose-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: LINHA DO TEMPO ==================== */}
        {activeTab === "linha-do-tempo" && (
          <div className="space-y-6 text-left">
            <div className="relative border-l-2 border-violet-500/20 ml-3 pl-6 space-y-8">
              {TIMELINE.map((period, i) => (
                <motion.div
                  key={period.period}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative group"
                >
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-violet-500 ring-4 ring-violet-500/20 group-hover:scale-125 transition-all" />
                  
                  <div
                    className="p-5 rounded-2xl transition-all hover:bg-white/5"
                    style={{
                      background: "oklch(1 0 0 / 0.03)",
                      border: "1px solid oklch(1 0 0 / 0.05)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="font-display text-lg text-white font-medium">{period.period}</h3>
                      <span className="text-[11px] font-mono text-violet-300 font-semibold bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                        {period.dates}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{period.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase text-white/30 tracking-wider">Principais Personagens:</span>
                      {period.keyFigures.map(figure => (
                        <span
                          key={figure}
                          className="text-[11px] rounded-lg px-2 py-0.5 text-amber-200"
                          style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}
                        >
                          {figure}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: PESQUISA CENTRAL ==================== */}
        {activeTab === "pesquisa" && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
              <Search className="w-4 h-4 text-white/25 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Busque por 'amor', 'fé', 'Pedro', 'arca', 'jejum'..."
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/25"
              />
            </div>

            {searchResults ? (
              <div className="space-y-5">
                {/* Search category filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/5 text-xs font-medium">
                  {[
                    { id: "all", label: "Tudo" },
                    { id: "verses", label: `Versículos (${searchResults.verses.length})` },
                    { id: "characters", label: `Personagens (${searchResults.characters.length})` },
                    { id: "places", label: `Lugares (${searchResults.places.length})` },
                    { id: "words", label: `Palavras (${searchResults.words.length})` },
                    { id: "commentaries", label: `Comentários (${searchResults.commentaries.length})` },
                    { id: "maps", label: `Mapas (${searchResults.maps.length})` },
                    { id: "timeline", label: `Linha do Tempo (${searchResults.timeline.length})` },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSearchCategory(cat.id)}
                      className="rounded-lg px-2.5 py-1 transition-all shrink-0"
                      style={searchCategory === cat.id ? {
                        background: "oklch(1 0 0 / 0.08)",
                        color: "white"
                      } : {
                        color: "oklch(1 0 0 / 0.4)"
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Results Renderer */}
                <div className="space-y-4">
                  {/* Versículos */}
                  {(searchCategory === "all" || searchCategory === "verses") && searchResults.verses.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Versículos</h4>
                      {searchResults.verses.map((v: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{v.ref}</span>
                          <p className="text-xs text-white/70 italic mt-1">"{v.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Personagens */}
                  {(searchCategory === "all" || searchCategory === "characters") && searchResults.characters.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Personagens</h4>
                      {searchResults.characters.map((c: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{c.name}</span>
                          <p className="text-xs text-white/70 mt-1">{c.birth}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lugares / Arqueologia */}
                  {(searchCategory === "all" || searchCategory === "places") && searchResults.places.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Lugares & Arqueologia</h4>
                      {searchResults.places.map((p: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{p.title}</span>
                          <p className="text-xs text-white/50">{p.location}</p>
                          <p className="text-xs text-white/75 mt-1">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Palavras / Dicionario */}
                  {(searchCategory === "all" || searchCategory === "words") && searchResults.words.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Dicionário (Palavras)</h4>
                      {searchResults.words.map((w: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{w.term}</span>
                          <p className="text-xs text-white/70 italic">{w.origin}</p>
                          <p className="text-xs text-white/75 mt-1">{w.meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comentários */}
                  {(searchCategory === "all" || searchCategory === "commentaries") && searchResults.commentaries.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Comentários de Estudiosos</h4>
                      {searchResults.commentaries.map((c: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{c.scholar} ({c.key})</span>
                          <p className="text-xs text-white/70 italic mt-1">"{c.summary}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mapas */}
                  {(searchCategory === "all" || searchCategory === "maps") && searchResults.maps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Mapas & Viagens</h4>
                      {searchResults.maps.map((m: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{m.title}</span>
                          <p className="text-xs text-white/70 mt-1">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Linha do Tempo */}
                  {(searchCategory === "all" || searchCategory === "timeline") && searchResults.timeline.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-violet-400">Linha do Tempo</h4>
                      {searchResults.timeline.map((t: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <span className="text-xs font-semibold text-amber-200">{t.period} ({t.dates})</span>
                          <p className="text-xs text-white/70 mt-1">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[250px] rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-white/30 text-sm gap-2">
                <HelpCircle className="w-8 h-8 opacity-40 text-violet-400" />
                <span>Digite sua busca para pesquisar em toda a base bíblica do sistema</span>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: MARCADORES INTELIGENTES & DESAFIOS ==================== */}
        {activeTab === "marcadores" && (
          <div className="space-y-6 text-left">
            {/* Markers counter dashboard card */}
            <div
              className="p-6 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.60 0.18 255 / 0.1), oklch(0.50 0.2 280 / 0.05))",
                border: "1px solid oklch(0.65 0.18 255 / 0.25)",
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-400" />
                    Marcadores Inteligentes
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    {markedCount > 0
                      ? `Você possui ${markedCount} versículos destacados em suas cores de alerta para estudar ou revisar.`
                      : "Nenhum versículo marcado para revisão no momento."}
                  </p>
                </div>
                {markedCount > 0 && (
                  <span className="text-3xl font-display font-bold text-violet-300 bg-violet-500/10 px-4 py-2 rounded-2xl border border-violet-500/20">
                    {markedCount}
                  </span>
                )}
              </div>

              {/* Marked verses lists */}
              {markedCount > 0 && (
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider block">Versículos salvos para revisão</span>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {markedVerses.map((v, i) => (
                      <a
                        key={i}
                        href="/biblia"
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            v.color === "red" ? "bg-rose-400" : "bg-amber-400"
                          }`} />
                          <span className="font-semibold text-white">{v.book} {v.chapter}:{v.verse}</span>
                        </div>
                        <span className="text-[10px] text-violet-300 font-medium">Revisar na Bíblia →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Challenges list */}
            <div>
              <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-300" /> Desafios de Estudo
              </h3>
              <p className="text-sm text-white/40 mb-4">Complete as tarefas para desenvolver sua autonomia no aprendizado exegético.</p>
              
              <div className="space-y-3">
                {STUDY_CHALLENGES.map(chall => {
                  const isCompleted = completedChalls.includes(chall.id);
                  return (
                    <div
                      key={chall.id}
                      className="p-4 rounded-xl transition-all hover:bg-white/5 flex items-center justify-between gap-3"
                      style={{
                        background: "oklch(1 0 0 / 0.02)",
                        border: "1px solid oklch(1 0 0 / 0.05)",
                      }}
                    >
                      <div className="text-left space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-violet-300">{chall.category}</span>
                        <h4 className="font-semibold text-sm text-white leading-normal">{chall.title}</h4>
                        <p className="text-xs text-white/55 leading-relaxed">{chall.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleChallenge(chall.id)}
                        className={`rounded-xl p-2 border transition-all shrink-0 ${
                          isCompleted ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-in zoom-in duration-200" : "border-white/10 text-white/20 hover:bg-white/5"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Create New Notebook ── */}
      <AnimatePresence>
        {showNewNotebookModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
              onClick={() => setShowNewNotebookModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 max-w-md mx-auto space-y-4"
              style={{
                background: "oklch(0.14 0.03 270 / 0.98)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                  <Library className="w-4 h-4 text-violet-400" />
                  Novo Caderno de Estudo
                </h3>
                <button onClick={() => setShowNewNotebookModal(false)} className="p-1 rounded-full hover:bg-white/10 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-left">
                <div>
                  <label className="text-[10px] uppercase text-white/40 block mb-1">Título do Estudo (Ex: O Evangelho de João)</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Digite o título..."
                    className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 block mb-1">Objetivo / Foco do Estudo</label>
                  <input
                    type="text"
                    value={newNoteObjective}
                    onChange={(e) => setNewNoteObjective(e.target.value)}
                    placeholder="Ex: Entender o amor prático..."
                    className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Livro Inicial</label>
                    <input
                      type="text"
                      value={newNoteBook}
                      onChange={(e) => setNewNoteBook(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Capítulo Inicial</label>
                    <input
                      type="number"
                      value={newNoteChapter}
                      onChange={(e) => setNewNoteChapter(Number(e.target.value))}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowNewNotebookModal(false)}
                  className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNotebook}
                  className="rounded-xl px-4 py-2 text-sm text-white font-medium hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
                >
                  Criar Caderno
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL: Answer/Edit Doubt ── */}
      <AnimatePresence>
        {selectedDoubt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedDoubt(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 max-w-md mx-auto space-y-4"
              style={{
                background: "oklch(0.14 0.03 270 / 0.98)",
                border: "1px solid oklch(0.65 0.18 280 / 0.3)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.7)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-md text-white font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  Resolver Dúvida
                </h3>
                <button onClick={() => setSelectedDoubt(null)} className="p-1 rounded-full hover:bg-white/10 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] uppercase text-white/40 block">Pergunta</span>
                  <p className="text-sm font-semibold text-white leading-normal mt-0.5">{selectedDoubt.question}</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-white/40 block mb-1">Sua Resposta / Conclusão de Estudo</label>
                  <textarea
                    rows={4}
                    value={doubtAnswerText}
                    onChange={(e) => setDoubtAnswerText(e.target.value)}
                    placeholder="Escreva as descobertas que você fez ao pesquisar este tema..."
                    className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-white/40 block mb-1">Referências Utilizadas (opcional)</label>
                  <input
                    type="text"
                    value={doubtRefsText}
                    onChange={(e) => setDoubtRefsText(e.target.value)}
                    placeholder="Ex: Gênesis 14, Comentário N.T. Wright..."
                    className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-1 focus:ring-violet-400/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedDoubt(null)}
                  className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDoubtAnswer}
                  className="rounded-xl px-4 py-2 text-sm text-white font-medium hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}
                >
                  Salvar Resposta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
