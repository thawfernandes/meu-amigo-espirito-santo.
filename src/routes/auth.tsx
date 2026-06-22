import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LowPolyWorld } from "@/components/world/LowPolyWorld";
import { MagicButton } from "@/components/ui/MagicButton";
import { useAudio } from "@/components/audio/AudioProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Amigo, Espírito Santo" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        audio.play("chime");
        toast.success("Conta criada! Bem-vindo.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        audio.play("chime");
        toast.success("Bem-vindo de volta.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (r.error) throw r.error;
      if (!r.redirected) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro com Google.");
      setBusy(false);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1340] text-white">
      <LowPolyWorld />
      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 30%, rgba(20,8,40,.65) 100%)" }} />

      <Link to="/" className="absolute top-6 left-6 z-30 text-sm text-amber-100/80 hover:text-white transition" onMouseEnter={() => audio.play("hover")}>
        ← voltar ao mundo
      </Link>

      <div className="absolute inset-0 z-20 grid place-items-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative"
          style={{ transformPerspective: 1000 }}
        >
          {/* glow */}
          <div className="absolute -inset-6 rounded-[2rem] opacity-50 blur-2xl"
            style={{ background: "linear-gradient(135deg,#ffb45a,#ff7aa8,#a06bff)" }} />

          <div className="relative rounded-[1.8rem] border border-white/15 p-7 sm:p-8 backdrop-blur-2xl"
            style={{ background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04))", boxShadow: "0 30px 80px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.25)" }}>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-[0.7rem] tracking-[0.35em] uppercase text-amber-100/70">
                {mode === "signin" ? "uma porta na trilha" : "um novo começo"}
              </p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
                {mode === "signin" ? "Bem-vindo de volta" : "Comece sua jornada"}
              </h1>
            </motion.div>

            <button
              onClick={handleGoogle}
              disabled={busy}
              onMouseEnter={() => audio.play("hover")}
              className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-3 text-sm font-medium transition disabled:opacity-60"
            >
              <GoogleIcon /> Continuar com Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-amber-100/60">
              <div className="h-px flex-1 bg-white/15" /> ou <div className="h-px flex-1 bg-white/15" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              {mode === "signup" && (
                <Field label="Como podemos te chamar?">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="glow-input" placeholder="Seu nome" />
                </Field>
              )}
              <Field label="E-mail">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glow-input" placeholder="voce@exemplo.com" />
              </Field>
              <Field label="Senha">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="glow-input" placeholder="••••••••" />
              </Field>

              <div className="pt-2 flex justify-center">
                <MagicButton type="submit" disabled={busy}>
                  {busy ? "Aguarde..." : mode === "signin" ? "Entrar no mundo" : "Criar meu mundo"}
                </MagicButton>
              </div>
            </form>

            <p className="text-center text-sm text-amber-50/70 mt-5">
              {mode === "signin" ? "Ainda não tem conta? " : "Já possui conta? "}
              <button
                onClick={() => { audio.play("click"); setMode(mode === "signin" ? "signup" : "signin"); }}
                className="text-amber-200 underline-offset-4 hover:underline"
              >
                {mode === "signin" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .glow-input {
          width: 100%; border-radius: 1rem; padding: .75rem 1rem; font-size: .9rem; color: white;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
          outline: none; transition: box-shadow .25s, border-color .25s, background .25s;
        }
        .glow-input::placeholder { color: rgba(255,235,200,.45); }
        .glow-input:focus { border-color: rgba(255,200,140,.7); background: rgba(255,255,255,.14);
          box-shadow: 0 0 0 4px rgba(255,180,90,.18), 0 0 30px rgba(255,180,90,.25); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-amber-100/70">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9C29 35.4 26.6 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.3 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6 4.9c-.4.4 6.4-4.7 6.4-14.5 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
