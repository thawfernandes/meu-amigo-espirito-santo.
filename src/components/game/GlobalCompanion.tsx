import { useEffect, useRef, useState } from "react";
import { Mascot } from "./Mascot";
import { useCompanion } from "./CompanionProvider";
import { useAudio } from "../audio/AudioProvider";

export function GlobalCompanion() {
  const { mood, message, position, triggerPet, triggerGreeting } = useCompanion();
  const audio = useAudio();
  
  const isCenter = position === "center";
  
  // State for idle animations
  const [idleMood, setIdleMood] = useState<
    "idle" | "yawn" | "hop" | "stretch" | "look_around" | "tilt" | "swing_feet" | "breathe"
  >("idle");
  const idleTimer = useRef<number | null>(null);

  // Petting logic
  const petCount = useRef(0);
  const petTimeout = useRef<number | null>(null);

  const handleMouseMove = () => {
    petCount.current += 1;
    if (petTimeout.current) window.clearTimeout(petTimeout.current);
    
    petTimeout.current = window.setTimeout(() => {
      petCount.current = 0;
    }, 400);

    // If mouse moved a lot over the mascot quickly, trigger pet
    if (petCount.current > 15) {
      triggerPet();
      audio.play("companion_giggle");
      petCount.current = 0;
    }
  };

  // Idle behavior
  useEffect(() => {
    if (!audio.companionAnimationsEnabled) return;
    if (mood !== "idle") return; // Only trigger idle behaviors if we're actually idle

    const startIdleTimer = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      // random between 5s and 15s as requested by user
      const delay = 5000 + Math.random() * 10000;
      idleTimer.current = window.setTimeout(() => {
        const actions = ["yawn", "hop", "stretch", "look_around", "tilt", "swing_feet", "breathe"] as const;
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        setIdleMood(randomAction);
        
        // Play corresponding sounds
        if (randomAction === "yawn") audio.play("companion_yawn");
        if (randomAction === "hop") audio.play("companion_hop");
        if (randomAction === "breathe") audio.play("companion_sigh");
        if (randomAction === "look_around") audio.play("companion_hmm");
        
        // Reset back to idle after a duration
        let duration = 2000;
        if (randomAction === "yawn") duration = 2500;
        if (randomAction === "hop") duration = 1000;
        if (randomAction === "stretch") duration = 2200;
        if (randomAction === "swing_feet") duration = 3000;
        
        setTimeout(() => setIdleMood("idle"), duration);
        
        startIdleTimer(); // Loop
      }, delay);
    };

    startIdleTimer();

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [mood, audio.companionAnimationsEnabled, audio]);

  // Merge the context mood with the temporary idle mood
  let activeMood = mood;
  if (idleMood !== "idle") {
    // If the base mood is sleep, only some idle actions make sense
    if (mood === "sleep") {
      if (idleMood === "breathe" || idleMood === "yawn" || idleMood === "stretch") {
        activeMood = idleMood as any;
      }
    } else {
      activeMood = idleMood as any;
    }
  }

  if (!audio.companionAnimationsEnabled) {
    activeMood = "idle";
  }

  // Cloud swaying animation state
  const [cloudSway, setCloudSway] = useState(0);
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      setCloudSway(Math.sin(t) * 3); // 3px sway
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Visual classes and positioning
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 50,
    transition: "all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
    pointerEvents: "auto",
    ...(isCenter
      ? {
          left: "50%",
          top: "60%",
          transform: `translate(-50%, calc(-50% + ${cloudSway}px)) scale(1.3)`,
        }
      : {
          left: "auto",
          right: "20px", // moved slightly closer to the edge
          top: "auto",
          bottom: "110px", // moved higher so it doesn't cover "vida/capsula" cards
          transform: `translate(0, ${cloudSway}px) scale(0.85)`,
        }),
  };

  return (
    <div
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onClick={() => {
        audio.play("companion_hop");
        triggerGreeting();
      }}
      className="group cursor-pointer select-none"
    >
      {/* Cloud Base */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full blur-sm"
        style={{
          bottom: -15,
          width: 140,
          height: 30,
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9), transparent 70%)",
          transition: "opacity 1s",
          opacity: isCenter ? 1 : 0.6,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: -10,
          width: 110,
          height: 25,
          background: "radial-gradient(ellipse at center, rgba(255,255,255,1), transparent 80%)",
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
        }}
      />
      {/* Small extra cloud puffs */}
      <div
        className="absolute rounded-full bg-white/80 blur-[2px] animate-pulse"
        style={{ bottom: -5, left: -20, width: 40, height: 20 }}
      />
      <div
        className="absolute rounded-full bg-white/80 blur-[2px] animate-pulse delay-700"
        style={{ bottom: -2, right: -15, width: 35, height: 18 }}
      />

      <div className="relative" style={{ width: 120, height: 120 }}>
        {/* We pass x=50, y=50 because Mascot is absolutely positioned within this 120x120 relative box */}
        <Mascot mood={activeMood} message={message} x={50} y={50} scale={1} />
      </div>
    </div>
  );
}
