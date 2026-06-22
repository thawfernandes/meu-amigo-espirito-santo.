import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LowPolyWorld } from "@/components/world/LowPolyWorld";
import { MagicButton } from "@/components/ui/MagicButton";
import { useAudio } from "@/components/audio/AudioProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amigo, Espírito Santo — Caminhando com Deus um dia de cada vez" },
      { name: "description", content: "Uma jornada cristã viva: leitura, oração, estudos e desafios em um pequeno mundo acolhedor." },
      { property: "og:title", content: "Amigo, Espírito Santo" },
      { property: "og:description", content: "Caminhando com Deus um dia de cada vez." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const audio = useAudio();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1340] text-white">
      {/* Fundo 3D ou gradiente */}
      <LowPolyWorld />

      {/* Vignette suave */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(15,5,35,.7) 100%)" }}
      />

      {/* Layout principal — flex column centralizado */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-between px-6 py-10 sm:py-14 text-center">

        {/* Topo — espaço vazio ou branding mínimo */}
        <div />

        {/* Centro — título */}
        <div className="flex flex-col items-center gap-3">
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
              fontSize: "clamp(2.8rem, 10vw, 6.5rem)",
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

        {/* Base — botões SEMPRE visíveis, sem delay */}
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
    </div>
  );
}
