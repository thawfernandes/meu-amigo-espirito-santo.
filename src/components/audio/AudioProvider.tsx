import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Sfx = "hover" | "click" | "select" | "chime" | "swoosh";

type AudioCtx = {
  muted: boolean;
  toggle: () => void;
  play: (s: Sfx) => void;
};

const Ctx = createContext<AudioCtx | null>(null);

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) return { muted: true, toggle: () => {}, play: () => {} } as AudioCtx;
  return c;
}

// Frequencies (Hz) for a peaceful C major / A minor pentatonic-ish set
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
};

// A gentle, hymn-like melody (relative beats, freq). Beat = 0.55s.
const MELODY: Array<[number, number, number]> = [
  // [startBeat, durationBeats, freq]
  [0, 2, N.E4], [2, 2, N.G4], [4, 3, N.A4], [7, 1, N.G4],
  [8, 2, N.E4], [10, 2, N.D4], [12, 4, N.C4],
  [16, 2, N.E4], [18, 2, N.G4], [20, 2, N.C5], [22, 2, N.B4],
  [24, 3, N.A4], [27, 1, N.G4], [28, 4, N.E4],
];
const MELODY_LENGTH = 32; // beats

// Soft pad chord progression (root notes), one per 8 beats
const PAD: Array<[number, number[]]> = [
  [0, [N.C4, N.E4, N.G4]],
  [8, [N.A4 / 2, N.C4, N.E4]],   // Am-ish low
  [16, [N.F4, N.A4, N.C5]],
  [24, [N.G4, N.B4, N.D5]],
];

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const acRef = useRef<AudioContext | null>(null);
  const stopFnRef = useRef<(() => void) | null>(null);
  const loopTimerRef = useRef<number | null>(null);

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

  const scheduleBar = useCallback((ac: AudioContext, master: GainNode, startTime: number, beat: number) => {
    // Melody — bell-like sine with quick attack + long release
    MELODY.forEach(([s, d, f]) => {
      const t0 = startTime + s * beat;
      const dur = d * beat * 0.9;
      const o = ac.createOscillator();
      const o2 = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine"; o2.type = "triangle";
      o.frequency.value = f;
      o2.frequency.value = f * 2.005; // shimmer octave
      const g2 = ac.createGain();
      g2.gain.value = 0.18;
      o2.connect(g2).connect(g);
      o.connect(g);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      g.connect(master);
      o.start(t0); o2.start(t0);
      o.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
    });

    // Pad chords — soft warm sustain
    PAD.forEach(([s, notes]) => {
      const t0 = startTime + s * beat;
      const dur = 8 * beat;
      notes.forEach((f) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.035, t0 + 1.2);
        g.gain.setValueAtTime(0.035, t0 + dur - 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(master);
        o.start(t0); o.stop(t0 + dur + 0.1);
      });
    });
  }, []);

  const startMusic = useCallback(() => {
    const ac = ensure();
    if (!ac) return;

    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.5, ac.currentTime + 2);

    // Gentle low-pass + reverb-ish delay for warmth
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2800;
    lp.Q.value = 0.6;

    const delay = ac.createDelay(1.0);
    delay.delayTime.value = 0.33;
    const feedback = ac.createGain();
    feedback.gain.value = 0.28;
    const wet = ac.createGain();
    wet.gain.value = 0.35;

    master.connect(lp);
    lp.connect(ac.destination);
    lp.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(ac.destination);

    const beat = 0.55;
    const barLen = MELODY_LENGTH * beat;
    let nextStart = ac.currentTime + 0.2;

    const scheduleAhead = () => {
      while (nextStart < ac.currentTime + 2 * barLen) {
        scheduleBar(ac, master, nextStart, beat);
        nextStart += barLen;
      }
    };
    scheduleAhead();
    loopTimerRef.current = window.setInterval(scheduleAhead, 4000);

    stopFnRef.current = () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      const now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
    };
  }, [ensure, scheduleBar]);

  const stopMusic = useCallback(() => {
    stopFnRef.current?.();
    stopFnRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next) stopMusic();
      else startMusic();
      return next;
    });
  }, [startMusic, stopMusic]);

  const play = useCallback(
    (s: Sfx) => {
      if (muted) return;
      const ac = ensure();
      if (!ac) return;
      const now = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      g.connect(ac.destination);
      o.connect(g);

      switch (s) {
        case "hover": {
          o.type = "sine";
          o.frequency.setValueAtTime(880, now);
          o.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.03, now + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
          o.start(now); o.stop(now + 0.2);
          break;
        }
        case "click": {
          o.type = "triangle";
          o.frequency.setValueAtTime(660, now);
          o.frequency.exponentialRampToValueAtTime(330, now + 0.12);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          o.start(now); o.stop(now + 0.25);
          break;
        }
        case "select": {
          [523.25, 659.25, 783.99].forEach((f, i) => {
            const oo = ac.createOscillator();
            const gg = ac.createGain();
            oo.type = "sine";
            oo.frequency.value = f;
            gg.gain.setValueAtTime(0, now + i * 0.05);
            gg.gain.linearRampToValueAtTime(0.07, now + i * 0.05 + 0.02);
            gg.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.35);
            oo.connect(gg).connect(ac.destination);
            oo.start(now + i * 0.05); oo.stop(now + i * 0.05 + 0.4);
          });
          break;
        }
        case "chime": {
          o.type = "sine";
          o.frequency.value = 1318.5;
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.08, now + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          o.start(now); o.stop(now + 1.25);
          break;
        }
        case "swoosh": {
          const bs = 0.5 * ac.sampleRate;
          const buf = ac.createBuffer(1, bs, ac.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1);
          const src = ac.createBufferSource();
          src.buffer = buf;
          const bp = ac.createBiquadFilter();
          bp.type = "bandpass";
          bp.frequency.setValueAtTime(400, now);
          bp.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
          const gg = ac.createGain();
          gg.gain.setValueAtTime(0, now);
          gg.gain.linearRampToValueAtTime(0.1, now + 0.05);
          gg.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
          src.connect(bp).connect(gg).connect(ac.destination);
          src.start(now); src.stop(now + 0.6);
          break;
        }
      }
    },
    [muted, ensure]
  );

  useEffect(() => () => stopMusic(), [stopMusic]);

  return (
    <Ctx.Provider value={{ muted, toggle, play }}>
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
      {muted && (
        <div className="fixed bottom-20 right-5 z-[80] text-xs text-white/70 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/15 pointer-events-none animate-pulse">
          🎵 Ative o som
        </div>
      )}
    </Ctx.Provider>
  );
}
