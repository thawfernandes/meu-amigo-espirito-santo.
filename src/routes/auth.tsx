import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LowPolyWorld } from "@/components/world/LowPolyWorld";
import { useAudio } from "@/components/audio/AudioProvider";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Amigo, Espírito Santo" }] }),
  component: AuthPage,
});

// ── Denominações mais comuns no Brasil ────────────────────────────────────
const DENOMINACOES = [
  "Assembleia de Deus",
  "Batista",
  "Católica",
  "Congregação Cristã",
  "Episcopal Anglicana",
  "Evangelho Quadrangular",
  "Luterana",
  "Metodista",
  "O Brasil Para Cristo",
  "Presbiteriana",
  "Renascer em Cristo",
  "Sara Nossa Terra",
  "Universal do Reino de Deus",
  "Outras / Independente",
];

// ── Partículas leves ────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="absolute rounded-full"
          style={{
            left: `${(i * 53 + 7) % 100}%`,
            top: `${(i * 37 + 3) % 100}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: i % 2 === 0 ? "oklch(0.82 0.14 85 / 0.5)" : "oklch(0.75 0.18 290 / 0.45)",
            animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  borderRadius: "14px",
  padding: "13px 16px",
  fontSize: "0.9rem",
  color: "white",
  background: "oklch(1 0 0 / 0.07)",
  border: "1px solid oklch(1 0 0 / 0.12)",
  outline: "none",
  transition: "all 0.2s",
};

function InputField({
  type, value, onChange, placeholder, label, autoFocus,
}: {
  type?: string; value: string; onChange: (v: string) => void; placeholder: string; label: string; autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPwd = type === "password";

  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={isPwd && !show ? "password" : "text"}
          autoFocus={autoFocus}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...INPUT_BASE,
            paddingRight: isPwd ? "48px" : "16px",
            borderColor: focused ? "oklch(0.75 0.18 290 / 0.6)" : "oklch(1 0 0 / 0.12)",
            background: focused ? "oklch(1 0 0 / 0.1)" : "oklch(1 0 0 / 0.07)",
            boxShadow: focused ? "0 0 0 3px oklch(0.65 0.2 280 / 0.18), 0 0 20px oklch(0.65 0.2 280 / 0.12)" : "none",
          }}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </Field>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...INPUT_BASE,
            paddingRight: "40px",
            appearance: "none",
            cursor: "pointer",
            borderColor: focused ? "oklch(0.75 0.18 290 / 0.6)" : "oklch(1 0 0 / 0.12)",
            background: focused ? "oklch(1 0 0 / 0.1)" : "oklch(1 0 0 / 0.07)",
            boxShadow: focused ? "0 0 0 3px oklch(0.65 0.2 280 / 0.18), 0 0 20px oklch(0.65 0.2 280 / 0.12)" : "none",
          }}
        >
          <option value="" disabled style={{ background: "#1a1535", color: "#aaa" }}>
            Selecione sua denominação…
          </option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ background: "#1a1535", color: "white" }}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      </div>
    </Field>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [denominacao, setDenominacao] = useState("");
  const [busy, setBusy] = useState(false);

  // Quiz answers vindas do sessionStorage
  const quizAnswers = (() => {
    try { return JSON.parse(sessionStorage.getItem("quiz_answers") ?? "null"); } catch { return null; }
  })();
  const quizProfile = sessionStorage.getItem("quiz_profile") ?? "beginner";
  const cameFromQuiz = !!quizAnswers;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === "signup" && !denominacao) {
      toast.error("Por favor, selecione sua denominação.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim() || email.split("@")[0],
              denominacao,
              quiz_profile: quizProfile,
            },
          },
        });
        if (error) throw error;

        // Salvar denominação no perfil
        if (data.user) {
          await supabase.from("profiles").update({ denominacao }).eq("id", data.user.id);
        }

        // Salvar respostas do quiz no banco se existirem
        if (quizAnswers && data.user) {
          await supabase.from("onboarding_quiz").upsert({
            user_id: data.user.id,
            answers: { ...quizAnswers, profile: quizProfile },
          });
          await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", data.user.id);
          sessionStorage.removeItem("quiz_answers");
          sessionStorage.removeItem("quiz_profile");
        }

        audio.play("chime");
        toast.success("Conta criada! Bem-vindo à jornada 🎉");
        navigate({ to: "/dashboard" });

      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        audio.play("chime");
        toast.success("Bem-vindo de volta.");
        navigate({ to: "/dashboard" });

      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("signin");
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      console.error("[Auth] erro:", err);
      const friendly =
        msg.includes("invalid_credentials") || msg.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : msg.includes("email_not_confirmed") || msg.includes("Email not confirmed")
          ? "E-mail ainda não confirmado. Desative a confirmação no painel do Supabase → Authentication → Providers → Email → 'Confirm email'."
          : msg.includes("User already registered") || msg.includes("already registered")
          ? "Este e-mail já possui uma conta."
          : msg.includes("Password should be") || msg.includes("password")
          ? "A senha deve ter no mínimo 6 caracteres."
          : msg.includes("signup_disabled")
          ? "Novos cadastros estão desabilitados no momento."
          : msg.includes("over_email_send_rate_limit")
          ? "Muitas tentativas. Aguarde alguns minutos e tente novamente."
          : msg.includes("network") || msg.includes("fetch")
          ? "Erro de conexão. Verifique sua internet."
          : msg || "Não foi possível continuar. Tente novamente.";
      toast.error(friendly);
    } finally {
      setBusy(false);
    }
  }

  const labels = {
    signin: { eye: "uma porta na trilha", title: "Bem-vindo de volta", btn: "Entrar" },
    signup: { eye: cameFromQuiz ? "seu perfil está pronto" : "um novo começo", title: cameFromQuiz ? "Quase lá! Crie sua conta" : "Começar a jornada", btn: "Criar minha conta" },
    reset:  { eye: "recuperação de conta", title: "Redefinir senha", btn: "Enviar e-mail de recuperação" },
  };
  const l = labels[mode];

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#0d0b1e] text-white">
      {/* Background */}
      <div className="absolute inset-0 opacity-35">
        <LowPolyWorld />
      </div>
      <Particles />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 20%, rgba(8,5,24,.9) 100%)" }} />

      {/* Back link */}
      <Link to="/" className="absolute top-5 left-5 z-30 text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1">
        ← início
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Quiz profile badge */}
          <AnimatePresence>
            {cameFromQuiz && mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4 text-sm"
                style={{ background: "oklch(0.65 0.2 280 / 0.12)", border: "1px solid oklch(0.65 0.2 280 / 0.25)" }}
              >
                <span className="text-violet-300 text-lg">✨</span>
                <div>
                  <p className="text-white/80 font-medium text-xs">Quiz concluído!</p>
                  <p className="text-white/40 text-[11px]">Suas respostas serão salvas automaticamente.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card */}
          <div className="relative">
            {/* Glow aura */}
            <div className="absolute -inset-6 rounded-[2.5rem] opacity-40 blur-2xl"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.2 280 / 0.5), oklch(0.82 0.14 85 / 0.3))" }} />

            <div className="relative rounded-3xl p-7 sm:p-9"
              style={{
                background: "linear-gradient(160deg, oklch(1 0 0 / 0.1), oklch(1 0 0 / 0.04))",
                border: "1px solid oklch(1 0 0 / 0.14)",
                backdropFilter: "blur(32px)",
                boxShadow: "0 32px 80px oklch(0 0 0 / 0.6), 0 1px 0 oklch(1 0 0 / 0.2) inset",
              }}>

              {/* Header */}
              <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[0.65rem] tracking-[0.4em] uppercase text-amber-400/60 mb-2">{l.eye}</p>
                <h1 className="font-display text-3xl sm:text-4xl leading-tight">{l.title}</h1>
              </motion.div>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 mt-7"
                >
                  {mode === "signup" && (
                    <>
                      <InputField
                        label="Como podemos te chamar?"
                        value={name}
                        onChange={setName}
                        placeholder="Seu nome"
                        autoFocus
                      />
                      <SelectField
                        label="Sua denominação / igreja"
                        value={denominacao}
                        onChange={setDenominacao}
                        options={DENOMINACOES}
                      />
                    </>
                  )}

                  <InputField
                    label={mode === "signin" ? "E-mail" : "E-mail para login"}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="voce@exemplo.com"
                    autoFocus={mode !== "signup"}
                  />

                  {mode !== "reset" && (
                    <InputField
                      label="Senha"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                    />
                  )}

                  {/* Submit */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={busy}
                      id="auth-submit-btn"
                      className="w-full rounded-2xl py-4 text-base font-semibold text-white flex items-center justify-center gap-2 relative overflow-hidden transition-all"
                      style={{
                        background: busy
                          ? "oklch(1 0 0 / 0.1)"
                          : "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.68 0.18 260), oklch(0.55 0.2 295))",
                        boxShadow: busy ? "none" : "0 8px 40px oklch(0.65 0.2 280 / 0.45)",
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : l.btn}
                    </motion.button>
                  </div>
                </motion.form>
              </AnimatePresence>

              {/* Footer links */}
              <div className="mt-5 flex flex-col gap-2 text-center">
                {mode === "signin" && (
                  <>
                    <button onClick={() => setMode("signup")}
                      className="text-sm text-white/40 hover:text-white/80 transition-colors">
                      Não tem conta? <span className="text-violet-300 font-medium">Criar agora</span>
                    </button>
                    <button onClick={() => setMode("reset")}
                      className="text-xs text-white/25 hover:text-white/50 transition-colors">
                      Esqueceu a senha?
                    </button>
                  </>
                )}
                {(mode === "signup" || mode === "reset") && (
                  <button onClick={() => setMode("signin")}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    Já tenho conta — <span className="text-violet-300 font-medium">entrar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
