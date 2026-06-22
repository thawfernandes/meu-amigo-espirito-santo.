import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

const TITLE_TOP = "Amigo,";
const TITLE_BOTTOM = "Espírito Santo";

function Landing() {
  const navigate = useNavigate();
  const audio = useAudio();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1340] text-white">
      <LowPolyWorld />

      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(20,8,40,.55) 100%)" }} />

      {/* Top brand */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 pointer-events-none"
      >
        <span className="relative inline-block w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_20px_8px_rgba(255,200,120,.6)] animate-pulse" />
        <span className="text-sm tracking-widest uppercase opacity-80">Amigo · ES</span>
      </motion.div>

      {/* Hero */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[10px] sm:text-xs md:text-sm tracking-[0.4em] uppercase text-amber-100/80 mb-3 sm:mb-5"
        >
          Uma jornada começa agora
        </motion.p>

        <h1 className="font-serif leading-[0.95] text-[12vw] sm:text-[8vw] md:text-[6.5rem] max-h-[40vh]" style={{ textShadow: "0 4px 30px rgba(0,0,0,.4), 0 0 60px rgba(255,180,120,.25)" }}>
          <CinematicLine text={TITLE_TOP} delay={0.5} />
          <br />
          <CinematicLine text={TITLE_BOTTOM} delay={0.9} gradient />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-4 sm:mt-6 max-w-md text-sm sm:text-base md:text-lg text-amber-50/85 hidden sm:block"
        >
          Um pequeno mundo vivo para caminhar com Deus — um dia, uma oração, um passo de cada vez.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
          transition={{ delay: 1.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-3 pointer-events-auto"
        >
          <MagicButton onClick={() => { audio.play("swoosh"); navigate({ to: "/auth", search: { mode: "signup" } as never }); }}>
            ✨ Começar Jornada
          </MagicButton>
          <MagicButton variant="ghost" onClick={() => navigate({ to: "/auth" })}>
            Já tenho conta
          </MagicButton>
        </motion.div>
      </div>

      {/* Scroll indicator — outside hero column so it never overlaps buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 0.6 : 0 }}
        transition={{ delay: 2.2, duration: 1.2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-amber-100/60 pointer-events-none"
      >
        <span>explore o mundo</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>↓</motion.span>
      </motion.div>
    </div>
  );
}

function CinematicLine({ text, delay, gradient }: { text: string; delay: number; gradient?: boolean }) {
  return (
    <span className="inline-block">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={"inline-block " + (gradient ? "bg-gradient-to-br from-amber-200 via-rose-200 to-violet-300 bg-clip-text text-transparent" : "")}
          style={gradient ? { WebkitTextStroke: "0px transparent" } : undefined}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}
