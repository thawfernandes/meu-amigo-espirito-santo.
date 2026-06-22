import { useEffect, useRef, useState } from "react";

type Mood = "idle" | "happy" | "wave" | "sleep" | "celebrate" | "read" | "yawn";

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
 * Lumi — companheiro de aventura. Pequena criatura luminosa, fofa, com olhos
 * grandes que acompanham o cursor, piscadas, bocejos e expressões.
 */
export function Mascot({
  mood = "idle",
  x = 50,
  y = 70,
  scale = 1,
  onClick,
  message,
}: Props) {
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

  // eye-track the mouse
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      const max = 2.4;
      setLook({
        x: Math.max(-max, Math.min(max, dx * 12)),
        y: Math.max(-max, Math.min(max, dy * 10)),
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

  // random idle behaviors: yawn, little hop
  useEffect(() => {
    if (mood !== "idle") return;
    let alive = true;
    function loop() {
      if (!alive) return;
      const r = Math.random();
      if (r < 0.5) {
        setYawn(true);
        setTimeout(() => setYawn(false), 1200);
      } else {
        setHop(true);
        setTimeout(() => setHop(false), 700);
      }
      setTimeout(loop, 5000 + Math.random() * 7000);
    }
    const t = setTimeout(loop, 4000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [mood]);

  const sleeping = mood === "sleep";
  const celebrating = mood === "celebrate";
  const reading = mood === "read";
  const waving = mood === "wave";
  const showYawn = yawn || mood === "yawn";

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
      }}
      aria-label="Lumi — seu companheiro de caminhada"
    >
      {/* ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -8,
          width: 90,
          height: 14,
          background:
            "radial-gradient(ellipse at center, rgba(20,30,60,0.35), transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* speech bubble */}
      {message && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-2xl text-xs font-medium animate-fade-up"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "#1f2937",
            boxShadow: "0 8px 24px -10px rgba(30,60,120,.45)",
          }}
        >
          {message}
          <span
            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-3 h-3 rotate-45"
            style={{ background: "rgba(255,255,255,0.92)" }}
          />
        </div>
      )}

      {/* sleeping Z */}
      {sleeping && (
        <div
          className="absolute -top-6 right-2 text-2xl font-display"
          style={{ color: "white", textShadow: "0 1px 0 #2563eb" }}
        >
          <span
            style={{ animation: "zfloat 3s ease-out infinite", display: "inline-block" }}
          >
            z
          </span>
          <span
            style={{
              animation: "zfloat 3s ease-out infinite",
              animationDelay: ".7s",
              display: "inline-block",
              marginLeft: 4,
              fontSize: ".8em",
            }}
          >
            z
          </span>
        </div>
      )}

      {/* celebrate stars */}
      {celebrating && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: -10,
                fontSize: 18,
                color: "#facc15",
                animation: "starpop 1.4s ease-out infinite",
                animationDelay: `${i * 0.12}s`,
              }}
            >
              ✦
            </span>
          ))}
        </>
      )}

      {/* body */}
      <div
        style={{
          width: 130,
          height: 130,
          position: "relative",
          animation: intro
            ? "lumi-runin .9s cubic-bezier(.2,.9,.3,1.2) both"
            : hop
              ? "lumi-hop .65s cubic-bezier(.2,.9,.3,1.3)"
              : "lumi-breath 3.4s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 140 140" width="130" height="130">
          <defs>
            <radialGradient id="lumiBody" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <radialGradient id="lumiGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#fff7cc" stopOpacity=".95" />
              <stop offset="100%" stopColor="#fff7cc" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lumiCheek" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fda4af" stopOpacity=".0" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity=".55" />
            </linearGradient>
          </defs>

          {/* aura */}
          <circle cx="70" cy="70" r="62" fill="url(#lumiGlow)" />
          {/* halo */}
          <ellipse
            cx="70"
            cy="22"
            rx="22"
            ry="5"
            fill="none"
            stroke="#fde68a"
            strokeWidth="2"
            opacity=".85"
          />

          {/* ears / spark tufts */}
          <path
            d="M40 38 C 38 22, 50 18, 56 30 Z"
            fill="url(#lumiBody)"
            stroke="#b45309"
            strokeOpacity=".35"
            strokeWidth="1.2"
          />
          <path
            d="M100 38 C 102 22, 90 18, 84 30 Z"
            fill="url(#lumiBody)"
            stroke="#b45309"
            strokeOpacity=".35"
            strokeWidth="1.2"
          />

          {/* head/body — single round drop */}
          <path
            d="M70 30
               C 105 30, 120 60, 115 90
               C 110 120, 90 128, 70 128
               C 50 128, 30 120, 25 90
               C 20 60, 35 30, 70 30 Z"
            fill="url(#lumiBody)"
            stroke="#b45309"
            strokeOpacity=".35"
            strokeWidth="1.4"
          />

          {/* cheeks */}
          <ellipse cx="44" cy="82" rx="9" ry="6" fill="url(#lumiCheek)" />
          <ellipse cx="96" cy="82" rx="9" ry="6" fill="url(#lumiCheek)" />

          {/* eyes */}
          <g transform={`translate(${look.x}, ${look.y})`}>
            {/* left */}
            <ellipse
              cx="54"
              cy="68"
              rx="9"
              ry={sleeping || blink ? 1.2 : 11}
              fill="#1f2937"
            />
            {!sleeping && !blink && (
              <>
                <circle cx="57" cy="64" r="3" fill="#fff" />
                <circle cx="52" cy="72" r="1.2" fill="#fff" opacity=".8" />
              </>
            )}
            {/* right */}
            <ellipse
              cx="86"
              cy="68"
              rx="9"
              ry={sleeping || blink ? 1.2 : 11}
              fill="#1f2937"
            />
            {!sleeping && !blink && (
              <>
                <circle cx="89" cy="64" r="3" fill="#fff" />
                <circle cx="84" cy="72" r="1.2" fill="#fff" opacity=".8" />
              </>
            )}
          </g>

          {/* eyebrows for celebrate */}
          {celebrating && (
            <>
              <path
                d="M46 54 Q54 49 62 54"
                stroke="#7c2d12"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M78 54 Q86 49 94 54"
                stroke="#7c2d12"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}

          {/* mouth */}
          {showYawn ? (
            <ellipse cx="70" cy="96" rx="10" ry="12" fill="#7c2d12" />
          ) : celebrating ? (
            <path
              d="M55 92 Q70 110 85 92"
              stroke="#7c2d12"
              strokeWidth="2.6"
              fill="#fda4af"
              strokeLinecap="round"
            />
          ) : sleeping ? (
            <path
              d="M62 96 Q70 100 78 96"
              stroke="#7c2d12"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M60 92 Q70 102 80 92"
              stroke="#7c2d12"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* tiny arms */}
          <ellipse
            cx="22"
            cy="92"
            rx="7"
            ry="5"
            fill="url(#lumiBody)"
            style={{
              transformOrigin: "28px 92px",
              animation: waving
                ? "lumi-wave 1.2s ease-in-out infinite"
                : celebrating
                  ? "lumi-cheer 0.6s ease-in-out infinite"
                  : "none",
            }}
          />
          <ellipse
            cx="118"
            cy="92"
            rx="7"
            ry="5"
            fill="url(#lumiBody)"
            style={{
              transformOrigin: "112px 92px",
              animation: celebrating
                ? "lumi-cheer 0.6s ease-in-out infinite"
                : "none",
            }}
          />

          {/* tiny book if reading */}
          {reading && (
            <g transform="translate(50 100)">
              <rect width="40" height="22" rx="3" fill="#fff" stroke="#1f2937" strokeWidth="1.2" />
              <line x1="20" y1="2" x2="20" y2="20" stroke="#1f2937" strokeWidth="1" />
              <line x1="4" y1="8" x2="16" y2="8" stroke="#94a3b8" strokeWidth=".8" />
              <line x1="4" y1="12" x2="16" y2="12" stroke="#94a3b8" strokeWidth=".8" />
              <line x1="24" y1="8" x2="36" y2="8" stroke="#94a3b8" strokeWidth=".8" />
              <line x1="24" y1="12" x2="36" y2="12" stroke="#94a3b8" strokeWidth=".8" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
