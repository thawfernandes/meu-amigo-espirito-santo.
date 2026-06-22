import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { BIBLE_BOOKS, SAMPLE_CHAPTER, getBook } from "@/lib/bible-data";
import {
  BookOpen, ChevronLeft, ChevronRight, Minus, Plus,
  X, StickyNote, Check, Search, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/biblia")({ component: Bible });

type HighlightColor = "green" | "yellow" | "red";
interface Highlight { verse: number; color: HighlightColor }
interface VerseNote  { verse: number; content: string }

const COLORS: Record<HighlightColor, { dot: string; bg: string; label: string }> = {
  yellow: { dot: "bg-amber-400",  bg: "bg-amber-400/15 ring-1 ring-amber-400/30", label: "Ouro"    },
  green:  { dot: "bg-emerald-400",bg: "bg-emerald-400/15 ring-1 ring-emerald-400/30", label: "Verde" },
  red:    { dot: "bg-rose-400",   bg: "bg-rose-400/15 ring-1 ring-rose-400/30",   label: "Rosa"    },
};

function useHighlights(uid: string|null, ver: string, book: string, ch: number) {
  const [data, setData] = useState<Highlight[]>([]);
  useEffect(() => {
    if (!uid) return;
    supabase.from("highlights").select("verse,color")
      .eq("user_id",uid).eq("version",ver).eq("book",book).eq("chapter",ch)
      .then(({ data: d }) => { if (d) setData(d as Highlight[]); });
  }, [uid, ver, book, ch]);
  const toggle = useCallback(async (verse: number, color: HighlightColor) => {
    if (!uid) return;
    const ex = data.find(h => h.verse === verse);
    if (ex?.color === color) {
      await supabase.from("highlights").delete()
        .eq("user_id",uid).eq("version",ver).eq("book",book).eq("chapter",ch).eq("verse",verse);
      setData(d => d.filter(x => x.verse !== verse));
    } else {
      await supabase.from("highlights").upsert({ user_id:uid, version:ver, book, chapter:ch, verse, color });
      setData(d => [...d.filter(x => x.verse !== verse), { verse, color }]);
    }
  }, [uid, ver, book, ch, data]);
  return { data, toggle };
}

function useNotes(uid: string|null, ver: string, book: string, ch: number) {
  const [data, setData] = useState<VerseNote[]>([]);
  useEffect(() => {
    if (!uid) return;
    supabase.from("verse_notes").select("verse,content")
      .eq("user_id",uid).eq("version",ver).eq("book",book).eq("chapter",ch)
      .then(({ data: d }) => { if (d) setData(d as VerseNote[]); });
  }, [uid, ver, book, ch]);
  const save = useCallback(async (verse: number, content: string) => {
    if (!uid) return;
    if (!content.trim()) {
      await supabase.from("verse_notes").delete()
        .eq("user_id",uid).eq("version",ver).eq("book",book).eq("chapter",ch).eq("verse",verse);
      setData(d => d.filter(x => x.verse !== verse));
      return;
    }
    await supabase.from("verse_notes").upsert({ user_id:uid, version:ver, book, chapter:ch, verse, content });
    setData(d => [...d.filter(x => x.verse !== verse), { verse, content }]);
    toast.success("Anotação salva!");
  }, [uid, ver, book, ch]);
  return { data, save };
}

export default function Bible() {
  const [uid, setUid]       = useState<string|null>(null);
  const [abbr, setAbbr]     = useState("jo");
  const [ch, setCh]         = useState(1);
  const ver = "NVI";
  const [fs, setFs]         = useState(() => Number(localStorage.getItem("bible.font") || 18));
  const [showBooks, setShowBooks] = useState(false);
  const [showChs,  setShowChs]  = useState(false);
  const [bookQ, setBookQ]   = useState("");
  const [selVerse, setSelVerse] = useState<number|null>(null);
  const [noteVerse, setNoteVerse] = useState<number|null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const book = getBook(abbr)!;
  const { data: hl, toggle: toggleHL } = useHighlights(uid, ver, book.name, ch);
  const { data: notes, save: saveNote } = useNotes(uid, ver, book.name, ch);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      supabase.from("reading_progress").upsert({ user_id: data.user.id, version: ver, book: book.name, chapter: ch, verse: 1 });
    });
  }, [abbr, ch]);
  useEffect(() => { localStorage.setItem("bible.font", String(fs)); }, [fs]);

  const verses = SAMPLE_CHAPTER;
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

  return (
    <AppShell>
      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setShowBooks(true); setBookQ(""); setShowChs(false); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-125"
            style={{ background: "oklch(0.55 0.18 85 / 0.2)", border: "1px solid oklch(0.55 0.18 85 / 0.35)" }}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span className="text-amber-200">{book.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          <button
            onClick={() => { setShowChs(v => !v); setShowBooks(false); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white/80 transition-all hover:text-white"
            style={{ background: "oklch(1 0 0 / 0.07)", border: "1px solid oklch(1 0 0 / 0.12)" }}
          >
            Cap. {ch} <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          <span
            className="text-[11px] rounded-full px-2.5 py-1 font-mono text-white/50"
            style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.08)" }}
          >
            {ver}
          </span>
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
        onClick={() => { setSelVerse(null); setShowChs(false); }}
      >
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400/60 mb-1">{ver}</p>
          <h1 className="font-display text-3xl sm:text-4xl">
            <span className="text-amber-300">{book.name}</span>{" "}
            <span className="text-white/40 font-normal">{ch}</span>
          </h1>
        </div>

        {/* Verses */}
        <article className="leading-[1.9] space-y-3" style={{ fontSize: fs }}>
          {Object.entries(verses).map(([vn, text]) => {
            const v = Number(vn);
            const h = hl.find(x => x.verse === v);
            const hasNote = notes.some(n => n.verse === v);
            const isSel = selVerse === v;
            return (
              <p
                key={v}
                onClick={e => { e.stopPropagation(); setSelVerse(isSel ? null : v); setShowChs(false); }}
                className={`group relative cursor-pointer rounded-xl px-3 py-2 -mx-3 transition-all text-white/80 ${
                  h ? COLORS[h.color].bg : "hover:bg-white/5"
                } ${isSel ? "ring-1 ring-blue-400/40 bg-blue-400/5" : ""}`}
              >
                <sup className="text-amber-400/70 mr-2 text-[0.68em] font-bold">{v}</sup>
                {text}
                {hasNote && <span className="inline-block ml-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 align-middle" />}
              </p>
            );
          })}
        </article>

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
              {(["yellow","green","red"] as HighlightColor[]).map(c => (
                <button
                  key={c}
                  onClick={() => toggleHL(selVerse, c)}
                  title={COLORS[c].label}
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
              className="fixed inset-x-4 bottom-4 top-20 z-50 rounded-3xl p-5 flex flex-col max-w-md mx-auto"
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
              onClick={() => setNoteVerse(null)} />
            <motion.div
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 max-w-md mx-auto"
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
                <button onClick={() => setNoteVerse(null)} className="p-1.5 rounded-full hover:bg-white/10 text-white/30">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                autoFocus value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                placeholder="Sua reflexão, insight ou observação..."
                rows={5}
                className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none text-white placeholder:text-white/30 focus:ring-2 focus:ring-violet-500/30 transition-all"
                style={{ background:"oklch(1 0 0 / 0.07)", border:"1px solid oklch(1 0 0 / 0.12)" }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setNoteVerse(null)} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">Cancelar</button>
                <button
                  onClick={async () => { await saveNote(noteVerse, noteDraft); setNoteVerse(null); }}
                  className="rounded-xl px-4 py-2 text-sm text-white flex items-center gap-1.5 font-medium transition-all"
                  style={{ background:"linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))", boxShadow:"0 4px 20px oklch(0.58 0.2 280 / 0.4)" }}
                >
                  <Check className="w-3.5 h-3.5" /> Salvar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
