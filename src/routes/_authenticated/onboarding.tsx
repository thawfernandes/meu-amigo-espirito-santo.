import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SpiritCharacter } from "@/components/SpiritCharacter";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

interface Q {
  key: string;
  title: string;
  subtitle?: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Q[] = [
  {
    key: "bible_complete",
    title: "Você já leu toda a Bíblia?",
    subtitle: "Não tem certo ou errado — só queremos te conhecer.",
    options: [
      { value: "no", label: "Ainda não" },
      { value: "partial", label: "Algumas partes" },
      { value: "once", label: "Uma vez" },
      { value: "many", label: "Várias vezes" },
    ],
  },
  {
    key: "studies",
    title: "Você costuma estudar a Palavra?",
    options: [
      { value: "rarely", label: "Raramente" },
      { value: "sometimes", label: "Às vezes" },
      { value: "weekly", label: "Semanalmente" },
      { value: "daily", label: "Todos os dias" },
    ],
  },
  {
    key: "format",
    title: "Você prefere ouvir ou ler?",
    options: [
      { value: "read", label: "Ler" },
      { value: "listen", label: "Ouvir" },
      { value: "both", label: "Os dois" },
    ],
  },
  {
    key: "pray",
    title: "Você ora diariamente?",
    options: [
      { value: "no", label: "Quase nunca" },
      { value: "sometimes", label: "Às vezes" },
      { value: "daily", label: "Sim, todos os dias" },
    ],
  },
  {
    key: "time",
    title: "Quanto tempo costuma dedicar para Deus por dia?",
    options: [
      { value: "5", label: "Até 5 minutos" },
      { value: "15", label: "10–15 minutos" },
      { value: "30", label: "Cerca de 30 minutos" },
      { value: "60", label: "Mais de 1 hora" },
    ],
  },
  {
    key: "difficulty",
    title: "Sente dificuldade em compreender alguns textos?",
    options: [
      { value: "often", label: "Frequentemente" },
      { value: "sometimes", label: "Às vezes" },
      { value: "rarely", label: "Raramente" },
    ],
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  async function finish(final: Record<string, string>) {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("onboarding_quiz").upsert({ user_id: u.user.id, answers: final });
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", u.user.id);
      toast.success("Tudo pronto! Sua jornada começa agora.");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error("Não foi possível salvar. Tente novamente.");
      setSaving(false);
    }
  }

  function pick(value: string) {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (isLast) finish(next);
    else setStep(step + 1);
  }

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-5">
          <SpiritCharacter size={64} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Personalização</p>
            <h1 className="font-display text-xl">Vamos conhecer você melhor</h1>
          </div>
          <span className="text-xs text-muted-foreground">{step + 1}/{QUESTIONS.length}</span>
        </div>

        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div key={q.key} className="glass-strong rounded-3xl p-7 animate-fade-up">
          <h2 className="font-display text-2xl sm:text-3xl">{q.title}</h2>
          {q.subtitle && <p className="text-sm text-muted-foreground mt-2">{q.subtitle}</p>}

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {q.options.map((o) => (
              <button
                key={o.value}
                disabled={saving}
                onClick={() => pick(o.value)}
                className="text-left rounded-2xl border bg-card px-4 py-4 hover:border-primary hover:bg-accent transition-all hover:-translate-y-0.5"
              >
                <span className="text-sm font-medium">{o.label}</span>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground mt-6">
            Suas respostas servem apenas para personalizar sua experiência. Nunca medimos sua espiritualidade.
          </p>
        </div>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-5 text-xs text-muted-foreground hover:text-foreground">
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
}
