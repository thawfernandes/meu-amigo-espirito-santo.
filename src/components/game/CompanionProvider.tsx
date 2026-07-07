import { createContext, useContext, useState, type ReactNode, useCallback, useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { Mood } from "./Mascot";

type CompanionPosition = "center" | "corner";

interface CompanionCtx {
  mood: Mood;
  setMood: (m: Mood) => void;
  message: string | null;
  setMessage: (m: string | null) => void;
  position: CompanionPosition;
  triggerPet: () => void;
  triggerGreeting: () => void;
}

const Ctx = createContext<CompanionCtx | null>(null);

export function useCompanion() {
  const c = useContext(Ctx);
  if (!c) {
    return {
      mood: "idle" as Mood,
      setMood: () => {},
      message: null,
      setMessage: () => {},
      position: "center" as CompanionPosition,
      triggerPet: () => {},
      triggerGreeting: () => {},
    };
  }
  return c;
}

export function CompanionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState<CompanionPosition>("center");

  // Determine position and default mood based on route
  useEffect(() => {
    const path = location.pathname;
    let newMood: Mood = "idle";
    let newPos: CompanionPosition = "corner";

    if (path.includes("/dashboard") || path === "/") {
      newPos = "center";
      newMood = "idle";
    } else if (path.includes("/biblia")) {
      newPos = "corner";
      newMood = "read";
    } else if (path.includes("/estudos") || path.includes("/capsula-do-tempo")) {
      newPos = "corner";
      newMood = "write";
    } else if (path.includes("/vida")) {
      newPos = "corner";
      newMood = "pray";
    }

    setPosition(newPos);
    setMood(newMood);
    setMessage(null);
  }, [location.pathname]);

  const petTimer = useRef<number | null>(null);
  
  const triggerPet = useCallback(() => {
    setMood("petting");
    if (petTimer.current) clearTimeout(petTimer.current);
    petTimer.current = window.setTimeout(() => {
      // Revert to route default mood
      const path = location.pathname;
      let revertMood: Mood = "idle";
      if (path.includes("/biblia")) revertMood = "read";
      else if (path.includes("/estudos") || path.includes("/capsula-do-tempo")) revertMood = "write";
      else if (path.includes("/vida")) revertMood = "pray";
      
      setMood(revertMood);
    }, 3000);
  }, [location.pathname]);

  const triggerGreeting = useCallback(() => {
    setMood("wave");
    setMessage("Paz seja convosco! 👋");
    if (petTimer.current) clearTimeout(petTimer.current);
    petTimer.current = window.setTimeout(() => {
      setMessage(null);
      
      // Revert to route default mood
      const path = location.pathname;
      let revertMood: Mood = "idle";
      if (path.includes("/biblia")) revertMood = "read";
      else if (path.includes("/estudos") || path.includes("/capsula-do-tempo")) revertMood = "write";
      else if (path.includes("/vida")) revertMood = "pray";
      
      setMood(revertMood);
    }, 2200);
  }, [location.pathname]);

  return (
    <Ctx.Provider
      value={{
        mood,
        setMood,
        message,
        setMessage,
        position,
        triggerPet,
        triggerGreeting,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
