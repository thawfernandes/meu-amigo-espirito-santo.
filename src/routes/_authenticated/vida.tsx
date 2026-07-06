import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAudio } from "@/components/audio/AudioProvider";
import {
  HeartHandshake,
  Flame,
  CheckCircle2,
  BookHeart,
  Plus,
  X,
  Check,
  Trash2,
  ChevronRight,
  Sparkles,
  Clock,
  BookOpen,
  Target,
  Heart,
  BookMarked,
  Lock,
  Eye,
  Calendar,
  Award,
  Edit2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/vida")({ component: Vida });

type PrayerKind =
  | "prayer"
  | "devotional"
  | "purpose"
  | "fast"
  | "gratitude"
  | "learning"
  | "favorite_verse"
  | "timeline";

interface Prayer {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const SECTIONS = [
  {
    kind: "prayer" as PrayerKind,
    icon: HeartHandshake,
    label: "Orações",
    emoji: "🙏",
    placeholder: "Qual o seu pedido de oração?",
  },
  {
    kind: "devotional" as PrayerKind,
    icon: BookOpen,
    label: "Devocionais",
    emoji: "📖",
    placeholder: "Qual versículo leu hoje?",
  },
  {
    kind: "purpose" as PrayerKind,
    icon: Target,
    label: "Propósitos",
    emoji: "🎯",
    placeholder: "Qual o seu propósito?",
  },
  {
    kind: "fast" as PrayerKind,
    icon: Flame,
    label: "Jejuns",
    emoji: "🍞",
    placeholder: "Motivo do seu jejum?",
  },
  {
    kind: "gratitude" as PrayerKind,
    icon: Heart,
    label: "Gratidão",
    emoji: "❤️",
    placeholder: "Pelo que você é grato hoje?",
  },
  {
    kind: "learning" as PrayerKind,
    icon: BookHeart,
    label: "Aprendizados",
    emoji: "🌱",
    placeholder: "O que aprendeu?",
  },
  {
    kind: "favorite_verse" as PrayerKind,
    icon: BookMarked,
    label: "Favoritos",
    emoji: "📌",
    placeholder: "Referência do versículo (Ex: Romanos 8:28)",
  },
  {
    kind: "timeline" as PrayerKind,
    icon: Clock,
    label: "Linha do Tempo",
    emoji: "📅",
    placeholder: "",
  },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function parseRecordBody(bodyStr: string | null) {
  if (!bodyStr) return {};
  try {
    if (bodyStr.startsWith("{") && bodyStr.endsWith("}")) {
      return JSON.parse(bodyStr);
    }
  } catch (e) {}
  return { description: bodyStr };
}

function AddForm({
  kind,
  onAdd,
  onClose,
}: {
  kind: string;
  onAdd: (title: string, bodyJson: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");

  // Custom states per kind
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("família");
  const [privacy, setPrivacy] = useState("private");

  // Devotional states
  const [verse, setVerse] = useState("");
  const [learned, setLearned] = useState("");
  const [application, setApplication] = useState("");
  const [feeling, setFeeling] = useState("😊 Alegre");

  // Purpose states
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState("");
  const [objective, setObjective] = useState("");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  // Fast states
  const [fastDate, setFastDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [fastNotes, setFastNotes] = useState("");
  const [learnings, setLearnings] = useState("");

  // Gratitude states
  const [gratitudeText, setGratitudeText] = useState("");

  // Learning states
  const [source, setSource] = useState("culto");
  const [learningNotes, setLearningNotes] = useState("");

  // Favorite verse states
  const [favVerseRef, setFavVerseRef] = useState("");
  const [favVerseText, setFavVerseText] = useState("");
  const [favVerseReason, setFavVerseReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let bodyJson: any = {};
    let finalTitle = title.trim();

    if (kind === "prayer") {
      if (!finalTitle) {
        toast.error("Por favor, digite o título da oração.");
        return;
      }
      bodyJson = { description, category, privacy };
    } else if (kind === "devotional") {
      if (!verse.trim()) {
        toast.error("Por favor, informe o versículo lido.");
        return;
      }
      finalTitle = `Devocional: ${verse}`;
      bodyJson = { verse, learned, application, feeling };
    } else if (kind === "purpose") {
      if (!finalTitle) {
        toast.error("Por favor, digite o nome do propósito.");
        return;
      }
      bodyJson = { start_date: startDate, objective, deadline, progress, notes };
    } else if (kind === "fast") {
      if (!duration.trim()) {
        toast.error("Por favor, digite a duração do jejum.");
        return;
      }
      finalTitle = `Jejum de ${duration}`;
      bodyJson = { date: fastDate, duration, reason, notes: fastNotes, learnings };
    } else if (kind === "gratitude") {
      if (!gratitudeText.trim()) {
        toast.error("Por favor, descreva seu motivo de gratidão.");
        return;
      }
      finalTitle = `Gratidão`;
      bodyJson = { text: gratitudeText };
    } else if (kind === "learning") {
      if (!finalTitle) {
        toast.error("Por favor, dê um título para o aprendizado.");
        return;
      }
      bodyJson = { source, notes: learningNotes };
    } else if (kind === "favorite_verse") {
      if (!favVerseRef.trim() || !favVerseText.trim()) {
        toast.error("Por favor, preencha a referência e o texto do versículo.");
        return;
      }
      finalTitle = favVerseRef.trim();
      bodyJson = { text: favVerseText, reason: favVerseReason };
    }

    onAdd(finalTitle, JSON.stringify(bodyJson));
    onClose();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-3xl p-5 sm:p-6 mb-6 space-y-4 text-left text-white"
      style={{
        background: "oklch(0.14 0.03 260 / 0.95)",
        border: "1px solid oklch(1 0 0 / 0.15)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <h3 className="font-semibold text-sm text-white/90">Novo Registro</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 text-white/40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic forms per kind */}
      {kind === "prayer" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Título do Pedido
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Saúde da minha mãe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-rose-400/40"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Detalhes / Motivo
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu pedido de oração em detalhes..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-rose-400/40 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="família" className="bg-[#17152b]">
                  Família
                </option>
                <option value="saúde" className="bg-[#17152b]">
                  Saúde
                </option>
                <option value="trabalho" className="bg-[#17152b]">
                  Trabalho
                </option>
                <option value="estudos" className="bg-[#17152b]">
                  Estudos
                </option>
                <option value="igreja" className="bg-[#17152b]">
                  Igreja
                </option>
                <option value="outro" className="bg-[#17152b]">
                  Outros
                </option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Privacidade
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="private" className="bg-[#17152b]">
                  Somente eu (Privado)
                </option>
                <option value="public" className="bg-[#17152b]">
                  Público (Comunhão)
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {kind === "devotional" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Versículo Lido
              </label>
              <input
                autoFocus
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="Ex: João 3:16"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-sky-400/40"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Como se sentia?
              </label>
              <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="😊 Alegre" className="bg-[#17152b]">
                  😊 Alegre
                </option>
                <option value="🙏 Grato" className="bg-[#17152b]">
                  🙏 Grato
                </option>
                <option value="😴 Cansado" className="bg-[#17152b]">
                  😴 Cansado
                </option>
                <option value="🤔 Reflexivo" className="bg-[#17152b]">
                  🤔 Reflexivo
                </option>
                <option value="😔 Ansioso" className="bg-[#17152b]">
                  😔 Ansioso
                </option>
                <option value="💪 Fortalecido" className="bg-[#17152b]">
                  💪 Fortalecido
                </option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              O que aprendeu?
            </label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Descreva o que o Espírito Santo te revelou nesta leitura..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-sky-400/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Como aplicar no dia a dia?
            </label>
            <textarea
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              placeholder="Uma ação prática para viver esse aprendizado hoje..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-sky-400/40 resize-none"
            />
          </div>
        </div>
      )}

      {kind === "purpose" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Propósito / Compromisso
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ler toda a Bíblia em 1 ano"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-400/40"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Objetivo Geral
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="O que motivou esse propósito?"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-400/40 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Prazo (Opcional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Observações Iniciais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algum cronograma, notas de apoio..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      )}

      {kind === "fast" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Duração
              </label>
              <input
                autoFocus
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 12 horas, 7 dias parcial"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-orange-400/40"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Data do Jejum
              </label>
              <input
                type="date"
                value={fastDate}
                onChange={(e) => setFastDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Motivo do Jejum
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Qual clamor ou propósito motivou este jejum?"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-orange-400/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Observações do Jejum
            </label>
            <textarea
              value={fastNotes}
              onChange={(e) => setFastNotes(e.target.value)}
              placeholder="O que cortará da alimentação, atividades..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              O que aprendeu/sentiu?
            </label>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Registre as lições e a ação do Espírito Santo..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      )}

      {kind === "gratitude" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Pelo que é grato hoje?
            </label>
            <textarea
              autoFocus
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="Agradeço a Deus por..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-rose-400/40 resize-none"
            />
          </div>
        </div>
      )}

      {kind === "learning" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Título do Aprendizado
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A paciência na tribulação"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-400/40"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
                Origem do Ensino
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="culto" className="bg-[#17152b]">
                  Pregação de Culto
                </option>
                <option value="leitura bíblica" className="bg-[#17152b]">
                  Leitura Bíblica
                </option>
                <option value="conversa" className="bg-[#17152b]">
                  Conversa edificante
                </option>
                <option value="momento de oração" className="bg-[#17152b]">
                  Momento de Oração
                </option>
                <option value="outro" className="bg-[#17152b]">
                  Outros momentos
                </option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Lições que Deus te ensinou
            </label>
            <textarea
              value={learningNotes}
              onChange={(e) => setLearningNotes(e.target.value)}
              placeholder="Descreva o insight ou ensinamento marcante..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-400/40 resize-none"
            />
          </div>
        </div>
      )}

      {kind === "favorite_verse" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Referência
            </label>
            <input
              autoFocus
              value={favVerseRef}
              onChange={(e) => setFavVerseRef(e.target.value)}
              placeholder="Ex: Romanos 8:28"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Texto do Versículo
            </label>
            <textarea
              value={favVerseText}
              onChange={(e) => setFavVerseText(e.target.value)}
              placeholder="Digite ou cole as palavras sagradas do versículo..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-amber-400/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Por que este versículo é importante para você?
            </label>
            <textarea
              value={favVerseReason}
              onChange={(e) => setFavVerseReason(e.target.value)}
              placeholder="O que este trecho evoca em sua vida cristã..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl px-5 py-2 text-xs text-white font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.22 355), oklch(0.58 0.22 340))",
            boxShadow: "0 4px 16px oklch(0.65 0.22 355 / 0.35)",
          }}
        >
          Salvar Registro
        </button>
      </div>
    </motion.form>
  );
}

function RecordCard({
  item,
  onMarkAnswered,
  onUpdatePurpose,
  onDelete,
}: {
  item: Prayer;
  onMarkAnswered?: (id: string, how: string, testimony: string) => void;
  onUpdatePurpose?: (item: Prayer, newProg: number) => void;
  onDelete: (id: string) => void;
}) {
  const [exp, setExp] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [howAns, setHowAns] = useState("");
  const [testimony, setTestimony] = useState("");

  const data = parseRecordBody(item.body);
  const dateStr = fmt(item.created_at);

  const getCardStyle = () => {
    switch (item.kind) {
      case "prayer":
        return {
          border: "1px solid oklch(0.65 0.22 355 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.65 0.22 355 / 0.04), oklch(0.65 0.22 355 / 0.02))",
          glow: "oklch(0.65 0.22 355 / 0.1)",
          tag: "text-rose-300 bg-rose-500/10 border-rose-500/20",
          emoji: "🙏",
        };
      case "devotional":
        return {
          border: "1px solid oklch(0.65 0.18 220 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.65 0.18 220 / 0.04), oklch(0.65 0.18 220 / 0.02))",
          glow: "oklch(0.65 0.18 220 / 0.1)",
          tag: "text-sky-300 bg-sky-500/10 border-sky-500/20",
          emoji: "📖",
        };
      case "purpose":
        return {
          border: "1px solid oklch(0.6 0.2 280 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.6 0.2 280 / 0.04), oklch(0.6 0.2 280 / 0.02))",
          glow: "oklch(0.6 0.2 280 / 0.1)",
          tag: "text-violet-300 bg-violet-500/10 border-violet-500/20",
          emoji: "🎯",
        };
      case "fast":
        return {
          border: "1px solid oklch(0.65 0.2 40 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 40 / 0.04), oklch(0.65 0.2 40 / 0.02))",
          glow: "oklch(0.65 0.2 40 / 0.1)",
          tag: "text-orange-300 bg-orange-500/10 border-orange-500/20",
          emoji: "🍞",
        };
      case "gratitude":
        return {
          border: "1px solid oklch(0.62 0.22 15 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.62 0.22 15 / 0.04), oklch(0.62 0.22 15 / 0.02))",
          glow: "oklch(0.62 0.22 15 / 0.1)",
          tag: "text-red-300 bg-red-500/10 border-red-500/20",
          emoji: "❤️",
        };
      case "learning":
        return {
          border: "1px solid oklch(0.65 0.18 155 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.65 0.18 155 / 0.04), oklch(0.65 0.18 155 / 0.02))",
          glow: "oklch(0.65 0.18 155 / 0.1)",
          tag: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
          emoji: "🌱",
        };
      case "favorite_verse":
        return {
          border: "1px solid oklch(0.75 0.18 80 / 0.15)",
          background:
            "linear-gradient(135deg, oklch(0.75 0.18 80 / 0.04), oklch(0.75 0.18 80 / 0.02))",
          glow: "oklch(0.75 0.18 80 / 0.1)",
          tag: "text-amber-300 bg-amber-500/10 border-amber-500/20",
          emoji: "📌",
        };
      default:
        return {
          border: "1px solid oklch(1 0 0 / 0.1)",
          background: "linear-gradient(135deg, oklch(1 0 0 / 0.04), oklch(1 0 0 / 0.02))",
          glow: "oklch(1 0 0 / 0.05)",
          tag: "text-white/40 bg-white/5 border-white/10",
          emoji: "📌",
        };
    }
  };

  const style = getCardStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-3xl p-5 flex flex-col gap-3 transition-all text-left"
      style={{
        background: style.background,
        border: style.border,
        boxShadow: `0 16px 40px -10px ${style.glow}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <button className="flex-1 text-left" onClick={() => setExp((e) => !e)}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{style.emoji}</span>
            <p className="text-sm font-semibold text-white/90 leading-snug">{item.title}</p>
          </div>
          {item.answered_at && (
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Respondida em{" "}
              {new Date(item.answered_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-full hover:bg-rose-400/15 text-white/20 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {exp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 pt-3"
          >
            {/* Orações */}
            {item.kind === "prayer" && (
              <div className="space-y-2 text-xs">
                <div className="flex gap-2 flex-wrap mb-1">
                  {data.category && (
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${style.tag}`}
                    >
                      {data.category}
                    </span>
                  )}
                  <span className="text-[9px] text-white/30 flex items-center gap-1 font-mono uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    <Lock className="w-2.5 h-2.5" />{" "}
                    {data.privacy === "private" ? "Privado" : "Público"}
                  </span>
                </div>
                {data.description && (
                  <p className="text-sm text-white/70 leading-relaxed mt-2 whitespace-pre-wrap">
                    {data.description}
                  </p>
                )}

                {item.answered_at ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <p className="font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resposta de Deus
                    </p>
                    {data.how_answered && (
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                          Como Deus respondeu:
                        </span>
                        <p className="text-white/80 leading-relaxed mt-0.5 whitespace-pre-wrap">
                          {data.how_answered}
                        </p>
                      </div>
                    )}
                    {data.testimony && (
                      <div className="border-t border-white/5 pt-1.5 mt-1">
                        <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                          Testemunho:
                        </span>
                        <p className="text-white/80 leading-relaxed mt-0.5 italic whitespace-pre-wrap">
                          "{data.testimony}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  onMarkAnswered &&
                  !answering && (
                    <button
                      onClick={() => setAnswering(true)}
                      className="mt-3 text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 hover:bg-emerald-500/15 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Respondida
                    </button>
                  )
                )}

                {answering && (
                  <div className="mt-3 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
                      Registrar Resposta de Deus
                    </p>
                    <textarea
                      value={howAns}
                      onChange={(e) => setHowAns(e.target.value)}
                      placeholder="Como Deus respondeu à sua oração?"
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-xs bg-[#17152b] border border-white/10 text-white outline-none focus:ring-1 focus:ring-emerald-400/40 resize-none"
                    />
                    <textarea
                      value={testimony}
                      onChange={(e) => setTestimony(e.target.value)}
                      placeholder="Seu testemunho (opcional)"
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-xs bg-[#17152b] border border-white/10 text-white outline-none focus:ring-1 focus:ring-emerald-400/40 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAnswering(false)}
                        className="text-[10px] text-white/40 hover:text-white rounded-lg px-2.5 py-1.5 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (howAns.trim() && onMarkAnswered) {
                            onMarkAnswered(item.id, howAns.trim(), testimony.trim());
                            setAnswering(false);
                          } else {
                            toast.error("Por favor, descreva a resposta.");
                          }
                        }}
                        className="text-[10px] font-semibold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg px-3 py-1.5 transition-all"
                      >
                        Salvar Resposta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Devocionais */}
            {item.kind === "devotional" && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sky-300">
                    📖 {data.verse || "Leitura Bíblica"}
                  </span>
                  <span className="text-[9px] text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    Sentimento: {data.feeling}
                  </span>
                </div>
                {data.learned && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      O que aprendi:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.learned}
                    </p>
                  </div>
                )}
                {data.application && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Como vou aplicar:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.application}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Propósitos */}
            {item.kind === "purpose" && (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>
                    Início:{" "}
                    {data.start_date
                      ? new Date(data.start_date).toLocaleDateString("pt-BR")
                      : "N/D"}
                  </span>
                  {data.deadline && (
                    <span>Prazo: {new Date(data.deadline).toLocaleDateString("pt-BR")}</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-violet-300 font-semibold mb-1">
                    <span>Progresso</span>
                    <span>{data.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${data.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Progress controls */}
                {onUpdatePurpose && (
                  <div className="flex gap-1.5 pt-1.5">
                    <button
                      onClick={() => onUpdatePurpose(item, Math.max(0, (data.progress || 0) - 10))}
                      className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 text-white/60 hover:text-white transition-all"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePurpose(item, Math.min(100, (data.progress || 0) + 10))
                      }
                      className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 text-white/60 hover:text-white transition-all"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => onUpdatePurpose(item, 100)}
                      className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded transition-all ml-auto font-medium"
                    >
                      Concluir
                    </button>
                  </div>
                )}

                {data.objective && (
                  <div className="border-t border-white/5 pt-2">
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Objetivo:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.objective}
                    </p>
                  </div>
                )}
                {data.notes && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Observações:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Jejuns */}
            {item.kind === "fast" && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>
                    Data: {data.date ? new Date(data.date).toLocaleDateString("pt-BR") : "N/D"}
                  </span>
                  <span>Duração: {data.duration || "N/D"}</span>
                </div>
                {data.reason && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Motivo:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.reason}
                    </p>
                  </div>
                )}
                {data.learnings && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Aprendizados:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.learnings}
                    </p>
                  </div>
                )}
                {data.notes && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Observações:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Gratidão */}
            {item.kind === "gratitude" && (
              <div className="text-xs">
                <p className="text-sm text-white/80 leading-relaxed italic whitespace-pre-wrap">
                  "{data.text || item.title}"
                </p>
              </div>
            )}

            {/* Aprendizados */}
            {item.kind === "learning" && (
              <div className="space-y-2 text-xs">
                {data.source && (
                  <span className="inline-block text-[9px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Origem: {data.source}
                  </span>
                )}
                {data.notes && (
                  <p className="text-sm text-white/70 leading-relaxed mt-1.5 whitespace-pre-wrap">
                    {data.notes}
                  </p>
                )}
              </div>
            )}

            {/* Versículos Favoritos */}
            {item.kind === "favorite_verse" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 border-l-2 border-l-amber-400">
                  <p className="text-sm text-white/80 leading-relaxed italic">"{data.text}"</p>
                </div>
                {data.reason && (
                  <div>
                    <span className="text-white/40 font-semibold block uppercase tracking-wider text-[9px]">
                      Por que é importante para mim:
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {data.reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 text-[10px] text-white/30 border-t border-white/5 pt-2 mt-1">
        <Clock className="w-3.5 h-3.5 text-white/20" />
        <span>{dateStr}</span>
        <button
          onClick={() => setExp((e) => !e)}
          className="ml-auto flex items-center gap-0.5 hover:text-white/50 transition-colors"
        >
          {exp ? "recolher" : "ver mais"}{" "}
          <ChevronRight className={`w-3 h-3 transition-transform ${exp ? "rotate-90" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}

function Vida() {
  const audio = useAudio();
  const [uid, setUid] = useState<string | null>(null);
  const [tab, setTab] = useState<PrayerKind>("prayer");
  const [allItems, setAllItems] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  useEffect(() => {
    audio.setContext("vida");
  }, []);

  const getLocalItems = useCallback((userId: string): Prayer[] => {
    try {
      const stored = localStorage.getItem(`local_prayers_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }, []);

  const saveLocalItems = useCallback((userId: string, items: Prayer[]) => {
    try {
      localStorage.setItem(`local_prayers_${userId}`, JSON.stringify(items));
    } catch (e) {}
  }, []);

  const loadAllItems = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prayers")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase prayers query error, falling back to local storage:", error);
        setUseLocalFallback(true);
        const localData = getLocalItems(uid);
        setAllItems(localData);
      } else {
        setAllItems(data as Prayer[]);
        saveLocalItems(uid, data as Prayer[]);
        setUseLocalFallback(false);
      }
    } catch (e) {
      console.error("Exception fetching from Supabase, using local fallback:", e);
      setUseLocalFallback(true);
      const localData = getLocalItems(uid);
      setAllItems(localData);
    }
    setLoading(false);
  }, [uid, getLocalItems, saveLocalItems]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUid(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (uid) {
      loadAllItems();
    }
  }, [uid, loadAllItems]);

  const add = async (title: string, bodyJson: string) => {
    if (!uid || !title.trim()) return;

    if (useLocalFallback) {
      const newItem: Prayer = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2),
        user_id: uid,
        kind: tab,
        title: title.trim(),
        body: bodyJson,
        answered_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newItem, ...allItems];
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro adicionado localmente! 🙏");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("prayers")
        .insert({
          user_id: uid,
          kind: tab,
          title: title.trim(),
          body: bodyJson,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar no Supabase, tentando localmente:", error);
        setUseLocalFallback(true);
        const newItem: Prayer = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2),
          user_id: uid,
          kind: tab,
          title: title.trim(),
          body: bodyJson,
          answered_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [newItem, ...allItems];
        setAllItems(updated);
        saveLocalItems(uid, updated);
        toast.success("Registro adicionado localmente! 🙏");
        return;
      }

      const updated = [data as Prayer, ...allItems];
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro adicionado à sua vida espiritual! 🙏");
    } catch (e) {
      console.error("Execução ao salvar, usando fallback local:", e);
      setUseLocalFallback(true);
      const newItem: Prayer = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2),
        user_id: uid,
        kind: tab,
        title: title.trim(),
        body: bodyJson,
        answered_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newItem, ...allItems];
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro adicionado localmente! 🙏");
    }
  };

  const markAnswered = async (id: string, howAnswered: string, testimony: string) => {
    const item = allItems.find((x) => x.id === id);
    if (!item || !uid) return;

    const bodyObj = parseRecordBody(item.body);
    const updatedBody = JSON.stringify({
      ...bodyObj,
      how_answered: howAnswered,
      testimony: testimony,
    });

    const isPublic = bodyObj.privacy === "public";
    if (isPublic && uid) {
      logActivity(uid, "prayer_answered", {
        prayerId: id,
        title: item.title,
        testimony,
        howAnswered,
      });
    }

    const now = new Date().toISOString();

    if (useLocalFallback) {
      const updated = allItems.map((x) =>
        x.id === id ? { ...x, answered_at: now, body: updatedBody, updated_at: now } : x,
      );
      setAllItems(updated);
      saveLocalItems(uid, updated);
      audio.play("achievement");
      toast.success("Marcada como respondida localmente! Glória a Deus. 🏆");
      return;
    }

    try {
      const { error } = await supabase
        .from("prayers")
        .update({
          answered_at: now,
          body: updatedBody,
        })
        .eq("id", id);

      if (error) {
        console.error("Erro ao marcar oração no Supabase, atualizando localmente:", error);
        const updated = allItems.map((x) =>
          x.id === id ? { ...x, answered_at: now, body: updatedBody, updated_at: now } : x,
        );
        setAllItems(updated);
        saveLocalItems(uid, updated);
        audio.play("achievement");
        toast.success("Marcada como respondida localmente! Glória a Deus. 🏆");
        return;
      }

      const updated = allItems.map((x) =>
        x.id === id ? { ...x, answered_at: now, body: updatedBody } : x,
      );
      setAllItems(updated);
      saveLocalItems(uid, updated);
      audio.play("achievement");
      toast.success("Marcada como respondida! Glória a Deus. 🏆");
    } catch (e) {
      const updated = allItems.map((x) =>
        x.id === id ? { ...x, answered_at: now, body: updatedBody, updated_at: now } : x,
      );
      setAllItems(updated);
      saveLocalItems(uid, updated);
      audio.play("achievement");
      toast.success("Marcada como respondida localmente! Glória a Deus. 🏆");
    }
  };

  const updatePurposeProgress = async (item: Prayer, newProg: number) => {
    if (!uid) return;
    const bodyObj = parseRecordBody(item.body);
    const updatedBody = JSON.stringify({
      ...bodyObj,
      progress: newProg,
    });
    const now = new Date().toISOString();

    if (useLocalFallback) {
      const updated = allItems.map((x) =>
        x.id === item.id ? { ...x, body: updatedBody, updated_at: now } : x,
      );
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success(`Progresso do propósito atualizado localmente para ${newProg}%! 🎯`);
      return;
    }

    try {
      const { error } = await supabase
        .from("prayers")
        .update({
          body: updatedBody,
        })
        .eq("id", item.id);

      if (error) {
        console.error("Erro ao atualizar progresso no Supabase, atualizando localmente:", error);
        const updated = allItems.map((x) =>
          x.id === item.id ? { ...x, body: updatedBody, updated_at: now } : x,
        );
        setAllItems(updated);
        saveLocalItems(uid, updated);
        toast.success(`Progresso do propósito atualizado localmente para ${newProg}%! 🎯`);
        return;
      }

      const updated = allItems.map((x) => (x.id === item.id ? { ...x, body: updatedBody } : x));
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success(`Progresso do propósito atualizado para ${newProg}%! 🎯`);
    } catch (e) {
      const updated = allItems.map((x) =>
        x.id === item.id ? { ...x, body: updatedBody, updated_at: now } : x,
      );
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success(`Progresso do propósito atualizado localmente para ${newProg}%! 🎯`);
    }
  };

  const remove = async (id: string) => {
    if (!uid) return;
    if (useLocalFallback) {
      const updated = allItems.filter((x) => x.id !== id);
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro removido localmente.");
      return;
    }

    try {
      const { error } = await supabase.from("prayers").delete().eq("id", id);
      if (error) {
        console.error("Erro ao deletar no Supabase, removendo localmente:", error);
        const updated = allItems.filter((x) => x.id !== id);
        setAllItems(updated);
        saveLocalItems(uid, updated);
        toast.success("Registro removido localmente.");
        return;
      }
      const updated = allItems.filter((x) => x.id !== id);
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro removido.");
    } catch (e) {
      const updated = allItems.filter((x) => x.id !== id);
      setAllItems(updated);
      saveLocalItems(uid, updated);
      toast.success("Registro removido localmente.");
    }
  };

  const getGroupedTimeline = () => {
    const groups: Record<string, Prayer[]> = {};
    const sorted = [...allItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    sorted.forEach((item) => {
      const date = new Date(item.created_at);
      const month = date.toLocaleDateString("pt-BR", { month: "long" });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      const key = `${capitalizedMonth} de ${date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  };

  const section = SECTIONS.find((s) => s.kind === tab)!;
  const filteredItems = allItems.filter((item) => item.kind === tab);
  const groupedTimeline = getGroupedTimeline();

  return (
    <AppShell>
      {/* Hero */}
      <div className="animate-fade-up mb-6 text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400/60 mb-1">
          Vida Espiritual
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">
          Sua jornada
          <br />
          com Deus.
        </h1>
        <p className="text-white/40 mt-2 text-sm max-w-sm">
          Um diário espiritual privado para registrar a fidelidade de Deus e seu crescimento
          cristão.
        </p>
      </div>

      {/* Privacy note */}
      <div
        className="mb-6 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-white/50 text-left"
        style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.05)" }}
      >
        <Lock className="w-4 h-4 text-emerald-400/80 shrink-0" />
        <span>Seus registros são 100% privados e salvos em segurança na sua conta pessoal.</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 max-h-[140px] sm:max-h-none overflow-y-auto pr-1">
        {SECTIONS.map((s) => {
          const active = tab === s.kind;
          const Icon = s.icon;

          let colorStyle = {
            tagBg: "oklch(1 0 0 / 0.04)",
            tagBorder: "oklch(1 0 0 / 0.08)",
            tagGlow: "oklch(1 0 0 / 0)",
            tagColor: "text-white/50",
          };

          if (active) {
            if (s.kind === "prayer")
              colorStyle = {
                tagBg: "oklch(0.65 0.22 355 / 0.12)",
                tagBorder: "oklch(0.65 0.22 355 / 0.25)",
                tagGlow: "oklch(0.65 0.22 355 / 0.2)",
                tagColor: "text-rose-300",
              };
            else if (s.kind === "devotional")
              colorStyle = {
                tagBg: "oklch(0.65 0.18 220 / 0.12)",
                tagBorder: "oklch(0.65 0.18 220 / 0.25)",
                tagGlow: "oklch(0.65 0.18 220 / 0.2)",
                tagColor: "text-sky-300",
              };
            else if (s.kind === "purpose")
              colorStyle = {
                tagBg: "oklch(0.6 0.2 280 / 0.12)",
                tagBorder: "oklch(0.6 0.2 280 / 0.25)",
                tagGlow: "oklch(0.6 0.2 280 / 0.2)",
                tagColor: "text-violet-300",
              };
            else if (s.kind === "fast")
              colorStyle = {
                tagBg: "oklch(0.65 0.2 40 / 0.12)",
                tagBorder: "oklch(0.65 0.2 40 / 0.25)",
                tagGlow: "oklch(0.65 0.2 40 / 0.2)",
                tagColor: "text-orange-300",
              };
            else if (s.kind === "gratitude")
              colorStyle = {
                tagBg: "oklch(0.62 0.22 15 / 0.12)",
                tagBorder: "oklch(0.62 0.22 15 / 0.25)",
                tagGlow: "oklch(0.62 0.22 15 / 0.2)",
                tagColor: "text-red-300",
              };
            else if (s.kind === "learning")
              colorStyle = {
                tagBg: "oklch(0.65 0.18 155 / 0.12)",
                tagBorder: "oklch(0.65 0.18 155 / 0.25)",
                tagGlow: "oklch(0.65 0.18 155 / 0.2)",
                tagColor: "text-emerald-300",
              };
            else if (s.kind === "favorite_verse")
              colorStyle = {
                tagBg: "oklch(0.75 0.18 80 / 0.12)",
                tagBorder: "oklch(0.75 0.18 80 / 0.25)",
                tagGlow: "oklch(0.75 0.18 80 / 0.2)",
                tagColor: "text-amber-300",
              };
            else
              colorStyle = {
                tagBg: "oklch(1 0 0 / 0.1)",
                tagBorder: "oklch(1 0 0 / 0.15)",
                tagGlow: "oklch(1 0 0 / 0.05)",
                tagColor: "text-white",
              };
          }

          return (
            <button
              key={s.kind}
              onClick={() => {
                setTab(s.kind);
                setAdding(false);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition-all active:scale-95 ${active ? "text-white" : "text-white/40 hover:text-white/70"}`}
              style={{
                background: colorStyle.tagBg,
                border: `1px solid ${colorStyle.tagBorder}`,
                boxShadow: colorStyle.tagGlow ? `0 4px 20px ${colorStyle.tagGlow}` : "none",
              }}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? colorStyle.tagColor : ""}`} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Main tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab !== "timeline" ? (
            // ── Standard list-form structure ──
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 text-left">
                <div>
                  <h2 className="font-display text-lg text-white font-medium flex items-center gap-2">
                    <span>{section.emoji}</span> {section.label}
                  </h2>
                  <p className="text-[10px] text-white/30 tracking-wider">
                    {filteredItems.length} registro{filteredItems.length !== 1 ? "s" : ""}{" "}
                    cadastrado{filteredItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setAdding((a) => !a)}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all active:scale-95"
                  style={{
                    background: "oklch(1 0 0 / 0.06)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                  }}
                >
                  <Plus className="w-4 h-4 text-white" /> Adicionar
                </button>
              </div>

              {/* Add form overlay */}
              <AnimatePresence>
                {adding && <AddForm kind={tab} onAdd={add} onClose={() => setAdding(false)} />}
              </AnimatePresence>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-white/30 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
                </div>
              ) : filteredItems.length === 0 ? (
                <div
                  className="rounded-3xl p-10 text-center"
                  style={{
                    background: "linear-gradient(145deg, oklch(1 0 0 / 0.02), transparent)",
                    border: "1px solid oklch(1 0 0 / 0.05)",
                  }}
                >
                  <p className="text-5xl mb-4">{section.emoji}</p>
                  <p className="text-xs text-white/40 mb-5">
                    Nenhum registro de {section.label.toLowerCase()} ainda.
                  </p>
                  <button
                    onClick={() => setAdding(true)}
                    className="text-xs rounded-full px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/15 transition-all font-semibold active:scale-95"
                    style={{ border: "1px solid oklch(1 0 0 / 0.1)" }}
                  >
                    + Registrar Primeiro
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredItems.map((item) => (
                    <RecordCard
                      key={item.id}
                      item={item}
                      onMarkAnswered={markAnswered}
                      onUpdatePurpose={updatePurposeProgress}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ── Timeline Tab ──
            <div className="space-y-8 text-left border-l border-white/5 pl-4 sm:pl-6 ml-3 relative">
              <div className="absolute top-0 bottom-0 left-3 w-px bg-gradient-to-b from-rose-500/20 via-violet-500/20 to-transparent pointer-events-none -ml-px" />

              {loading ? (
                <div className="flex items-center justify-center py-20 text-white/30 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
                </div>
              ) : allItems.length === 0 ? (
                <div className="rounded-3xl p-10 text-center border border-white/5 bg-white/1">
                  <p className="text-5xl mb-4">📅</p>
                  <p className="text-xs text-white/40">
                    Sua linha do tempo aparecerá vazia até você registrar suas primeiras orações,
                    devocionais ou propósitos.
                  </p>
                </div>
              ) : (
                Object.entries(groupedTimeline).map(([monthYear, groupItems]) => (
                  <div key={monthYear} className="space-y-4 relative">
                    {/* Time Marker Pin */}
                    <div className="flex items-center gap-2 -ml-[25px] sm:-ml-[33px] bg-[#0d0b1e] pr-4 py-1 z-10 relative">
                      <div className="w-4 h-4 rounded-full bg-[#0d0b1e] border-2 border-rose-500/50 flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      </div>
                      <h3 className="font-display text-sm font-bold text-white/90">{monthYear}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {groupItems.map((item) => (
                        <div key={item.id} className="relative group">
                          {/* Inner connector dot */}
                          <div className="absolute -left-[27px] sm:-left-[35px] top-6 w-2.5 h-2.5 rounded-full bg-violet-400/40 border border-violet-400/20 group-hover:scale-125 transition-transform" />
                          <RecordCard
                            item={item}
                            onMarkAnswered={markAnswered}
                            onUpdatePurpose={updatePurposeProgress}
                            onDelete={remove}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
