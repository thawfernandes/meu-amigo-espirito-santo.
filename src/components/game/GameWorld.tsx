import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Settings, LogOut, BookOpen, GraduationCap, HeartHandshake, Target, Telescope as TelescopeIcon, Users } from "lucide-react";
import { Mascot, Mood } from "./Mascot";
import { useAudio } from "@/components/audio/AudioProvider";

type TimeOfDay = "dawn" | "day" | "dusk" | "night";

function getTimeOfDay(h: number): TimeOfDay {
  if (h < 6) return "night";
  if (h < 9) return "dawn";
  if (h < 17) return "day";
  if (h < 20) return "dusk";
  return "night";
}

interface Props {
  userName: string;
  percent: number;
  streak: number;
  onLogout: () => void;
  levelInfo?: {
    level: number;
    levelName: string;
    currentLevelXp: number;
    nextLevelXp: number;
    pct: number;
    xpNeeded: number;
    totalXp: number;
  };
  lastActiveDate?: string;
}

export function GameWorld({ userName, percent, streak, onLogout, levelInfo, lastActiveDate }: Props) {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const tod = getTimeOfDay(hour);
  const isNight = tod === "night";

  // Determine Chibi Jesus initial mood dynamically based on inactivity and progress
  const initialMood = useMemo<Mood>(() => {
    // Late night sleeping
    if (hour >= 23 || hour < 6) return "sleep";
    
    if (!lastActiveDate) return "happy";
    const createdDate = new Date(lastActiveDate);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const inactiveDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (inactiveDays >= 7) return "sleep";
    if (inactiveDays >= 3) return "sleepy";
    if (streak === 0 && inactiveDays >= 1) return "sad";
    
    // Progress inside current level
    if (percent < 15) return "crying";
    if (percent < 40) return "sad";
    
    if (streak >= 5) return "excited";
    if (streak >= 3) return "very_happy";
    
    return "happy";
  }, [streak, percent, lastActiveDate, hour]);

  // Determine Chibi Jesus speech bubble contextually
  const initialSpeech = useMemo(() => {
    if (!lastActiveDate) return `Olá, ${userName}! Que bom te ver.`;
    const createdDate = new Date(lastActiveDate);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const inactiveDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (inactiveDays >= 7) {
      return "Estava dormindo... Que bom te ver! Senti saudade da nossa leitura. 💤";
    }
    if (inactiveDays >= 3) {
      return "Estou com saudade da nossa leitura... Que tal lermos um capítulo hoje? 😴";
    }
    if (streak === 0 && inactiveDays >= 1) {
      return "Vamos retomar nossa caminhada? Um pequeno passo já faz diferença. 🌱";
    }
    if (streak >= 5) {
      return `Que alegria caminhar com você! ${streak} dias consecutivos! 🔥😄`;
    }
    if (isNight) {
      return `Boa noite, ${userName}! Que tal um momento com Deus antes de descansar? 🙏`;
    }
    return `Que bom te ver novamente! Vamos continuar nossa jornada? 📖`;
  }, [userName, streak, lastActiveDate, isNight]);

  const [mascotMood, setMascotMood] = useState<Mood>(initialMood);
  const [bubble, setBubble] = useState<string | null>(initialSpeech);
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([]);
  const [cloudSpeed, setCloudSpeed] = useState(1);
  const audio = useAudio();

  const modules = useMemo(() => [
    {
      id: "biblia",
      label: "Bíblia",
      icon: BookOpen,
      color: "text-amber-400",
      onClick: () => go("/biblia", "Vamos ler juntos!", "read"),
      emoji: "📖"
    },
    {
      id: "estudos",
      label: "Estudos",
      icon: GraduationCap,
      color: "text-violet-400",
      onClick: () => go("/estudos", "Estudar edifica o espírito. 📖", "think"),
      emoji: "📚"
    },
    {
      id: "vida",
      label: "Vida Espiritual",
      icon: HeartHandshake,
      color: "text-rose-400",
      onClick: () => go("/vida", "A oração move o céu! 🙏", "pray"),
      emoji: "🌱"
    },
    {
      id: "desafios",
      label: "Desafios Mensais",
      icon: Target,
      color: "text-emerald-400",
      onClick: () => go("/desafios", "Vamos aceitar um desafio? 💪"),
      emoji: "🌍"
    },
    {
      id: "estatisticas",
      label: "Estatísticas",
      icon: TelescopeIcon,
      color: "text-indigo-400",
      onClick: () => go("/estatisticas", "Olha como você cresceu! 🌟"),
      emoji: "📊"
    },
    {
      id: "ajustes",
      label: "Ajustes",
      icon: Settings,
      color: "text-slate-400",
      onClick: () => navigate({ to: "/configuracoes" }),
      emoji: "⚙️"
    }
  ], [navigate]);

  // Set audio context to dashboard on mount
  useEffect(() => {
    audio.setContext("dashboard");
  }, []);

  // Sync mascot mood with audio context
  useEffect(() => {
    audio.setMood(mascotMood);
  }, [mascotMood]);

  // Play level-up sound if level increases
  const prevLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (levelInfo) {
      if (prevLevelRef.current !== null && levelInfo.level > prevLevelRef.current) {
        audio.play("levelup");
      }
      prevLevelRef.current = levelInfo.level;
    }
  }, [levelInfo?.level, audio]);


  // Auto-dismiss initial speech bubble
  useEffect(() => {
    const t = setTimeout(() => setBubble(null), 5000);
    return () => clearTimeout(t);
  }, []);

  // Sky gradient by time of day
  const sky = useMemo(() => {
    switch (tod) {
      case "dawn":
        return "linear-gradient(180deg,#fed7aa 0%,#fcd5a5 30%,#fde68a 55%,#bae6fd 100%)";
      case "day":
        return "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 50%,#e0f2fe 100%)";
      case "dusk":
        return "linear-gradient(180deg,#1e3a8a 0%,#7c3aed 40%,#f97316 75%,#fcd34d 100%)";
      case "night":
      default:
        return "linear-gradient(180deg,#020617 0%,#0f172a 45%,#1e1b4b 80%,#312e81 100%)";
    }
  }, [tod]);

  const addStars = (x: number, y: number, count = 8) => {
    const newOnes = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
    }));
    setStars((s) => [...s, ...newOnes]);
    setTimeout(() => {
      setStars((s) => s.filter((st) => !newOnes.find((n) => n.id === st.id)));
    }, 1400);
  };

  function celebrate(text: string, customMood: Mood = "celebrate") {
    setMascotMood(customMood);
    setBubble(text);
    setTimeout(() => {
      setMascotMood(initialMood);
      setBubble(null);
    }, 3500);
  }

  function go(to: string, text: string, mood: Mood = "happy") {
    setMascotMood(mood);
    setBubble(text);
    setTimeout(() => navigate({ to }), 650);
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden animate-fade-in"
      style={{ background: sky, transition: "background 1.2s ease" }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ── Outer Scenery background (shared across all devices) ── */}
      {/* Sun / Moon */}
      <div
        className="absolute"
        style={{
          left: "78%",
          top: isNight ? "10%" : "12%",
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: isNight
            ? "radial-gradient(circle at 35% 35%,#f8fafc,#cbd5e1 60%,#94a3b8)"
            : "radial-gradient(circle at 35% 35%,#fff7c0,#fde047 55%,#f59e0b)",
          boxShadow: isNight
            ? "0 0 60px 10px rgba(226,232,240,.35)"
            : "0 0 80px 20px rgba(253, 224, 71, .55)",
          animation: "sun-float 14s ease-in-out infinite",
        }}
      />

      {/* Stars at night */}
      {isNight &&
        Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 31) % 55}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: "#fff",
              opacity: 0.4 + ((i * 7) % 60) / 100,
              animation: `twinkle ${2 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.3}s`,
            }}
          />
        ))}

      {/* Clouds */}
      {[
        { top: "15%", scale: 1, delay: 0, dur: 60 },
        { top: "25%", scale: 0.7, delay: -20, dur: 75 },
        { top: "9%", scale: 1.2, delay: -40, dur: 90 },
        { top: "32%", scale: 0.85, delay: -10, dur: 70 },
      ].map((c, i) => (
        <Cloud
          key={i}
          top={c.top}
          scale={c.scale}
          delay={c.delay}
          duration={c.dur / cloudSpeed}
          onClick={() => setCloudSpeed((s) => (s > 2.5 ? 1 : s + 0.5))}
          dark={isNight}
        />
      ))}

      {/* Birds (day only) */}
      {!isNight &&
        [0, 1].map((i) => (
          <Bird key={i} delay={i * 18} top={20 + i * 8} />
        ))}

      {/* Floating leaves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Leaf key={i} delay={i * 6} left={(i * 23) % 90} />
      ))}

      {/* Light particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${(i * 37) % 100}%`,
            bottom: `${10 + (i % 7) * 8}%`,
            width: 4,
            height: 4,
            background: isNight
              ? "radial-gradient(circle,#fef08a,transparent 70%)"
              : "radial-gradient(circle,#fff7cc,transparent 70%)",
            opacity: 0.7,
            animation: `firefly ${6 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            filter: isNight ? "drop-shadow(0 0 6px #fde047)" : "none",
          }}
        />
      ))}

      {/* Ground / hills */}
      <Ground night={isNight} />

      {/* Background tree for scenery */}
      <Tree x={12} y={70} onClick={() => {}} />

      {/* ── HUD / TOP BAR (Sua Caminhada Cristã) ── */}
      {/* Desktop Top Bar */}
      <div className="hidden md:block">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-full text-sm font-display backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,.22)",
              color: isNight ? "#f8fafc" : "#0f172a",
              border: "1px solid rgba(255,255,255,.4)",
            }}
          >
            ✦ Amigo, Espírito Santo
          </Link>
        </div>
        <EnergyBar streak={streak} night={isNight} levelInfo={levelInfo} />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-4 left-0 right-0 px-4 z-40 flex flex-col items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <span className="px-4 py-1.5 rounded-full text-xs font-display backdrop-blur-md bg-white/20 border border-white/30 text-white inline-block">
            ✦ Amigo, Espírito Santo
          </span>
        </div>
        <div className="pointer-events-auto w-full max-w-sm">
          <MobileEnergyBar streak={streak} levelInfo={levelInfo} />
        </div>
      </div>

      {/* ── CENTER SECTION (Mascot Chibi Jesus fixed on the Cloud) ── */}
      <div className="absolute top-[60%] md:top-[63%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="animate-float-slow flex flex-col items-center pointer-events-none">
          {/* Mascot Container */}
          <div className="relative w-36 h-36 flex items-center justify-center pointer-events-auto">
            <Mascot
              mood={mascotMood}
              x={50}
              y={50}
              scale={1.3}
              message={bubble}
              onClick={() => {
                setMascotMood("wave");
                setBubble("Paz seja convosco! 👋");
                setTimeout(() => {
                  setMascotMood(initialMood);
                  setBubble(null);
                }, 2200);
              }}
            />
          </div>
          
          {/* Fixed Cloud Base under Mascot */}
          <div className="w-[300px] h-[100px] -mt-6 pointer-events-none relative z-10 flex items-center justify-center opacity-95">
            <div className="absolute w-[220px] h-[35px] rounded-full bg-white/25 blur-xl animate-pulse" />
            <svg width="260" height="90" viewBox="0 0 260 90">
              <defs>
                <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <g fill="url(#cloudGrad)">
                <circle cx="70" cy="50" r="30" opacity="0.95" />
                <circle cx="190" cy="50" r="30" opacity="0.95" />
                <circle cx="100" cy="45" r="35" />
                <circle cx="160" cy="45" r="35" />
                <circle cx="130" cy="38" r="38" />
                <rect x="70" y="45" width="120" height="30" rx="15" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DOCK (Unified Symmetric Row of 7 Modules) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-30 pointer-events-auto">
        <div
          className="flex flex-row items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar py-4 px-4 rounded-3xl border shadow-2xl"
          style={{
            background: "oklch(0.14 0.03 260 / 0.75)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            backdropFilter: "blur(24px)",
            scrollbarWidth: "none",
          }}
        >
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={m.onClick}
                className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center gap-1 md:gap-2 transition-all duration-300 hover:-translate-y-2 active:scale-95 group relative"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {/* Glow overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-md bg-white" />

                {/* Icon */}
                <Icon className={`w-6 h-6 md:w-8 md:h-8 ${m.color} transition-transform duration-300 group-hover:scale-110`} />

                {/* Label */}
                <span className="font-display text-[10px] md:text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                  {m.label}
                </span>
                
                {/* Tiny dot */}
                <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* HUD — Logout Button (bottom left) */}
      <div className="absolute bottom-5 left-5 z-40">
        <button
          onClick={onLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md hover:scale-110 transition-all border border-white/20 shadow-lg"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            color: "#f8fafc",
          }}
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4 text-white/70 hover:text-white" />
        </button>
      </div>



      {/* Expose celebrate fn via window for child interactions */}
      <span
        ref={(el) => {
          if (el) (window as any).__lumiCelebrate = celebrate;
        }}
      />
    </div>
  );
}

function MobileEnergyBar({
  streak,
  levelInfo,
}: {
  streak: number;
  levelInfo?: {
    level: number;
    levelName: string;
    currentLevelXp: number;
    nextLevelXp: number;
    pct: number;
    xpNeeded: number;
    totalXp: number;
  };
}) {
  const info = levelInfo || {
    level: 1,
    levelName: "Semeando a Palavra",
    currentLevelXp: 0,
    nextLevelXp: 100,
    pct: 0,
    xpNeeded: 100,
    totalXp: 0
  };
  
  const p = Math.max(0, Math.min(100, info.pct));

  return (
    <div
      className="w-full px-4 py-3 rounded-2xl backdrop-blur-md text-left"
      style={{
        background: "rgba(255,255,255,.16)",
        border: "1px solid rgba(255,255,255,.25)",
        color: "#f8fafc",
      }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-90">
        <span>🌱 Nív. {info.level} — {info.levelName}</span>
        <span>🔥 {streak}d</span>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 h-2.5 rounded-full overflow-hidden relative" style={{ background: "rgba(0,0,0,.22)" }}>
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${p}%`,
            background: "linear-gradient(90deg,#fde047,#22c55e 50%,#38bdf8)",
            boxShadow: "0 0 12px 1px rgba(253,224,71,.5)",
            transition: "width 1s ease-out",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.4s linear infinite",
            }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-white/50 mt-1 font-medium">
        <span>{info.currentLevelXp} / {info.nextLevelXp} XP</span>
        {info.xpNeeded > 0 ? (
          <span>Falta {info.xpNeeded} XP</span>
        ) : (
          <span>Nível máximo</span>
        )}
      </div>
    </div>
  );
}

/* -------- Scene primitives -------- */

function Cloud({
  top,
  scale,
  delay,
  duration,
  onClick,
  dark,
}: {
  top: string;
  scale: number;
  delay: number;
  duration: number;
  onClick?: () => void;
  dark?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{
        top,
        left: "-15%",
        transform: `scale(${scale})`,
        animation: `cloud-drift ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg width="180" height="80" viewBox="0 0 180 80">
        <g fill={dark ? "rgba(226,232,240,.55)" : "rgba(255,255,255,.92)"}>
          <ellipse cx="50" cy="50" rx="35" ry="22" />
          <ellipse cx="85" cy="42" rx="32" ry="26" />
          <ellipse cx="120" cy="50" rx="30" ry="20" />
          <ellipse cx="75" cy="58" rx="40" ry="18" />
        </g>
      </svg>
    </div>
  );
}

function Bird({ delay, top }: { delay: number; top: number }) {
  const [flying, setFlying] = useState(true);
  return (
    <div
      onClick={() => {
        setFlying(false);
        setTimeout(() => setFlying(true), 100);
      }}
      className="absolute cursor-pointer z-10"
      style={{
        top: `${top}%`,
        left: "-5%",
        animation: flying ? `bird-fly 35s linear infinite` : "none",
        animationDelay: `${delay}s`,
      }}
    >
      <svg width="34" height="20" viewBox="0 0 34 20">
        <path
          d="M2 12 Q9 4 17 12 Q25 4 32 12"
          stroke="#1f2937"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          style={{ animation: "wing-flap 0.4s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}

function Leaf({ delay, left }: { delay: number; left: number }) {
  return (
    <span
      className="absolute pointer-events-none"
      style={{
        top: -20,
        left: `${left}%`,
        fontSize: 18,
        animation: `leaf-fall ${14 + (delay % 7)}s linear infinite`,
        animationDelay: `${delay}s`,
        color: "#84cc16",
      }}
    >
      🍃
    </span>
  );
}

function Ground({ night }: { night?: boolean }) {
  return (
    <>
      {/* far hills */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        height="280"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="hillFar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={night ? "#1e3a5f" : "#86efac"} />
            <stop offset="100%" stopColor={night ? "#0f172a" : "#4ade80"} />
          </linearGradient>
          <linearGradient id="hillNear" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={night ? "#14532d" : "#65a30d"} />
            <stop offset="100%" stopColor={night ? "#052e16" : "#3f6212"} />
          </linearGradient>
        </defs>
        <path
          d="M0 160 C 200 100, 400 180, 720 130 C 1040 80, 1240 180, 1440 140 L 1440 280 L 0 280 Z"
          fill="url(#hillFar)"
        />
        <path
          d="M0 200 C 240 150, 520 230, 820 190 C 1100 150, 1280 220, 1440 200 L 1440 280 L 0 280 Z"
          fill="url(#hillNear)"
        />
      </svg>
    </>
  );
}

function Tree({ x, y, onClick }: { x: number; y: number; onClick?: () => void }) {
  const [shaking, setShaking] = useState(false);
  const [fallingLeaves, setFallingLeaves] = useState<number[]>([]);
  return (
    <div
      className="absolute z-10 cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={() => {
        setShaking(true);
        const ids = Array.from({ length: 6 }).map((_, i) => Date.now() + i);
        setFallingLeaves((f) => [...f, ...ids]);
        setTimeout(() => setShaking(false), 600);
        setTimeout(
          () => setFallingLeaves((f) => f.filter((id) => !ids.includes(id))),
          2500,
        );
        onClick?.();
      }}
    >
      <div
        style={{
          animation: shaking ? "shake .6s ease-in-out" : "sway 5s ease-in-out infinite",
          transformOrigin: "bottom center",
        }}
      >
        <svg width="140" height="180" viewBox="0 0 140 180">
          <rect x="62" y="100" width="16" height="70" rx="4" fill="#78350f" />
          <circle cx="70" cy="70" r="55" fill="#22c55e" />
          <circle cx="40" cy="80" r="32" fill="#16a34a" />
          <circle cx="100" cy="80" r="32" fill="#16a34a" />
          <circle cx="70" cy="40" r="28" fill="#4ade80" />
        </svg>
      </div>
      {fallingLeaves.map((id, i) => (
        <span
          key={id}
          className="absolute pointer-events-none"
          style={{
            top: 60,
            left: 50 + i * 8,
            fontSize: 14,
            color: "#84cc16",
            animation: "leaf-fall 2.4s linear forwards",
          }}
        >
          🍃
        </span>
      ))}
    </div>
  );
}

/* -------- Hotspot wrapper -------- */

function Hotspot({
  x,
  y,
  label,
  sub,
  onClick,
  children,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="absolute z-20 cursor-pointer animate-fade-in"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          transition: "transform .25s cubic-bezier(.2,.9,.3,1.3)",
          transform: hover ? "translateY(-6px) scale(1.06)" : "none",
          filter: hover
            ? "drop-shadow(0 12px 18px rgba(250,204,21,.55))"
            : "drop-shadow(0 6px 8px rgba(0,0,0,.25))",
        }}
      >
        {children}
      </div>
      {hover && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-12 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs animate-fade-up"
          style={{
            background: "rgba(255,255,255,.95)",
            color: "#0f172a",
            boxShadow: "0 8px 24px -10px rgba(0,0,0,.4)",
          }}
        >
          <div className="font-display text-sm">{label}</div>
          <div className="text-[10px] text-slate-500">{sub}</div>
        </div>
      )}
    </div>
  );
}

/* -------- Scene props -------- */

function BibleOnTable() {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90">
      <rect x="10" y="55" width="90" height="10" rx="2" fill="#92400e" />
      <rect x="18" y="65" width="6" height="22" fill="#78350f" />
      <rect x="86" y="65" width="6" height="22" fill="#78350f" />
      <rect x="32" y="34" width="46" height="24" rx="3" fill="#7f1d1d" stroke="#450a0a" />
      <line x1="55" y1="34" x2="55" y2="58" stroke="#450a0a" strokeWidth="1" />
      <path d="M52 40 h6 v8 h-6 z" fill="#fde047" />
      <line x1="55" y1="38" x2="55" y2="50" stroke="#92400e" strokeWidth="1.5" />
      <line x1="51" y1="42" x2="59" y2="42" stroke="#92400e" strokeWidth="1.5" />
    </svg>
  );
}

function PrayerBench() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90">
      <rect x="10" y="40" width="80" height="10" rx="2" fill="#a16207" />
      <rect x="14" y="50" width="6" height="30" fill="#78350f" />
      <rect x="80" y="50" width="6" height="30" fill="#78350f" />
      <rect x="46" y="22" width="8" height="20" fill="#f5f5f4" />
      <path d="M50 12 Q53 18 50 22 Q47 18 50 12" fill="#facc15">
        <animate
          attributeName="opacity"
          values="1;.6;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

function ChallengeBoard() {
  return (
    <svg width="110" height="100" viewBox="0 0 110 100">
      <rect x="20" y="10" width="70" height="55" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="2" />
      <rect x="25" y="15" width="60" height="45" fill="#fef3c7" />
      <line x1="32" y1="28" x2="78" y2="28" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="38" x2="65" y2="38" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="48" x2="70" y2="48" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <rect x="50" y="65" width="10" height="30" fill="#78350f" />
      <circle cx="22" cy="12" r="3" fill="#dc2626" />
      <circle cx="88" cy="12" r="3" fill="#dc2626" />
    </svg>
  );
}

function Telescope() {
  return (
    <svg width="100" height="110" viewBox="0 0 100 110">
      <line x1="30" y1="95" x2="50" y2="60" stroke="#1f2937" strokeWidth="4" />
      <line x1="70" y1="95" x2="50" y2="60" stroke="#1f2937" strokeWidth="4" />
      <rect
        x="20"
        y="30"
        width="55"
        height="14"
        rx="3"
        fill="#475569"
        transform="rotate(-25 47 37)"
      />
      <circle cx="22" cy="48" r="6" fill="#0ea5e9" />
    </svg>
  );
}

function Tower() {
  return (
    <svg width="80" height="120" viewBox="0 0 80 120">
      <rect x="22" y="40" width="36" height="60" fill="#a8a29e" stroke="#57534e" />
      <polygon points="18,40 40,15 62,40" fill="#dc2626" stroke="#7f1d1d" />
      <rect x="34" y="55" width="12" height="16" rx="2" fill="#1e3a8a" />
      <circle cx="40" cy="30" r="2.5" fill="#fde047" />
    </svg>
  );
}

function StudyLantern() {
  return (
    <svg width="70" height="100" viewBox="0 0 70 100">
      <rect x="32" y="70" width="6" height="25" rx="2" fill="#78350f" />
      <rect x="18" y="30" width="34" height="42" rx="6" fill="#a16207" stroke="#713f12" strokeWidth="1.5" />
      <rect x="23" y="35" width="24" height="32" rx="4" fill="#fef9c3" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
      </rect>
      <line x1="35" y1="39" x2="35" y2="63" stroke="#92400e" strokeWidth="2" />
      <line x1="27" y1="49" x2="43" y2="49" stroke="#92400e" strokeWidth="2" />
      <polygon points="18,30 35,14 52,30" fill="#78350f" />
      <path d="M28 14 Q35 4 42 14" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* -------- Energy/Level bar -------- */

function EnergyBar({
  streak,
  night,
  levelInfo,
}: {
  streak: number;
  night?: boolean;
  levelInfo?: {
    level: number;
    levelName: string;
    currentLevelXp: number;
    nextLevelXp: number;
    pct: number;
    xpNeeded: number;
    totalXp: number;
  };
}) {
  const info = levelInfo || {
    level: 1,
    levelName: "Semeando a Palavra",
    currentLevelXp: 0,
    nextLevelXp: 100,
    pct: 0,
    xpNeeded: 100,
    totalXp: 0
  };
  
  const p = Math.max(0, Math.min(100, info.pct));

  return (
    <div
      className="absolute z-40 top-4 right-4 px-4 py-3 rounded-2xl backdrop-blur-md text-left"
      style={{
        background: "rgba(255,255,255,.22)",
        border: "1px solid rgba(255,255,255,.4)",
        minWidth: 260,
        color: night ? "#f8fafc" : "#0f172a",
      }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-90">
        <span>🌱 Nív. {info.level} — {info.levelName}</span>
        <span>🔥 {streak}d</span>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 h-3 rounded-full overflow-hidden relative" style={{ background: "rgba(0,0,0,.18)" }}>
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${p}%`,
            background:
              "linear-gradient(90deg,#fde047,#22c55e 50%,#38bdf8)",
            boxShadow:
              "0 0 16px 2px rgba(253,224,71,.7), 0 0 32px 4px rgba(56,189,248,.4)",
            transition: "width 1s ease-out",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.4s linear infinite",
            }}
          />
        </div>
        {/* sparkles riding on the progress bar end */}
        {p > 0 &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `calc(${p}% - 2px)`,
                top: "50%",
                width: 4,
                height: 4,
                background: "#fff7cc",
                boxShadow: "0 0 8px #fde047",
                animation: `spark-rise 1.6s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
      </div>
      
      <div className="mt-2 flex justify-between items-center text-[10px] font-mono opacity-80 leading-none">
        <span>XP: {info.currentLevelXp} / {info.nextLevelXp}</span>
        {info.xpNeeded > 0 ? (
          <span>Falta {info.xpNeeded} XP</span>
        ) : (
          <span>Nível Máx.</span>
        )}
      </div>
    </div>
  );
}
