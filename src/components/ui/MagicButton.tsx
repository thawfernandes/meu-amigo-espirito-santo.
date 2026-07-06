import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";

type P = {
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

let pid = 0;

export function MagicButton({
  onClick,
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
}: P) {
  const audio = useAudio();
  const ref = useRef<HTMLButtonElement>(null);
  const [parts, setParts] = useState<
    { id: number; x: number; y: number; dx: number; dy: number }[]
  >([]);

  function spark(e: MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const next = Array.from({ length: 6 }).map(() => ({
      id: ++pid,
      x,
      y,
      dx: (Math.random() - 0.5) * 80,
      dy: -20 - Math.random() * 60,
    }));
    setParts((p) => [...p, ...next]);
    setTimeout(() => setParts((p) => p.filter((q) => !next.some((n) => n.id === q.id))), 900);
  }

  const base =
    variant === "primary"
      ? "text-white"
      : "text-white/90 bg-white/10 border border-white/20 backdrop-blur-md";

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onMouseEnter={() => audio.play("hover")}
      onMouseMove={(e) => Math.random() < 0.18 && spark(e)}
      onClick={(e) => {
        spark(e);
        audio.play("click");
        onClick?.();
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide overflow-visible ${base} ${className} disabled:opacity-60 disabled:pointer-events-none`}
      style={
        variant === "primary"
          ? {
              background: "linear-gradient(135deg,#ffb45a 0%,#ff7aa8 50%,#a06bff 100%)",
              boxShadow:
                "0 10px 30px -8px rgba(255,140,90,.6), 0 0 0 1px rgba(255,255,255,.18) inset, 0 0 40px rgba(255,180,90,.35)",
            }
          : undefined
      }
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-70 blur-xl"
          style={{ background: "linear-gradient(135deg,#ffb45a,#a06bff)" }}
        />
      )}
      <span className="relative z-10">{children}</span>
      {parts.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
          animate={{ x: p.x + p.dx, y: p.y + p.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: "radial-gradient(circle,#fff,#ffd58a)",
            boxShadow: "0 0 8px #ffb45a",
          }}
        />
      ))}
    </motion.button>
  );
}
