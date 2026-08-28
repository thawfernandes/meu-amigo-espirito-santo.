import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { LowPolyWorld } from "@/components/world/LowPolyWorld";
import { MagicButton } from "@/components/ui/MagicButton";
import { useAudio } from "@/components/audio/AudioProvider";
import { TranslationProgressModal } from "@/components/translation/TranslationProgressModal";
import { Sparkles, Construction, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amigo, Espírito Santo — Caminhando com Deus um dia de cada vez" },
      {
        name: "description",
        content:
          "Uma jornada cristã viva: leitura, oração, estudos e desafios em um pequeno mundo acolhedor.",
      },
      { property: "og:title", content: "Amigo, Espírito Santo" },
      { property: "og:description", content: "Caminhando com Deus um dia de cada vez." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const audio = useAudio();
  const [showProgressModal, setShowProgressModal] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1340] text-white">
      {/* Fundo 3D ou gradiente */}
      <LowPolyWorld />

      {/* Vignette suave */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(15,5,35,.7) 100%)",
        }}
      />

      {/* Layout principal — flex column centralizado */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-between px-4 sm:px-6 py-6 sm:py-10 text-center pointer-events-none">
        
        {/* Topo — Banner de Aviso de Construção & Progresso */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl pointer-events-auto"
        >
          <button
            onClick={() => {
              audio.play("pop");
              setShowProgressModal(true);
            }}
            className="w-full group rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            style={{
              background: "oklch(0.16 0.04 270 / 0.85)",
              backdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid oklch(0.65 0.18 280 / 0.35)",
              boxShadow: "0 12px 36px oklch(0 0 0 / 0.4), 0 0 20px oklch(0.65 0.18 280 / 0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                <Construction className="w-4 h-4 animate-bounce" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                    Em Construção Ativa
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-300 font-semibold hidden sm:inline">
                    Tradução Autônoma
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">
                  Clique para <strong>acompanhar todo o progresso</strong> dos 1.189 capítulos e estudos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-500/30 group-hover:bg-violet-500/45 text-violet-200 border border-violet-400/30 text-xs font-bold shrink-0 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Progresso</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </motion.div>

        {/* Centro — título */}
        <div className="flex flex-col items-center gap-3 my-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-amber-100/70"
          >
            Uma jornada começa agora
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-serif leading-[0.95] pointer-events-none"
            style={{
              fontSize: "clamp(2.8rem, 9vw, 6rem)",
              textShadow: "0 4px 30px rgba(0,0,0,.5), 0 0 80px rgba(255,180,120,.3)",
            }}
          >
            Amigo,
            <br />
            <span className="bg-gradient-to-br from-amber-200 via-rose-200 to-violet-300 bg-clip-text text-transparent">
              Espírito Santo
            </span>
          </motion.h1>
        </div>

        {/* Base — botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pointer-events-auto"
        >
          <MagicButton
            onClick={() => {
              audio.play("swoosh");
              navigate({ to: "/quiz" });
            }}
            className="w-full sm:w-auto"
          >
            ✨ Começar Jornada
          </MagicButton>

          <MagicButton
            variant="ghost"
            onClick={() => navigate({ to: "/auth" })}
            className="w-full sm:w-auto"
          >
            Já tenho conta
          </MagicButton>
        </motion.div>
      </div>

      {/* Modal de Acompanhamento do Progresso */}
      <TranslationProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />
    </div>
  );
}
