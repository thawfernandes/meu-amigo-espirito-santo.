import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

export type Sfx =
  | "hover"
  | "click"
  | "select"
  | "chime"
  | "swoosh"
  | "page"
  | "marker"
  | "levelup"
  | "achievement";

export type Mood =
  | "idle"
  | "happy"
  | "very_happy"
  | "excited"
  | "blink"
  | "wave"
  | "pray"
  | "think"
  | "read"
  | "evolve"
  | "celebrate"
  | "sleepy"
  | "sad"
  | "crying"
  | "sleep";

export type AudioCtx = {
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  autoAdapt: boolean;
  setMusicEnabled: (v: boolean) => void;
  setSfxEnabled: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setAutoAdapt: (v: boolean) => void;
  setContext: (c: "dashboard" | "biblia" | "vida" | "estudos") => void;
  setMood: (m: Mood) => void;
  toggle: () => void;
  play: (s: Sfx) => void;
};

const Ctx = createContext<AudioCtx | null>(null);

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) {
    return {
      muted: true,
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.5,
      autoAdapt: true,
      setMusicEnabled: () => {},
      setSfxEnabled: () => {},
      setMusicVolume: () => {},
      setSfxVolume: () => {},
      setAutoAdapt: () => {},
      setContext: () => {},
      setMood: () => {},
      toggle: () => {},
      play: () => {},
    } as AudioCtx;
  }
  return c;
}

/* --- Music Constants (Hz Frequencies) --- */
const N = {
  C2: 65.41, G2: 98.00,
  A2: 110.00, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00, B5: 987.77,
};

const pentatonicMajor = [N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5, N.G5, N.A5];
const pentatonicMinor = [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5];

// Chord structures (multi-frequency lists)
const chordsHappy = [
  [N.C3, N.G3, N.C4, N.E4], // C
  [N.F3, N.C4, N.F4, N.A4], // F
  [N.A2, N.E3, N.C4, N.E4], // Am
  [N.G2, N.D3, N.B3, N.D4], // G
];

const chordsTranquil = [
  [N.C3, N.G3, N.B3, N.E4, N.G4], // Cmaj7
  [N.F3, N.C4, N.G4, N.A4, N.C5], // Fadd9
  [N.E3, N.B3, N.D4, N.G4, N.B4], // Em7
];

const chordsSad = [
  [N.A2, N.E3, N.A3, N.C4], // Am
  [N.D3, N.A3, N.D4, N.F4], // Dm
  [N.E3, N.B3, N.E4, N.G4], // Em
  [N.F3, N.C4, N.F4, N.A4], // F
];

const chordsReading = [
  [N.C3, N.G3, N.D4, N.E4, N.G4, N.B4], // Cmaj9
  [N.F3, N.C4, N.G4, N.A4, N.C5, N.E5], // Fmaj9
];

const chordsPrayer = [
  [N.C2, N.G2, N.C3, N.G3, N.C4], // Deep C drone
];

const chordsStudies = [
  [N.C3, N.G3, N.B3, N.D4, N.E4], // Cmaj9
  [N.A2, N.E3, N.G3, N.C4, N.E4], // Am7
  [N.E3, N.B3, N.D4, N.G4],       // Em7
  [N.D3, N.A3, N.C4, N.F4],       // Dm7
];

/* --- Audio Synthesis Helpers --- */

function playPianoNote(
  ac: AudioContext,
  dest: AudioNode,
  freq: number,
  time: number,
  dur: number,
  vol: number
) {
  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const gainNode = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc1.type = "sine";
  osc1.frequency.value = freq;

  osc2.type = "triangle";
  osc2.frequency.value = freq * 2.002; // soft high octave shimmer

  const osc2Gain = ac.createGain();
  osc2Gain.gain.value = 0.22;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, time);
  filter.frequency.exponentialRampToValueAtTime(260, time + dur);

  osc2.connect(osc2Gain).connect(filter);
  osc1.connect(filter);
  filter.connect(gainNode).connect(dest);

  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.linearRampToValueAtTime(vol * 0.4, time + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(vol * 0.08, time + 0.25);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + dur + 0.1);
  osc2.stop(time + dur + 0.1);
}

function playPadChord(
  ac: AudioContext,
  dest: AudioNode,
  notes: number[],
  time: number,
  dur: number,
  vol: number
) {
  const oscillators: OscillatorNode[] = [];
  const gainNode = ac.createGain();
  const filter = ac.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(320, time);
  filter.frequency.linearRampToValueAtTime(650, time + dur * 0.5);
  filter.frequency.linearRampToValueAtTime(320, time + dur);
  filter.Q.value = 0.8;

  notes.forEach((f, idx) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f + (idx % 2 === 0 ? 0.35 : -0.35); // chorus detune
    osc.connect(filter);
    oscillators.push(osc);
  });

  filter.connect(gainNode).connect(dest);

  // Slow attack and release for pad morphing
  gainNode.gain.setValueAtTime(0.0001, time);
  gainNode.gain.linearRampToValueAtTime(vol * 0.22, time + 2.2);
  gainNode.gain.setValueAtTime(vol * 0.22, time + dur - 2.2);
  gainNode.gain.linearRampToValueAtTime(0.0001, time + dur);

  oscillators.forEach((osc) => {
    osc.start(time);
    osc.stop(time + dur + 0.1);
  });
}

function playBirdChirp(ac: AudioContext, dest: AudioNode, time: number) {
  const count = 2 + Math.floor(Math.random() * 2);
  let triggerTime = time;

  for (let i = 0; i < count; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain).connect(dest);

    osc.type = "sine";
    const startF = 1800 + Math.random() * 500;
    const endF = startF + 1000;

    osc.frequency.setValueAtTime(startF, triggerTime);
    osc.frequency.exponentialRampToValueAtTime(endF, triggerTime + 0.07);

    gain.gain.setValueAtTime(0, triggerTime);
    gain.gain.linearRampToValueAtTime(0.018, triggerTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, triggerTime + 0.07);

    osc.start(triggerTime);
    osc.stop(triggerTime + 0.08);

    triggerTime += 0.12 + Math.random() * 0.08;
  }
}

function createNoiseBuffer(ac: AudioContext) {
  const size = ac.sampleRate * 4;
  const buffer = ac.createBuffer(1, size, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/* --- Core Audio Provider Component --- */

export function AudioProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Settings states loaded from localStorage
  const [musicEnabled, setMusicEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("audio.musicEnabled");
    return v === null ? true : v === "true";
  });
  const [sfxEnabled, setSfxEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("audio.sfxEnabled");
    return v === null ? true : v === "true";
  });
  const [musicVolume, setMusicVolumeState] = useState(() => {
    if (typeof window === "undefined") return 0.5;
    const v = localStorage.getItem("audio.musicVolume");
    return v === null ? 0.5 : parseFloat(v);
  });
  const [sfxVolume, setSfxVolumeState] = useState(() => {
    if (typeof window === "undefined") return 0.5;
    const v = localStorage.getItem("audio.sfxVolume");
    return v === null ? 0.5 : parseFloat(v);
  });
  const [autoAdapt, setAutoAdaptState] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("audio.autoAdapt");
    return v === null ? true : v === "true";
  });

  // Master mute state (controlled by floating sound button)
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("audio.muted");
    return v === null ? true : v === "true";
  });

  // Current page context and character mood
  const [context, setContextState] = useState<"dashboard" | "biblia" | "vida" | "estudos">("dashboard");
  const [mood, setMoodState] = useState<Mood>("idle");

  // Web Audio Node Refs
  const acRef = useRef<AudioContext | null>(null);
  const pianoGainRef = useRef<GainNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const natureGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const windLFORef = useRef<OscillatorNode | null>(null);
  const loopTimerRef = useRef<number | null>(null);

  // Dynamic Ref holding current state to prevent scheduler closures
  const stateRef = useRef({ context, mood, autoAdapt });
  useEffect(() => {
    stateRef.current = { context, mood, autoAdapt };
  }, [context, mood, autoAdapt]);

  // Lazy initialize AudioContext
  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!acRef.current) {
      const A = window.AudioContext || (window as any).webkitAudioContext;
      if (!A) return null;
      acRef.current = new A();
    }
    if (acRef.current.state === "suspended") acRef.current.resume();
    return acRef.current;
  }, []);

  // Update context dynamically on location pathname changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/biblia")) setContextState("biblia");
    else if (path.includes("/vida")) setContextState("vida");
    else if (path.includes("/estudos")) setContextState("estudos");
    else setContextState("dashboard");
  }, [location.pathname]);

  // Apply smooth volume changes and crossfades
  const applyCrossfade = useCallback(() => {
    const ac = acRef.current;
    if (!ac) return;
    const now = ac.currentTime;

    // Master Volume calculations
    const targetMaster = (!musicEnabled || muted) ? 0 : musicVolume;
    if (masterGainRef.current) {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.linearRampToValueAtTime(targetMaster * 0.7, now + 1.2);
    }

    // Determine submix volume levels
    let targetPiano = 0.45;
    let targetPad = 0.55;
    let targetNature = 0.0;

    const activeCtx = stateRef.current.context;
    const activeMood = stateRef.current.mood;

    if (activeCtx === "vida") { // Prayer
      targetPiano = 0.0;
      targetPad = 0.75;
      targetNature = 0.15; // drone + nature wind
    } else if (activeCtx === "biblia") { // Reading
      targetPiano = 0.08; // extremely sparse
      targetPad = 0.45;
      targetNature = 0.18; // soft wind
    } else if (activeCtx === "estudos") { // Studies
      targetPiano = 0.35;
      targetPad = 0.4;
      targetNature = 0.0;
    } else { // Dashboard
      const isJoyful = ["happy", "very_happy", "excited", "celebrate", "evolve"].includes(activeMood);
      const isGloomy = ["sad", "crying", "sleepy", "sleep"].includes(activeMood);

      if (isJoyful) {
        targetPiano = 0.55;
        targetPad = 0.45;
        targetNature = 0.05;
      } else if (isGloomy) {
        targetPiano = 0.18;
        targetPad = 0.65;
        targetNature = 0.28; // wind active
      } else { // tranquil / default
        targetPiano = 0.38;
        targetPad = 0.52;
        targetNature = 0.38; // wind + birds active
      }
    }

    // Smooth linear crossfade over 2 seconds
    if (pianoGainRef.current) {
      pianoGainRef.current.gain.cancelScheduledValues(now);
      pianoGainRef.current.gain.linearRampToValueAtTime(targetPiano, now + 2.0);
    }
    if (padGainRef.current) {
      padGainRef.current.gain.cancelScheduledValues(now);
      padGainRef.current.gain.linearRampToValueAtTime(targetPad, now + 2.0);
    }
    if (natureGainRef.current) {
      natureGainRef.current.gain.cancelScheduledValues(now);
      natureGainRef.current.gain.linearRampToValueAtTime(targetNature, now + 2.5);
    }
  }, [musicEnabled, muted, musicVolume, context, mood]);

  // Trigger crossfade when relevant parameters update
  useEffect(() => {
    applyCrossfade();
  }, [applyCrossfade]);

  // Synchronize SFX volumes
  useEffect(() => {
    if (sfxGainRef.current) {
      const now = acRef.current ? acRef.current.currentTime : 0;
      sfxGainRef.current.gain.setValueAtTime(sfxEnabled ? sfxVolume : 0, now);
    }
  }, [sfxEnabled, sfxVolume]);

  const startAudioEngine = useCallback(() => {
    const ac = ensure();
    if (!ac) return;

    if (masterGainRef.current) {
      if (ac.state === "suspended") ac.resume();
      return;
    }

    // 1. Setup Gains
    const master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);
    masterGainRef.current = master;

    const pianoGain = ac.createGain();
    pianoGain.gain.value = 0.4;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const padGain = ac.createGain();
    padGain.gain.value = 0.5;
    padGain.connect(master);
    padGainRef.current = padGain;

    const natureGain = ac.createGain();
    natureGain.gain.value = 0.2;
    natureGain.connect(master);
    natureGainRef.current = natureGain;

    const sfxGain = ac.createGain();
    sfxGain.gain.value = sfxEnabled ? sfxVolume : 0;
    sfxGain.connect(ac.destination);
    sfxGainRef.current = sfxGain;

    // 2. Setup Wind Synth
    try {
      const noiseBuffer = createNoiseBuffer(ac);
      const noiseSource = ac.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = ac.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.value = 400;
      windFilter.Q.value = 2.0;

      const windGain = ac.createGain();
      windGain.gain.value = 0.28;

      noiseSource.connect(windFilter).connect(windGain).connect(natureGain);
      noiseSource.start(0);
      noiseSourceRef.current = noiseSource;

      // Wind LFO modulator
      const windLFO = ac.createOscillator();
      windLFO.type = "sine";
      windLFO.frequency.value = 0.08; // slow cycles
      
      const windLFOGain = ac.createGain();
      windLFOGain.gain.value = 220; // oscillate cutoff
      
      windLFO.connect(windLFOGain).connect(windFilter.frequency);
      windLFO.start(0);
      windLFORef.current = windLFO;
    } catch (e) {
      console.error("Nature sound engine error:", e);
    }

    // 3. Scheduling Loop
    let nextStart = ac.currentTime + 0.1;

    const scheduleBarLoop = () => {
      const actCtx = stateRef.current.context;
      const actMood = stateRef.current.mood;
      const isAuto = stateRef.current.autoAdapt;

      let tempo = 0.72;
      let scale = pentatonicMajor;
      let chords = chordsTranquil;
      let density = 0.2;
      let isLofi = false;

      // Apply dynamic parameters
      if (actCtx === "vida") { // Prayer
        tempo = 1.0;
        chords = chordsPrayer;
        scale = []; // drone only
        density = 0;
      } else if (actCtx === "biblia") { // Reading
        tempo = 0.85;
        chords = chordsReading;
        scale = pentatonicMajor;
        density = 0.04;
      } else if (actCtx === "estudos") { // Studies
        tempo = 0.66;
        chords = chordsStudies;
        scale = pentatonicMinor;
        density = 0.15;
        isLofi = true;
      } else { // Dashboard
        const isJoyful = isAuto && ["happy", "very_happy", "excited", "celebrate", "evolve"].includes(actMood);
        const isGloomy = isAuto && ["sad", "crying", "sleepy", "sleep"].includes(actMood);

        if (isJoyful) {
          tempo = 0.54;
          chords = chordsHappy;
          scale = pentatonicMajor;
          density = 0.32;
        } else if (isGloomy) {
          tempo = 0.95;
          chords = chordsSad;
          scale = pentatonicMinor;
          density = 0.12;
        } else { // default tranquil
          tempo = 0.72;
          chords = chordsTranquil;
          scale = pentatonicMajor;
          density = 0.2;
        }
      }

      const barDuration = 8 * tempo;
      const chordIndex = Math.floor(nextStart / barDuration) % chords.length;
      const activeChord = chords[chordIndex];

      // Schedule Pad
      playPadChord(ac, padGain, activeChord, nextStart, barDuration, 1.0);

      // Schedule random birds on dashboard
      if (actCtx === "dashboard" && !["sad", "crying", "sleep"].includes(actMood)) {
        if (Math.random() < 0.3) {
          playBirdChirp(ac, natureGain, nextStart + Math.random() * barDuration);
        }
      }

      // Schedule piano notes
      if (scale.length > 0) {
        for (let b = 0; b < 8; b++) {
          const noteTime = nextStart + b * tempo;
          if (isLofi) {
            // Steady beats for studies focus
            if (b === 0 || b === 4) {
              const noteIdx = Math.floor(Math.random() * scale.length);
              playPianoNote(ac, pianoGain, scale[noteIdx], noteTime, tempo * 1.5, 0.7);
            }
          } else {
            // Generative ambient play
            if (Math.random() < density) {
              const noteIdx = Math.floor(Math.random() * scale.length);
              const vel = 0.45 + Math.random() * 0.45;
              playPianoNote(ac, pianoGain, scale[noteIdx], noteTime, tempo * (1.2 + Math.random() * 2), vel);
            }
          }
        }
      }

      nextStart += barDuration;
    };

    scheduleBarLoop();
    loopTimerRef.current = window.setInterval(() => {
      if (ac.currentTime + 3 > nextStart) {
        scheduleBarLoop();
      }
    }, 2000);

    applyCrossfade();
  }, [ensure, applyCrossfade, sfxEnabled, sfxVolume]);

  const stopAudioEngine = useCallback(() => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    const ac = acRef.current;
    if (!ac) return;
    const now = ac.currentTime;

    if (masterGainRef.current) {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
    }
  }, []);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem("audio.muted", String(next));
      if (next) {
        stopAudioEngine();
      } else {
        startAudioEngine();
      }
      return next;
    });
  }, [startAudioEngine, stopAudioEngine]);

  const setMusicEnabled = useCallback((v: boolean) => {
    setMusicEnabledState(v);
    localStorage.setItem("audio.musicEnabled", String(v));
    if (!v) {
      // fade out music
      if (masterGainRef.current && acRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0, acRef.current.currentTime + 0.5);
      }
    } else {
      if (muted) {
        setMuted(false);
        localStorage.setItem("audio.muted", "false");
      }
      startAudioEngine();
      applyCrossfade();
    }
  }, [muted, startAudioEngine, applyCrossfade]);

  const setSfxEnabled = useCallback((v: boolean) => {
    setSfxEnabledState(v);
    localStorage.setItem("audio.sfxEnabled", String(v));
  }, []);

  const setMusicVolume = useCallback((v: number) => {
    setMusicVolumeState(v);
    localStorage.setItem("audio.musicVolume", String(v));
  }, []);

  const setSfxVolume = useCallback((v: number) => {
    setSfxVolumeState(v);
    localStorage.setItem("audio.sfxVolume", String(v));
  }, []);

  const setAutoAdapt = useCallback((v: boolean) => {
    setAutoAdaptState(v);
    localStorage.setItem("audio.autoAdapt", String(v));
  }, []);

  const play = useCallback(
    (s: Sfx) => {
      if (!sfxEnabled || (muted && s !== "click")) return; // always allow clicks
      const ac = ensure();
      if (!ac) return;

      const now = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      g.connect(sfxGainRef.current || ac.destination);
      o.connect(g);

      switch (s) {
        case "hover": {
          o.type = "sine";
          o.frequency.setValueAtTime(800, now);
          o.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.04, now + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          o.start(now);
          o.stop(now + 0.18);
          break;
        }
        case "click": {
          o.type = "triangle";
          o.frequency.setValueAtTime(580, now);
          o.frequency.exponentialRampToValueAtTime(290, now + 0.1);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.08, now + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
          o.start(now);
          o.stop(now + 0.2);
          break;
        }
        case "select": {
          [523.25, 659.25, 783.99].forEach((f, idx) => {
            const oo = ac.createOscillator();
            const gg = ac.createGain();
            oo.type = "sine";
            oo.frequency.value = f;
            gg.gain.setValueAtTime(0.0001, now + idx * 0.06);
            gg.gain.linearRampToValueAtTime(0.05, now + idx * 0.06 + 0.02);
            gg.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.3);
            oo.connect(gg).connect(sfxGainRef.current || ac.destination);
            oo.start(now + idx * 0.06);
            oo.stop(now + idx * 0.06 + 0.35);
          });
          break;
        }
        case "chime": {
          o.type = "sine";
          o.frequency.setValueAtTime(1100, now);
          o.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.07, now + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
          o.start(now);
          o.stop(now + 0.85);
          break;
        }
        case "swoosh": {
          const duration = 0.45;
          const noiseBuffer = createNoiseBuffer(ac);
          const src = ac.createBufferSource();
          src.buffer = noiseBuffer;

          const filter = ac.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(350, now);
          filter.frequency.exponentialRampToValueAtTime(1800, now + duration);

          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.08, now + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          src.connect(filter).connect(g);
          src.start(now);
          src.stop(now + duration + 0.05);
          break;
        }
        case "page": {
          // Page flip: filtered noise swoop
          const duration = 0.32;
          const noiseBuffer = createNoiseBuffer(ac);
          const src = ac.createBufferSource();
          src.buffer = noiseBuffer;

          const filter = ac.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(1200, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + duration);
          filter.Q.value = 1.5;

          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.045, now + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          src.connect(filter).connect(g);
          src.start(now);
          src.stop(now + duration + 0.05);
          break;
        }
        case "marker": {
          // Highlighter drawing sound: bandpass noise rub
          const duration = 0.24;
          const noiseBuffer = createNoiseBuffer(ac);
          const src = ac.createBufferSource();
          src.buffer = noiseBuffer;

          const filter = ac.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(650, now);
          filter.frequency.linearRampToValueAtTime(600, now + duration);
          filter.Q.value = 4.0; // tight bandpass for scratch sound

          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.02, now + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          src.connect(filter).connect(g);
          src.start(now);
          src.stop(now + duration + 0.05);
          break;
        }
        case "levelup": {
          // Level up arpeggio + noise shine sweep
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          notes.forEach((f, idx) => {
            const osc = ac.createOscillator();
            const gg = ac.createGain();
            osc.type = "sine";
            osc.frequency.value = f;
            gg.gain.setValueAtTime(0.0001, now + idx * 0.05);
            gg.gain.linearRampToValueAtTime(0.065, now + idx * 0.05 + 0.02);
            gg.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.45);
            osc.connect(gg).connect(sfxGainRef.current || ac.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.5);
          });

          // sparkle shimmer
          const sh = ac.createOscillator();
          const sg = ac.createGain();
          sh.type = "triangle";
          sh.frequency.setValueAtTime(800, now);
          sh.frequency.exponentialRampToValueAtTime(3000, now + 0.4);
          sg.gain.setValueAtTime(0.0001, now);
          sg.gain.linearRampToValueAtTime(0.03, now + 0.05);
          sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
          sh.connect(sg).connect(sfxGainRef.current || ac.destination);
          sh.start(now);
          sh.stop(now + 0.5);
          break;
        }
        case "achievement": {
          // Joyful arpeggio progression (pentatonic major)
          const notes = [N.C4, N.E4, N.G4, N.C5, N.E5, N.G5];
          notes.forEach((f, idx) => {
            const osc = ac.createOscillator();
            const gg = ac.createGain();
            osc.type = "sine";
            osc.frequency.value = f;
            gg.gain.setValueAtTime(0.0001, now + idx * 0.07);
            gg.gain.linearRampToValueAtTime(0.06, now + idx * 0.07 + 0.02);
            gg.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.5);
            osc.connect(gg).connect(sfxGainRef.current || ac.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.6);
          });
          break;
        }
      }
    },
    [sfxEnabled, sfxVolume, muted, ensure]
  );

  // Auto-start music if not muted on first client interaction
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleFirstGesture() {
      const localMuted = localStorage.getItem("audio.muted");
      const currentMuted = localMuted === null ? true : localMuted === "true";
      const localMusic = localStorage.getItem("audio.musicEnabled");
      const currentMusic = localMusic === null ? true : localMusic === "true";

      if (!currentMuted && currentMusic) {
        startAudioEngine();
      }
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    }

    window.addEventListener("click", handleFirstGesture);
    window.addEventListener("touchstart", handleFirstGesture);

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [startAudioEngine]);

  // Clean up audio engine on provider unmount
  useEffect(() => {
    return () => {
      stopAudioEngine();
    };
  }, [stopAudioEngine]);

  const setMood = useCallback((newMood: Mood) => {
    setMoodState(newMood);
  }, []);

  const setContext = useCallback((newCtx: "dashboard" | "biblia" | "vida" | "estudos") => {
    setContextState(newCtx);
  }, []);

  return (
    <Ctx.Provider
      value={{
        muted,
        musicEnabled,
        sfxEnabled,
        musicVolume,
        sfxVolume,
        autoAdapt,
        setMusicEnabled,
        setSfxEnabled,
        setMusicVolume,
        setSfxVolume,
        setAutoAdapt,
        setContext,
        setMood,
        toggle,
        play,
      }}
    >
      {children}

      <button
        type="button"
        aria-label={muted ? "Ativar som" : "Silenciar"}
        onClick={toggle}
        onMouseEnter={() => play("hover")}
        className="fixed bottom-5 right-5 z-[80] w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-2xl grid place-items-center hover:scale-110 transition-transform"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.2)" }}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </Ctx.Provider>
  );
}
