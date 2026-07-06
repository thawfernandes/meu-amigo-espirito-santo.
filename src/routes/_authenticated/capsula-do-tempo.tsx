import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Plus,
  CalendarHeart,
  Sparkles,
  BookOpen,
  Music,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/capsula-do-tempo")({
  component: TimeCapsulePage,
});

type TimeCapsule = {
  id: string;
  user_id: string;
  month_year: string;
  blessings: string[];
  prayer_requests: string[];
  answered_prayers: string[];
  struggles: string[];
  learnings: string[];
  favorite_verses: string[];
  events: string[];
  media_links: string[];
  photos: string[];
  audios: string[];
  objectives: string[];
  free_notes: string[];
};

function TimeCapsulePage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const currentMonthYear = format(new Date(), "yyyy-MM");

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);
  const [isRetrospectiveOpen, setIsRetrospectiveOpen] = useState(false);

  // Buscar cápsula do mês selecionado
  const { data: capsule, isLoading } = useQuery({
    queryKey: ["time-capsule", userId, selectedMonth],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("time_capsules")
        .select("*")
        .eq("user_id", userId)
        .eq("month_year", selectedMonth)
        .maybeSingle();

      if (error) throw error;

      // Se não existir, retorna um modelo vazio para a UI renderizar o form
      if (!data) {
        return {
          month_year: selectedMonth,
          blessings: [],
          prayer_requests: [],
          answered_prayers: [],
          struggles: [],
          learnings: [],
          favorite_verses: [],
          events: [],
          media_links: [],
          photos: [],
          audios: [],
          objectives: [],
          free_notes: [],
        } as Partial<TimeCapsule>;
      }
      return data as TimeCapsule;
    },
    enabled: !!userId && !!selectedMonth,
  });

  // Mutação para salvar a cápsula
  const saveMutation = useMutation({
    mutationFn: async (updatedData: Partial<TimeCapsule>) => {
      if (!userId) throw new Error("Usuário não autenticado");

      const payload = {
        ...updatedData,
        user_id: userId,
        month_year: selectedMonth,
      };

      const { data, error } = await supabase
        .from("time_capsules")
        .upsert(payload, { onConflict: "user_id,month_year" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newCapsule) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["time-capsule", userId, selectedMonth] });
      const previous = queryClient.getQueryData(["time-capsule", userId, selectedMonth]);
      queryClient.setQueryData(["time-capsule", userId, selectedMonth], (old: any) => ({
        ...old,
        ...newCapsule,
      }));
      return { previous };
    },
    onError: (err, newCapsule, context) => {
      queryClient.setQueryData(["time-capsule", userId, selectedMonth], context?.previous);
      toast.error("Erro ao salvar informações");
    },
    onSuccess: () => {
      toast.success("Cápsula salva no coração de Deus!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["time-capsule", userId, selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["time-capsule-all", userId] });
    },
  });

  // Buscar todos os meses para o histórico
  const { data: allCapsules } = useQuery({
    queryKey: ["time-capsule-all", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("time_capsules")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: false });
      if (error) throw error;
      return data as TimeCapsule[];
    },
    enabled: !!userId,
  });

  const [localNotes, setLocalNotes] = useState("");

  useEffect(() => {
    if (capsule) {
      setLocalNotes(capsule.free_notes?.join("\n") || "");
    }
  }, [capsule?.id, selectedMonth]);

  // Helper para adicionar item a um array específico
  const handleAddItem = (field: keyof TimeCapsule, value: string) => {
    if (!value.trim() || !capsule) return;
    const currentArray = (capsule[field] as string[]) || [];
    saveMutation.mutate({
      [field]: [...currentArray, value.trim()],
    });
  };

  // Helper para remover item
  const handleRemoveItem = (field: keyof TimeCapsule, index: number) => {
    if (!capsule) return;
    const currentArray = (capsule[field] as string[]) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    saveMutation.mutate({ [field]: newArray });
  };

  // Renderizador de seção
  const Section = ({
    title,
    field,
    icon,
    placeholder,
  }: {
    title: string;
    field: keyof TimeCapsule;
    icon: React.ReactNode;
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState("");
    const items = (capsule?.[field] as string[]) || [];

    return (
      <AccordionItem value={field} className="border-none rounded-2xl mb-3 shadow-sm px-4" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl text-fuchsia-400" style={{ background: "oklch(0.65 0.18 255 / 0.15)" }}>{icon}</div>
            <span className="font-medium text-lg">{title}</span>
            {items.length > 0 && (
              <span className="ml-2 bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddItem(field, inputValue);
                    setInputValue("");
                  }
                }}
                className="text-white placeholder:text-white/30 border-white/10"
                style={{ background: "oklch(1 0 0 / 0.05)" }}
              />
              <Button
                onClick={() => {
                  handleAddItem(field, inputValue);
                  setInputValue("");
                }}
                disabled={!inputValue.trim() || saveMutation.isPending}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <ul className="space-y-2 mt-4">
                {items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-start gap-2 p-3 rounded-xl animate-in slide-in-from-left-2"
                    style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.05)" }}
                  >
                    <span className="text-sm leading-relaxed text-white/80">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(field, idx)}
                      className="text-white/40 hover:text-rose-400 shrink-0 transition-colors"
                      title="Remover"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const MediaSection = ({
    title,
    field,
    icon,
    accept,
  }: {
    title: string;
    field: "photos" | "audios";
    icon: React.ReactNode;
    accept: string;
  }) => {
    const items = (capsule?.[field] as string[]) || [];
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !userId) return;

      try {
        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${selectedMonth}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("capsule-media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("capsule-media").getPublicUrl(fileName);

        handleAddItem(field, publicUrl);
        toast.success("Arquivo enviado com sucesso!");
      } catch (err: any) {
        toast.error("Erro ao enviar arquivo: " + err.message);
      } finally {
        setUploading(false);
      }
    };

    return (
      <AccordionItem value={field} className="border-none rounded-2xl mb-3 shadow-sm px-4" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl text-fuchsia-400" style={{ background: "oklch(0.65 0.18 255 / 0.15)" }}>{icon}</div>
            <span className="font-medium text-lg">{title}</span>
            {items.length > 0 && (
              <span className="ml-2 bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-4 pt-2">
            <div>
              <Input
                type="file"
                accept={accept}
                onChange={handleUpload}
                disabled={uploading || saveMutation.isPending}
                className="cursor-pointer text-white file:text-fuchsia-300 file:bg-fuchsia-500/20 file:border-0 file:rounded file:px-3 file:py-1 file:mr-4 file:cursor-pointer border-white/10"
                style={{ background: "oklch(1 0 0 / 0.05)" }}
              />
              {uploading && (
                <p className="text-xs text-white/50 mt-2 animate-pulse">
                  Enviando arquivo para a nuvem...
                </p>
              )}
            </div>

            {items.length > 0 && (
              <ul className="space-y-4 mt-4">
                {items.map((url, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start gap-4 p-3 rounded-xl"
                    style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.05)" }}
                  >
                    {field === "photos" ? (
                      <img
                        src={url}
                        alt="Cápsula"
                        className="w-full sm:w-48 h-32 object-cover rounded shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <audio controls src={url} className="w-full sm:w-auto" />
                    )}
                    <button
                      onClick={() => handleRemoveItem(field, idx)}
                      className="text-rose-400 hover:text-rose-300 text-sm font-medium shrink-0 transition-colors bg-rose-500/10 px-3 py-1 rounded-lg"
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const getMonthName = (yyyyMM: string) => {
    try {
      const date = parseISO(`${yyyyMM}-01`);
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return yyyyMM;
    }
  };

  return (
    <AppShell>
      <div className="animate-fade-up mb-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-white">
              Cápsula do Tempo
            </h1>
            <p className="text-white/40 mt-1.5 text-sm max-w-xl">
              Registre sua caminhada com Deus. Guarde as bênçãos, orações e aprendizados de cada mês
              para relembrar Suas maravilhas no futuro.
            </p>
          </div>

          <Dialog open={isRetrospectiveOpen} onOpenChange={setIsRetrospectiveOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="gap-2 text-white transition-all hover:brightness-110 border-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                  boxShadow: "0 4px 16px oklch(0.58 0.2 280 / 0.3)"
                }}
              >
                <Sparkles className="w-4 h-4" />
                Ver Retrospectiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-white/10 text-white" style={{ background: "oklch(0.15 0.05 260 / 0.95)", backdropFilter: "blur(20px)" }}>
              <DialogHeader className="p-6 pb-4 border-b border-white/10">
                <DialogTitle className="text-2xl flex items-center gap-2 font-display text-white">
                  <Sparkles className="w-6 h-6 text-fuchsia-400" />
                  Sua Caminhada Anual
                </DialogTitle>
                <DialogDescription className="text-white/50">
                  Tudo o que Deus fez na sua vida ao longo dos meses registrados.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6">
                {!allCapsules?.length ? (
                  <div className="text-center text-white/40 py-12">
                    Você ainda não possui registros na cápsula do tempo.
                  </div>
                ) : (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {allCapsules.map((cap) => (
                      <div
                        key={cap.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-transparent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))" }}>
                          <CalendarHeart className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm text-left" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                          <h3 className="font-display text-lg text-fuchsia-300 capitalize mb-2">
                            {getMonthName(cap.month_year)}
                          </h3>
                          {cap.free_notes?.length > 0 && (
                            <div className="mb-2">
                              <strong className="text-sm text-white/80">Anotações:</strong>
                              <p className="text-sm text-white/50 mt-1 whitespace-pre-wrap line-clamp-3">
                                {cap.free_notes.join("\n")}
                              </p>
                            </div>
                          )}
                          {(cap.photos?.length > 0 || cap.audios?.length > 0 || cap.media_links?.length > 0) && (
                            <div className="mt-2 text-xs text-fuchsia-400/80 font-medium">
                              Contém mídias anexadas
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 h-fit p-4 rounded-2xl border" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
            <h3 className="text-lg font-display text-white mb-4">Linha do Tempo</h3>
            <div className="flex flex-col gap-2">
              {[...Array(12)].map((_, i) => {
                const date = new Date(new Date().getFullYear(), i, 1);
                const yyyyMM = format(date, "yyyy-MM");
                const isSelected = selectedMonth === yyyyMM;
                const hasData = allCapsules?.some((c) => c.month_year === yyyyMM);

                if (date > new Date() && !hasData) return null;

                return (
                  <button
                    key={yyyyMM}
                    className={`justify-start text-left capitalize px-4 py-2.5 rounded-xl transition-all flex items-center ${isSelected ? "font-semibold shadow-md" : ""}`}
                    style={
                      isSelected
                        ? {
                            background: "linear-gradient(135deg, oklch(0.65 0.18 255 / 0.25), oklch(0.58 0.2 280 / 0.15))",
                            border: "1px solid oklch(0.65 0.18 255 / 0.4)",
                            color: "oklch(0.85 0.1 255)",
                          }
                        : {
                            background: "oklch(1 0 0 / 0.02)",
                            border: "1px solid oklch(1 0 0 / 0.05)",
                            color: "oklch(1 0 0 / 0.5)",
                          }
                    }
                    onClick={() => setSelectedMonth(yyyyMM)}
                  >
                    {format(date, "MMMM", { locale: ptBR })}
                    {hasData && !isSelected && (
                      <CheckCircle2 className="w-3 h-3 ml-auto text-fuchsia-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display capitalize text-white">
                {getMonthName(selectedMonth)}
              </h2>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400" />}
            </div>

            <div className="p-4 rounded-2xl border shadow-sm mb-6" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-fuchsia-400" />
                Suas Anotações
              </h3>
              <Textarea
                placeholder="Escreva aqui como foi o seu mês, orações, bênçãos..."
                className="min-h-[300px] resize-y text-white placeholder:text-white/30 border-white/10"
                style={{ background: "oklch(1 0 0 / 0.02)" }}
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={() => {
                  if (localNotes !== (capsule?.free_notes?.join("\n") || "")) {
                    saveMutation.mutate({ free_notes: [localNotes] });
                  }
                }}
              />
              <div className="flex justify-end mt-3">
                <Button
                  disabled={saveMutation.isPending || localNotes === (capsule?.free_notes?.join("\n") || "")}
                  onClick={() => saveMutation.mutate({ free_notes: [localNotes] })}
                  className="text-white border-0 transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.58 0.2 280), oklch(0.50 0.22 300))",
                  }}
                >
                  {saveMutation.isPending ? "Salvando..." : "Salvar Anotações"}
                </Button>
              </div>
            </div>

            <Accordion
              type="multiple"
              className="w-full space-y-4"
            >
              <Section
                field="media_links"
                title="Links (Vídeos/Louvores)"
                icon={<Music className="w-5 h-5" />}
                placeholder="Ex: https://youtube.com/..."
              />
              <MediaSection
                field="photos"
                title="Fotos"
                icon={<Camera className="w-5 h-5" />}
                accept="image/*"
              />
              <MediaSection
                field="audios"
                title="Áudios"
                icon={<Music className="w-5 h-5" />}
                accept="audio/*"
              />
            </Accordion>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
