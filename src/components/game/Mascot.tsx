import { useEffect, useRef, useState } from "react";

export type Mood =
  | "idle"
  | "happy"
  | "very_happy"
  | "excited"
  | "wink"
  | "wave"
  | "pray"
  | "think"
  | "read"
  | "evolve"
  | "celebrate"
  | "sleepy"
  | "sad"
  | "crying"
  | "sleep"
  | "write"
  | "yawn"
  | "hop"
  | "stretch"
  | "look_around"
  | "tilt"
  | "swing_feet"
  | "breathe"
  | "petting";

interface Props {
  mood?: Mood;
  /** position in % within parent */
  x?: number;
  y?: number;
  scale?: number;
  onClick?: () => void;
  message?: string | null;
}

/**
 * Mascot — Chibi Jesus.
 * Um companheiro ilustrativo, amigável e extremamente expressivo
 * com olhos grandes que acompanham o cursor, piscadas, lágrimas e expressões.
 */
export function Mascot({ mood = "idle", x = 50, y = 70, scale = 1, onClick, message }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [hop, setHop] = useState(false);
  const [yawn, setYawn] = useState(false);
  const [intro, setIntro] = useState(true);

  // entrance "run-in"
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 900);
    return () => clearTimeout(t);
  }, []);

  // eye-track the mouse (only for round-eye states)
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      if (mood === "look_around") return; // look_around state takes over
      const max = 2.0;
      // Increase responsiveness when closer
      const dist = Math.sqrt(dx*dx + dy*dy);
      const intensity = dist < 0.2 ? 15 : 10;
      
      setLook({
        x: Math.max(-max, Math.min(max, dx * intensity)),
        y: Math.max(-max, Math.min(max, dy * (intensity - 2))),
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // blink loop
  useEffect(() => {
    let alive = true;
    function loop() {
      if (!alive) return;
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      setTimeout(loop, 2200 + Math.random() * 3500);
    }
    const t = setTimeout(loop, 1500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // Random idle behaviors removed here because they are now managed by GlobalCompanion

  const isSleeping = mood === "sleep";
  const isPraying = mood === "pray";
  const isReading = mood === "read";
  const isWaving = mood === "wave";
  const isSad = mood === "sad";
  const isCrying = mood === "crying";
  const isSleepy = mood === "sleepy" || yawn || mood === "yawn";
  const isThink = mood === "think" || mood === "look_around";
  const isHappy =
    mood === "happy" ||
    mood === "very_happy" ||
    mood === "excited" ||
    mood === "evolve" ||
    mood === "celebrate" ||
    mood === "petting";
  const isWink = mood === "wink";
  const isWriting = mood === "write";
  const isPetting = mood === "petting";
  const isTilt = mood === "tilt" || mood === "petting";

  const animatingHop = hop || mood === "excited" || mood === "evolve" || mood === "celebrate" || mood === "hop";

  // Override look for reading or look_around
  let activeLook = look;
  if (isReading) {
    activeLook = { x: 0, y: 1.5 };
  }
  
  // Random look around loop
  useEffect(() => {
    if (mood !== "look_around") return;
    let alive = true;
    const interval = setInterval(() => {
      if (!alive) return;
      setLook({
        x: (Math.random() * 4) - 2,
        y: (Math.random() * 4) - 2,
      });
    }, 1000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [mood]);

  return (
    <div
      ref={ref}
      onClick={() => {
        setHop(true);
        setTimeout(() => setHop(false), 700);
        onClick?.();
      }}
      className="absolute z-30 cursor-pointer select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transition: "left 0.8s ease-out, top 0.8s ease-out",
      }}
      aria-label="Jesus — seu companheiro de caminhada"
    >
      {/* ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -6,
          width: 80,
          height: 10,
          background: "radial-gradient(ellipse at center, rgba(10,15,40,0.4), transparent 70%)",
          filter: "blur(3px)",
        }}
      />

      {/* speech bubble */}
      {message && (
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold animate-fade-up border border-white/10"
          style={{
            background: "rgba(255,255,255,0.96)",
            color: "#1e293b",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
          }}
        >
          {message}
          <span
            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-2.5 rotate-45"
            style={{ background: "rgba(255,255,255,0.96)" }}
          />
        </div>
      )}

      {/* sleeping Z */}
      {isSleeping && (
        <div
          className="absolute -top-10 right-0 text-xl font-display text-sky-300 font-bold"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          <span style={{ animation: "zfloat 3s ease-out infinite", display: "inline-block" }}>
            z
          </span>
          <span
            style={{
              animation: "zfloat 3s ease-out infinite",
              animationDelay: ".8s",
              display: "inline-block",
              marginLeft: 4,
              fontSize: ".8em",
            }}
          >
            z
          </span>
        </div>
      )}

      {/* evolve / celebrate particles */}
      {(mood === "celebrate" || mood === "evolve") && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute text-yellow-300 font-bold"
              style={{
                left: `${15 + i * 18}%`,
                top: -20,
                fontSize: i % 2 === 0 ? 18 : 14,
                animation: "starpop 1.5s ease-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {mood === "evolve" ? "✨" : "✦"}
            </span>
          ))}
        </>
      )}

      {/* body container */}
      <div
        style={{
          width: 120,
          height: 120,
          position: "relative",
          animation: intro
            ? "lumi-runin .9s cubic-bezier(.2,.9,.3,1.2) both"
            : animatingHop
              ? "lumi-hop .65s cubic-bezier(.2,.9,.3,1.3)"
              : mood === "breathe"
                ? "lumi-breath 3.6s ease-in-out infinite, scale-pulse 2s ease-in-out infinite"
                : "lumi-breath 3.6s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 140 140" width="120" height="120">
          <g style={{
            transformOrigin: "70px 90px",
            transform: isTilt ? "rotate(6deg)" : "none",
            transition: "transform 0.4s ease-in-out"
          }}>
          <defs>
            <radialGradient id="jesusGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#fff7cc" stopOpacity=".9" />
              <stop offset="100%" stopColor="#fff7cc" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="jesusSkin" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#fed7aa" />
            </radialGradient>
            <radialGradient id="jesusHair" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* 1. Aura glow */}
          <circle cx="70" cy="70" r="62" fill="url(#jesusGlow)" />

          {/* 2. Floating Golden Halo */}
          <ellipse
            cx="70"
            cy="16"
            rx="20"
            ry="4.5"
            fill="none"
            stroke="#facc15"
            strokeWidth="2.2"
            opacity=".9"
            className="animate-float-slow"
          />

          {/* 3. Hair Back (Long wavy hair behind head) */}
          <path
            d="M 36,68 C 26,92 34,112 50,114 C 60,116 80,116 90,114 C 106,112 114,92 104,68 C 104,45 36,45 36,68 Z"
            fill="url(#jesusHair)"
            stroke="#1f2937"
            strokeOpacity=".15"
            strokeWidth="1"
          />

          {/* 4. Robe / Tunic (Body) */}
          {/* Main White Tunic */}
          <path
            d="M 46,95 L 94,95 C 99,108 102,122 100,126 L 40,126 C 38,122 41,108 46,95 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          
          {/* Swinging Feet */}
          {(mood === "swing_feet" || mood === "idle" || mood === "breathe" || isReading) && (
            <g className={mood === "swing_feet" ? "animate-[swing_2s_ease-in-out_infinite]" : ""} style={{ transformOrigin: "55px 125px" }}>
              <ellipse cx="55" cy="130" rx="4" ry="6" fill="#fed7aa" stroke="#fb923c" strokeWidth="0.5" />
            </g>
          )}
          {(mood === "swing_feet" || mood === "idle" || mood === "breathe" || isReading) && (
            <g className={mood === "swing_feet" ? "animate-[swing_2.2s_ease-in-out_infinite_reverse]" : ""} style={{ transformOrigin: "85px 125px" }}>
              <ellipse cx="85" cy="130" rx="4" ry="6" fill="#fed7aa" stroke="#fb923c" strokeWidth="0.5" />
            </g>
          )}

          {/* Diagonal Red Sash (Faixa transversal) */}
          <path
            d="M 52,95 L 68,95 C 80,108 86,122 83,126 L 67,126 C 58,122 55,108 52,95 Z"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="0.8"
          />

          {/* 5. Chibi Head (Skin) */}
          <circle
            cx="70"
            cy="62"
            r="32"
            fill="url(#jesusSkin)"
            stroke="#fed7aa"
            strokeWidth="0.8"
          />

          {/* 6. Hair Front (Framing fringe/bangs and sideburns) */}
          <path
            d="M 35,58 C 36,44 48,32 70,32 C 92,32 104,44 105,58 C 102,52 94,48 88,52 C 82,56 78,54 70,48 C 62,54 58,56 52,52 C 46,48 38,52 35,58 Z"
            fill="url(#jesusHair)"
            stroke="#451a03"
            strokeWidth="0.8"
          />

          {/* 7. Cute Chibi Beard */}
          <path
            d="M 48,82 C 48,94 56,98 70,98 C 84,98 92,94 92,82 C 92,88 84,91 70,91 C 56,91 48,88 48,82 Z"
            fill="url(#jesusHair)"
            stroke="#451a03"
            strokeWidth="0.8"
          />

          {/* 8. Pink Cheeks */}
          <ellipse cx="48" cy="74" rx="6" ry="4.5" fill="#fda4af" opacity=".6" />
          <ellipse cx="92" cy="74" rx="6" ry="4.5" fill="#fda4af" opacity=".6" />

          {/* 9. Expressive Chibi Eyes */}
          {/* Blink overlay overrides eyes completely */}
          {blink && !isSleeping && !isPraying ? (
            <>
              {/* Closed squinting/blinking eyes */}
              <path
                d="M 46,71 Q 54,75 62,71"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 78,71 Q 86,75 94,71"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          ) : isSleeping || isPraying ? (
            <>
              {/* Sleeping/Praying peaceful curved eyes */}
              <path
                d={isPetting ? "M 46,68 Q 54,62 62,68" : "M 46,70 Q 54,77 62,70"}
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d={isPetting ? "M 78,68 Q 86,62 94,68" : "M 78,70 Q 86,77 94,70"}
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </>
          ) : isHappy ? (
            <>
              {/* Happy arched squinting eyes (^ ^) */}
              <path
                d="M 46,72 Q 54,64 62,72"
                fill="none"
                stroke="#1f2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 78,72 Q 86,64 94,72"
                fill="none"
                stroke="#1f2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          ) : isWink ? (
            <>
              {/* Winking left eye, open right eye */}
              <path
                d="M 46,72 Q 54,64 62,72"
                fill="none"
                stroke="#1f2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <ellipse cx="86" cy="69" rx="8" ry="8" fill="#1f2937" />
              <circle cx="88.5" cy="66.5" r="2.2" fill="#fff" />
            </>
          ) : isSleepy ? (
            <>
              {/* Droopy/Sleepy eyes (> <) */}
              <path
                d="M 46,66 L 54,71 L 46,76"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 94,66 L 86,71 L 94,76"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            /* Default tracking round eyes (idle, sad, crying, think) */
            <g transform={`translate(${activeLook.x}, ${activeLook.y})`}>
              {/* Left eye */}
              <ellipse cx="54" cy="70" rx="8" ry="8" fill="#1f2937" />
              <circle cx="56.5" cy="67.5" r="2.2" fill="#fff" />
              <circle cx="52.2" cy="72.2" r="0.9" fill="#fff" opacity=".8" />

              {/* Right eye */}
              <ellipse cx="86" cy="70" rx="8" ry="8" fill="#1f2937" />
              <circle cx="88.5" cy="67.5" r="2.2" fill="#fff" />
              <circle cx="84.2" cy="72.2" r="0.9" fill="#fff" opacity=".8" />
            </g>
          )}

          {/* 10. Expressive Mouth */}
          {isSleepy ? (
            /* Yawning circle */
            <circle cx="70" cy="88" r="6" fill="#451a03" />
          ) : mood === "excited" ||
            mood === "very_happy" ||
            mood === "celebrate" ||
            mood === "evolve" ? (
            /* Open laughing mouth */
            <path d="M 62,83 Q 70,98 78,83 Z" fill="#fda4af" stroke="#7c2d12" strokeWidth="1.8" />
          ) : isSad || isCrying ? (
            /* Sad downward curve */
            <path
              d="M 64,88 Q 70,83 76,88"
              stroke="#7c2d12"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          ) : isThink || isWriting ? (
            /* Side smirk thinking line */
            <path
              d="M 66,85 Q 71,83 74,86"
              stroke="#7c2d12"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ) : isPraying || isSleeping ? (
            /* Peaceful closed mouth line */
            <path
              d="M 66,85 Q 70,87 74,85"
              stroke="#7c2d12"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            /* Default happy smile */
            <path
              d={mood === "stretch" ? "M 66,86 Q 70,89 74,86" : "M 62,84 Q 70,92 78,84"}
              stroke="#7c2d12"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* 11. Tears for Crying State */}
          {isCrying && (
            <>
              {/* Dripping tears under the eyes */}
              <path
                d="M 50,78 C 50,87 53,91 53,91 C 53,91 56,87 56,78 Z"
                fill="#3b82f6"
                opacity=".85"
                className="animate-pulse"
              />
              <path
                d="M 84,78 C 84,87 87,91 87,91 C 87,91 90,87 90,78 Z"
                fill="#3b82f6"
                opacity=".85"
                className="animate-pulse"
              />
            </>
          )}

          {/* 12. Arms / Hands */}
          {isPraying ? (
            /* Praying hands: joined together in the center */
            <>
              <path
                d="M 60,108 Q 70,98 80,108"
                fill="none"
                stroke="url(#jesusSkin)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 60,108 Q 70,98 80,108"
                fill="none"
                stroke="#fed7aa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          ) : mood === "celebrate" || mood === "excited" || mood === "evolve" ? (
            /* Waving/Cheering arms raised up */
            <>
              {/* Left Sleeve & Hand */}
              <ellipse
                cx="24"
                cy="86"
                rx="6"
                ry="8"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                style={{ transformOrigin: "32px 86px", transform: "rotate(45deg)" }}
              />
              <circle
                cx="16"
                cy="78"
                r="4.5"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />

              {/* Right Sleeve & Hand */}
              <ellipse
                cx="116"
                cy="86"
                rx="6"
                ry="8"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                style={{ transformOrigin: "108px 86px", transform: "rotate(-45deg)" }}
              />
              <circle
                cx="124"
                cy="78"
                r="4.5"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />
            </>
          ) : mood === "stretch" ? (
            /* Stretching arms high up */
            <>
              <ellipse cx="24" cy="75" rx="6" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" style={{ transformOrigin: "32px 86px", transform: "rotate(160deg)" }} />
              <circle cx="16" cy="65" r="4.5" fill="url(#jesusSkin)" stroke="#fed7aa" strokeWidth="0.5" />
              <ellipse cx="116" cy="75" rx="6" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" style={{ transformOrigin: "108px 86px", transform: "rotate(-160deg)" }} />
              <circle cx="124" cy="65" r="4.5" fill="url(#jesusSkin)" stroke="#fed7aa" strokeWidth="0.5" />
            </>
          ) : isThink ? (
            /* Thinking state: one hand resting, other hand at chin */
            <>
              {/* Left sleeve and hand touching chin */}
              <ellipse
                cx="40"
                cy="92"
                rx="5"
                ry="8"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                style={{ transformOrigin: "46px 92px", transform: "rotate(-35deg)" }}
              />
              <circle
                cx="48"
                cy="81"
                r="4.5"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />

              {/* Right resting arm */}
              <ellipse
                cx="118"
                cy="94"
                rx="7"
                ry="5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
              <circle
                cx="124"
                cy="94"
                r="4"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />
            </>
          ) : isWriting ? (
            /* Writing state: arm moving */
            <>
              {/* Left arm resting */}
              <ellipse
                cx="22"
                cy="94"
                rx="7"
                ry="5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
              <circle
                cx="16"
                cy="94"
                r="4"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />

              {/* Right arm writing (animated) */}
              <ellipse
                cx="110"
                cy="90"
                rx="8"
                ry="5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                style={{
                  transformOrigin: "118px 90px",
                  animation: "lumi-wave 0.8s ease-in-out infinite",
                }}
              />
              <circle
                cx="102"
                cy="90"
                r="4.5"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
                style={{
                  transformOrigin: "110px 90px",
                  animation: "lumi-wave 0.8s ease-in-out infinite",
                }}
              />
              {/* Tiny quill pen */}
              <path
                d="M 100,90 Q 95,75 105,70 Q 102,80 102,90 Z"
                fill="#fcd34d"
                stroke="#b45309"
                strokeWidth="0.8"
                style={{
                  transformOrigin: "102px 90px",
                  animation: "lumi-wave 0.8s ease-in-out infinite",
                }}
              />
            </>
          ) : (
            /* Default: arms resting on the sides */
            <>
              {/* Left arm sleeve + hand */}
              <ellipse
                cx="22"
                cy="94"
                rx="7"
                ry="5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                style={{
                  transformOrigin: "28px 94px",
                  animation: isWaving ? "lumi-wave 1.2s ease-in-out infinite" : "none",
                }}
              />
              <circle
                cx="16"
                cy="94"
                r="4"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
                style={{
                  transformOrigin: "28px 94px",
                  animation: isWaving ? "lumi-wave 1.2s ease-in-out infinite" : "none",
                }}
              />

              {/* Right arm sleeve + hand */}
              <ellipse
                cx="118"
                cy="94"
                rx="7"
                ry="5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
              <circle
                cx="124"
                cy="94"
                r="4"
                fill="url(#jesusSkin)"
                stroke="#fed7aa"
                strokeWidth="0.5"
              />
            </>
          )}

          {/* 13. Tiny Gospel Book if reading */}
          {isReading && (
            <g transform="translate(50 96)" className="animate-pulse">
              <rect
                width="40"
                height="24"
                rx="3"
                fill="#ffffff"
                stroke="#7f1d1d"
                strokeWidth="1.4"
              />
              <line x1="20" y1="2" x2="20" y2="22" stroke="#7f1d1d" strokeWidth="1.2" />
              <line x1="4" y1="8" x2="16" y2="8" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="4" y1="13" x2="16" y2="13" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="4" y1="18" x2="14" y2="18" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="24" y1="8" x2="36" y2="8" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="24" y1="13" x2="36" y2="13" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="24" y1="18" x2="34" y2="18" stroke="#cbd5e1" strokeWidth="1" />
            </g>
          )}
          </g>
        </svg>
      </div>
    </div>
  );
}
