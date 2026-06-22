import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Wrap children in a cinematic fade+zoom transition keyed by route path. */
export function PageTransition({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={path}
        initial={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="contents"
      >
        {/* sweep overlay */}
        <motion.div
          aria-hidden
          initial={{ x: "-100%" }}
          animate={{ x: "120%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="pointer-events-none fixed inset-0 z-[70]"
          style={{
            background:
              "linear-gradient(110deg, transparent 0%, transparent 35%, rgba(255,220,170,0.35) 50%, transparent 65%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
