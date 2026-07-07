import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAudio } from "@/components/audio/AudioProvider";
import { Music, Sliders, Sparkles, Smile, Volume2, LogOut, Radio, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: Settings });

function Settings() {
  const audio = useAudio();

  return (
    <AppShell>
      <div className="animate-fade-up max-w-xl mx-auto pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60 font-semibold mb-1">
          Ajustes
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-white">Sua Experiência</h1>
        <p className="text-white/40 mt-1.5 text-sm">
          Personalize o som e a atmosfera da sua caminhada espiritual.
        </p>

        {/* Audio Configuration Section */}
        <div className="mt-8 space-y-6">
          <div
            className="rounded-3xl p-6 border border-white/10 space-y-6"
            style={{ background: "oklch(0.14 0.03 260 / 0.75)", backdropFilter: "blur(24px)" }}
          >
            <h2 className="font-display text-xl text-amber-100 flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-amber-300" />
              <span>Ajustes de Áudio</span>
            </h2>

            {/* Music Controls */}
            <div className="space-y-4 border-b border-white/5 pb-5">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-sky-300" />
                    Música de Fundo
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    Música instrumental generativa de contemplação.
                  </div>
                </div>
                <button
                  onClick={() => audio.setMusicEnabled(!audio.musicEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    audio.musicEnabled ? "bg-amber-400" : "bg-white/10"
                  }`}
                  aria-label="Ativar/Desativar Música"
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform absolute ${
                      audio.musicEnabled ? "translate-x-5.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {audio.musicEnabled && (
                <div className="space-y-2 animate-fade-down">
                  <div className="flex justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" /> Volume da Música
                    </span>
                    <span>{Math.round(audio.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audio.musicVolume}
                    onChange={(e) => audio.setMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>

            {/* SFX Controls */}
            <div className="space-y-4 border-b border-white/5 pb-5">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-300" />
                    Efeitos Sonoros (SFX)
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    Sons de toque, marcações, virar página e nível.
                  </div>
                </div>
                <button
                  onClick={() => audio.setSfxEnabled(!audio.sfxEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    audio.sfxEnabled ? "bg-amber-400" : "bg-white/10"
                  }`}
                  aria-label="Ativar/Desativar Efeitos"
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform absolute ${
                      audio.sfxEnabled ? "translate-x-5.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {audio.sfxEnabled && (
                <div className="space-y-2 animate-fade-down">
                  <div className="flex justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" /> Volume dos Efeitos
                    </span>
                    <span>{Math.round(audio.sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audio.sfxVolume}
                    onChange={(e) => audio.setSfxVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Adaptive Music Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Smile className="w-4 h-4 text-rose-300" />
                  Música Adaptativa Dinâmica
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  Mudar o clima sonoro conforme a emoção do Chibi Jesus.
                </div>
              </div>
              <button
                onClick={() => audio.setAutoAdapt(!audio.autoAdapt)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                  audio.autoAdapt ? "bg-amber-400" : "bg-white/10"
                }`}
                aria-label="Ativar/Desativar Trilha Adaptativa"
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform absolute ${
                    audio.autoAdapt ? "translate-x-5.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Companion Configuration Section */}
          <div
            className="rounded-3xl p-6 border border-white/10 space-y-6"
            style={{ background: "oklch(0.14 0.03 260 / 0.75)", backdropFilter: "blur(24px)" }}
          >
            <h2 className="font-display text-xl text-rose-200 flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>O Companheiro</span>
            </h2>

            {/* Animations Toggle */}
            <div className="space-y-4 border-b border-white/5 pb-5">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-300" />
                    Animações e Vida
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    Permite que o personagem pisque, respire e reaja à sua navegação.
                  </div>
                </div>
                <button
                  onClick={() => audio.setCompanionAnimationsEnabled(!audio.companionAnimationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    audio.companionAnimationsEnabled ? "bg-amber-400" : "bg-white/10"
                  }`}
                  aria-label="Ativar/Desativar Animações"
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform absolute ${
                      audio.companionAnimationsEnabled ? "translate-x-5.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Companion Sounds Toggle */}
            <div className="space-y-4 border-b border-white/5 pb-5">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-rose-300" />
                    Sons de Interação
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    Pequenos murmúrios, risadinhas e bocejos.
                  </div>
                </div>
                <button
                  onClick={() => audio.setCompanionSoundsEnabled(!audio.companionSoundsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    audio.companionSoundsEnabled ? "bg-amber-400" : "bg-white/10"
                  }`}
                  aria-label="Ativar/Desativar Sons do Personagem"
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform absolute ${
                      audio.companionSoundsEnabled ? "translate-x-5.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {audio.companionSoundsEnabled && (
                <div className="space-y-2 animate-fade-down">
                  <div className="flex justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" /> Volume do Personagem
                    </span>
                    <span>{Math.round(audio.companionVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audio.companionVolume}
                    onChange={(e) => audio.setCompanionVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Account Settings / General Section */}
          <div
            className="rounded-3xl p-6 border border-white/10 space-y-4"
            style={{ background: "oklch(0.14 0.03 260 / 0.75)", backdropFilter: "blur(24px)" }}
          >
            <h2 className="font-display text-xl text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Geral & Conta</span>
            </h2>
            <p className="text-xs text-white/40 text-left">
              Mais opções em breve: temas personalizados, fontes bíblicas, notificações e backups.
            </p>
            <div className="pt-2 flex justify-start">
              <button
                onClick={async () => {
                  audio.play("click");
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all flex items-center gap-2 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
