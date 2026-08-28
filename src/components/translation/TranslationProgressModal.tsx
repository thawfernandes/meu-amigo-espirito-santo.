import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Activity,
  Cpu,
  Database,
  Calendar,
} from "lucide-react";

export const BIBLE_BOOKS = [
  { abbr: "gn", name: "Gênesis", testament: "AT", chapters: 50 },
  { abbr: "ex", name: "Êxodo", testament: "AT", chapters: 40 },
  { abbr: "lv", name: "Levítico", testament: "AT", chapters: 27 },
  { abbr: "nm", name: "Números", testament: "AT", chapters: 36 },
  { abbr: "dt", name: "Deuteronômio", testament: "AT", chapters: 34 },
  { abbr: "js", name: "Josué", testament: "AT", chapters: 24 },
  { abbr: "jz", name: "Juízes", testament: "AT", chapters: 21 },
  { abbr: "rt", name: "Rute", testament: "AT", chapters: 4 },
  { abbr: "1sm", name: "1 Samuel", testament: "AT", chapters: 31 },
  { abbr: "2sm", name: "2 Samuel", testament: "AT", chapters: 24 },
  { abbr: "1rs", name: "1 Reis", testament: "AT", chapters: 22 },
  { abbr: "2rs", name: "2 Reis", testament: "AT", chapters: 25 },
  { abbr: "1cr", name: "1 Crônicas", testament: "AT", chapters: 29 },
  { abbr: "2cr", name: "2 Crônicas", testament: "AT", chapters: 36 },
  { abbr: "ed", name: "Esdras", testament: "AT", chapters: 10 },
  { abbr: "ne", name: "Neemias", testament: "AT", chapters: 13 },
  { abbr: "et", name: "Ester", testament: "AT", chapters: 10 },
  { abbr: "jó", name: "Jó", testament: "AT", chapters: 42 },
  { abbr: "sl", name: "Salmos", testament: "AT", chapters: 150 },
  { abbr: "pv", name: "Provérbios", testament: "AT", chapters: 31 },
  { abbr: "ec", name: "Eclesiastes", testament: "AT", chapters: 12 },
  { abbr: "ct", name: "Cantares", testament: "AT", chapters: 8 },
  { abbr: "is", name: "Isaías", testament: "AT", chapters: 66 },
  { abbr: "jr", name: "Jeremias", testament: "AT", chapters: 52 },
  { abbr: "lm", name: "Lamentações", testament: "AT", chapters: 5 },
  { abbr: "ez", name: "Ezequiel", testament: "AT", chapters: 48 },
  { abbr: "dn", name: "Daniel", testament: "AT", chapters: 12 },
  { abbr: "os", name: "Oséias", testament: "AT", chapters: 14 },
  { abbr: "jl", name: "Joel", testament: "AT", chapters: 3 },
  { abbr: "am", name: "Amós", testament: "AT", chapters: 9 },
  { abbr: "ob", name: "Obadias", testament: "AT", chapters: 1 },
  { abbr: "jn", name: "Jonas", testament: "AT", chapters: 4 },
  { abbr: "mq", name: "Miquéias", testament: "AT", chapters: 7 },
  { abbr: "na", name: "Naum", testament: "AT", chapters: 3 },
  { abbr: "hc", name: "Habacuque", testament: "AT", chapters: 3 },
  { abbr: "sf", name: "Sofonias", testament: "AT", chapters: 3 },
  { abbr: "ag", name: "Ageu", testament: "AT", chapters: 2 },
  { abbr: "zc", name: "Zacarias", testament: "AT", chapters: 14 },
  { abbr: "ml", name: "Malaquias", testament: "AT", chapters: 4 },
  { abbr: "mt", name: "Mateus", testament: "NT", chapters: 28 },
  { abbr: "mc", name: "Marcos", testament: "NT", chapters: 16 },
  { abbr: "lc", name: "Lucas", testament: "NT", chapters: 24 },
  { abbr: "jo", name: "João", testament: "NT", chapters: 21 },
  { abbr: "at", name: "Atos", testament: "NT", chapters: 28 },
  { abbr: "rm", name: "Romanos", testament: "NT", chapters: 16 },
  { abbr: "1co", name: "1 Coríntios", testament: "NT", chapters: 16 },
  { abbr: "2co", name: "2 Coríntios", testament: "NT", chapters: 13 },
  { abbr: "gl", name: "Gálatas", testament: "NT", chapters: 6 },
  { abbr: "ef", name: "Efésios", testament: "NT", chapters: 6 },
  { abbr: "fp", name: "Filipenses", testament: "NT", chapters: 4 },
  { abbr: "cl", name: "Colossenses", testament: "NT", chapters: 4 },
  { abbr: "1ts", name: "1 Tessalonicenses", testament: "NT", chapters: 5 },
  { abbr: "2ts", name: "2 Tessalonicenses", testament: "NT", chapters: 3 },
  { abbr: "1tm", name: "1 Timóteo", testament: "NT", chapters: 6 },
  { abbr: "2tm", name: "2 Timóteo", testament: "NT", chapters: 4 },
  { abbr: "tt", name: "Tito", testament: "NT", chapters: 3 },
  { abbr: "fm", name: "Filemom", testament: "NT", chapters: 1 },
  { abbr: "hb", name: "Hebreus", testament: "NT", chapters: 13 },
  { abbr: "tg", name: "Tiago", testament: "NT", chapters: 5 },
  { abbr: "1pe", name: "1 Pedro", testament: "NT", chapters: 5 },
  { abbr: "2pe", name: "2 Pedro", testament: "NT", chapters: 3 },
  { abbr: "1jo", name: "1 João", testament: "NT", chapters: 5 },
  { abbr: "2jo", name: "2 João", testament: "NT", chapters: 1 },
  { abbr: "3jo", name: "3 João", testament: "NT", chapters: 1 },
  { abbr: "jd", name: "Judas", testament: "NT", chapters: 1 },
  { abbr: "ap", name: "Apocalipse", testament: "NT", chapters: 22 },
];

interface TranslationJob {
  id: number;
  book: string;
  chapter: number;
  status: "pending" | "processing" | "completed" | "failed" | "rate_limited";
  attempts: number;
  verses_completed: number;
  total_verses: number;
  last_error: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

interface EngineTelemetry {
  status: string;
  current_batch: string | null;
  gemini_calls_made: number;
  gemini_calls_limit: number;
  chapters_translated_this_run: number;
  last_run_at: string;
  last_run_source: string;
  github_run_id: string | null;
  error_message: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TranslationProgressModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [totalVerses, setTotalVerses] = useState(0);
  const [telemetry, setTelemetry] = useState<EngineTelemetry | null>(null);
  const [selectedBook, setSelectedBook] = useState<string>("gn");

  async function loadData() {
    try {
      setRefreshing(true);

      // 1. Fetch translation_jobs in batches
      let allJobs: TranslationJob[] = [];
      let page = 0;
      let fetching = true;
      while (fetching) {
        const { data, error } = await supabase
          .from("translation_jobs")
          .select("*")
          .range(page * 1000, (page + 1) * 1000 - 1)
          .order("id", { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) {
          fetching = false;
        } else {
          allJobs.push(...(data as TranslationJob[]));
          page++;
        }
      }
      setJobs(allJobs);

      // 2. Count total verses
      const { count } = await supabase
        .from("original_bible_verses")
        .select("*", { count: "exact", head: true });
      setTotalVerses(count || 0);

      // 3. Telemetry
      const { data: healthData } = await supabase
        .from("system_health")
        .select("*")
        .eq("id", "translation_engine")
        .maybeSingle();

      if (healthData && healthData.notes) {
        try {
          setTelemetry(JSON.parse(healthData.notes));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const processingCount = jobs.filter((j) => j.status === "processing").length;
  const rateLimitedCount = jobs.filter((j) => j.status === "rate_limited").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const percent = jobs.length > 0 ? ((completedCount / 1189) * 100).toFixed(2) : "0.00";

  const selectedBookObj = BIBLE_BOOKS.find((b) => b.abbr === selectedBook);
  const selectedBookJobs = jobs.filter((j) => j.book === selectedBook);
  const selectedBookCompleted = selectedBookJobs.filter((j) => j.status === "completed").length;
  const selectedBookPct =
    selectedBookJobs.length > 0
      ? Math.round((selectedBookCompleted / selectedBookJobs.length) * 100)
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl text-zinc-100 overflow-hidden shadow-2xl z-10 border border-zinc-700/60"
            style={{
              background: "oklch(0.12 0.03 270 / 0.98)",
              boxShadow: "0 32px 100px oklch(0 0 0 / 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-violet-500/20 border border-violet-500/30 text-violet-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      Progresso da Tradução Bíblica Autônoma
                    </h2>
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Nuvem Ativa
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tradução exegética dos textos originais (Massorético & SBLGNT) via GitHub Actions + Gemini 2.5
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  disabled={refreshing}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 transition-all cursor-pointer border border-zinc-700 flex items-center gap-1.5 text-xs font-semibold"
                  title="Atualizar dados agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-violet-400" : ""}`} />
                  <span className="hidden sm:inline">Sincronizar</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-700/60"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Top Banner: Status do Motor */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs text-zinc-400">Orquestração em Nuvem:</span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-100 ml-1.5">
                      {telemetry?.status === "active"
                        ? `Traduzindo agora: ${telemetry.current_batch || "Multi-capítulo"}`
                        : "Autônomo no GitHub Actions (Cron Diário às 07:00 UTC / 04:00 BRT)"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>Modelo: <strong className="text-zinc-200">gemini-2.5-flash</strong></span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. Progresso Geral */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Progresso Geral
                  </span>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">{percent}%</div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {completedCount} / 1.189 Capítulos
                  </span>
                </div>

                {/* 2. Versículos Prontos */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Versículos Prontos
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {totalVerses.toLocaleString("pt-BR")}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Hebraico / Grego + Termos
                  </span>
                </div>

                {/* 3. Última Execução */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Última Execução
                  </span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 truncate">
                      {telemetry?.last_run_at
                        ? new Date(telemetry.last_run_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        : "Hoje"}
                    </div>
                    <div className="text-[11px] text-violet-400 font-medium mt-0.5">
                      {telemetry?.last_run_source === "github-actions" ? "GitHub Actions" : "Cloud Job"}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {telemetry?.gemini_calls_made || 1} / 18 chamadas
                  </span>
                </div>

                {/* 4. Próxima Execução */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Próximo Lote
                  </span>
                  <div>
                    <div className="text-base font-bold text-blue-400">07:00 UTC</div>
                    <div className="text-[10px] text-zinc-400">04:00 (Brasília)</div>
                  </div>
                  <span className="text-[10px] text-zinc-500">Cron Automático</span>
                </div>

                {/* 5. Pendentes */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Pendentes
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-300">
                    {pendingCount.toLocaleString("pt-BR")}
                  </div>
                  <span className="text-[10px] text-zinc-500">Na fila ordenada</span>
                </div>

                {/* 6. Rate Limit / Retries */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between h-32">
                  <span className="text-[11px] text-orange-400 font-semibold uppercase tracking-wider">
                    Em Espera
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">
                    {rateLimitedCount}
                  </div>
                  <span className="text-[10px] text-zinc-500">{failedCount} falhas definitivas</span>
                </div>
              </div>

              {/* Bible Books Interactive Map */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      Mapa dos 66 Livros da Bíblia
                    </h3>
                    <p className="text-xs text-zinc-400">Clique em qualquer livro para inspecionar o estado de cada capítulo</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Concluído
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-950/60 border border-yellow-800/60 text-yellow-300">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Processando
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                      <span className="w-2 h-2 rounded-full bg-zinc-600" /> Pendente
                    </span>
                  </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {BIBLE_BOOKS.map((book) => {
                    const bookJobs = jobs.filter((j) => j.book === book.abbr);
                    const bookCompleted = bookJobs.filter((j) => j.status === "completed").length;
                    const bookPct = bookJobs.length > 0 ? (bookCompleted / book.chapters) * 100 : 0;
                    const isSelected = selectedBook === book.abbr;

                    let bgClass = "bg-zinc-900/80 border-zinc-800 text-zinc-400";
                    if (bookPct === 100) {
                      bgClass = "bg-emerald-950/30 border-emerald-800/60 text-emerald-300";
                    } else if (bookJobs.some((j) => j.status === "processing")) {
                      bgClass = "bg-yellow-950/30 border-yellow-800/60 text-yellow-300";
                    } else if (bookPct > 0) {
                      bgClass = "bg-violet-950/30 border-violet-800/60 text-violet-300";
                    }

                    return (
                      <button
                        key={book.abbr}
                        onClick={() => setSelectedBook(book.abbr)}
                        className={`flex flex-col p-2 rounded-xl border text-left cursor-pointer transition-all ${bgClass} ${
                          isSelected ? "ring-2 ring-violet-400 border-transparent shadow-lg" : "hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold truncate">{book.name}</span>
                          <span className="text-[9px] opacity-60 font-semibold">{book.testament}</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1">
                          {bookCompleted}/{book.chapters} cap
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Book Chapters Panel */}
                {selectedBookObj && (
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-violet-300 text-sm">
                        {selectedBookObj.name} ({selectedBookObj.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"})
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedBookPct}% Concluído ({selectedBookCompleted} de {selectedBookObj.chapters} Capítulos)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedBookJobs.map((j) => {
                        let statusColor = "bg-zinc-850 border-zinc-750 text-zinc-400";
                        if (j.status === "completed") {
                          statusColor = "bg-emerald-500 text-zinc-950 font-extrabold border-emerald-400";
                        } else if (j.status === "processing") {
                          statusColor = "bg-yellow-400 text-zinc-950 font-extrabold border-yellow-300 animate-pulse";
                        } else if (j.status === "rate_limited") {
                          statusColor = "bg-orange-500 text-zinc-950 font-extrabold border-orange-400";
                        } else if (j.status === "failed") {
                          statusColor = "bg-red-500 text-zinc-950 font-extrabold border-red-400";
                        }

                        return (
                          <div
                            key={j.id}
                            className={`px-2.5 py-1 rounded-lg border text-xs cursor-help transition-all shadow-sm ${statusColor}`}
                            title={`Capítulo ${j.chapter} | Status: ${j.status.toUpperCase()} | Versículos: ${j.verses_completed}/${j.total_verses}`}
                          >
                            {j.chapter}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Cloud Info Footer */}
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Persistência definitiva no <strong>Supabase PostgreSQL</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <span>Execução 100% autônoma na nuvem (GitHub Actions)</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-violet-900/30"
              >
                Fechar Painel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
