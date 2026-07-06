import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
      <AccordionItem value={field} className="border-muted bg-card px-4 rounded-lg mb-2 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
            <span className="font-medium text-lg">{title}</span>
            {items.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
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
              />
              <Button
                onClick={() => {
                  handleAddItem(field, inputValue);
                  setInputValue("");
                }}
                disabled={!inputValue.trim() || saveMutation.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <ul className="space-y-2 mt-4">
                {items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-start gap-2 bg-muted/50 p-3 rounded-md animate-in slide-in-from-left-2"
                  >
                    <span className="text-sm leading-relaxed">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(field, idx)}
                      className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
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
      <AccordionItem value={field} className="border-muted bg-card px-4 rounded-lg mb-2 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
            <span className="font-medium text-lg">{title}</span>
            {items.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
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
                className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded file:px-3 file:py-1 file:mr-4 file:cursor-pointer"
              />
              {uploading && (
                <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                  Enviando arquivo para a nuvem...
                </p>
              )}
            </div>

            {items.length > 0 && (
              <ul className="space-y-4 mt-4">
                {items.map((url, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-muted/50 p-3 rounded-md"
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
                      className="text-destructive hover:text-destructive/80 text-sm font-medium shrink-0 transition-colors bg-destructive/10 px-3 py-1 rounded"
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
    <div className="container max-w-4xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarHeart className="w-8 h-8 text-primary" />
            Cápsula do Tempo
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Registre sua caminhada com Deus. Guarde as bênçãos, orações e aprendizados de cada mês
            para relembrar Suas maravilhas no futuro.
          </p>
        </div>

        <Dialog open={isRetrospectiveOpen} onOpenChange={setIsRetrospectiveOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
              <Sparkles className="w-4 h-4" />
              Ver Retrospectiva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="p-6 bg-primary/5 pb-4 border-b">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Sua Caminhada Anual
              </DialogTitle>
              <DialogDescription>
                Tudo o que Deus fez na sua vida ao longo dos meses registrados.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6">
              {!allCapsules?.length ? (
                <div className="text-center text-muted-foreground py-12">
                  Você ainda não possui registros na cápsula do tempo.
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {allCapsules.map((cap) => (
                    <div
                      key={cap.id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CalendarHeart className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg text-primary capitalize mb-2">
                          {getMonthName(cap.month_year)}
                        </h3>
                        {cap.free_notes?.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-sm">Anotações:</strong>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                              {cap.free_notes.join("\n")}
                            </p>
                          </div>
                        )}
                        {(cap.photos?.length > 0 || cap.audios?.length > 0 || cap.media_links?.length > 0) && (
                          <div className="mt-2 text-xs text-primary/80 font-medium">
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
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {[...Array(12)].map((_, i) => {
                const date = new Date(new Date().getFullYear(), i, 1);
                const yyyyMM = format(date, "yyyy-MM");
                const isSelected = selectedMonth === yyyyMM;
                const hasData = allCapsules?.some((c) => c.month_year === yyyyMM);

                // Só mostra o mês se for passado/atual, ou se tiver dados
                if (date > new Date() && !hasData) return null;

                return (
                  <Button
                    key={yyyyMM}
                    variant={isSelected ? "default" : hasData ? "secondary" : "ghost"}
                    className={`justify-start capitalize ${isSelected ? "shadow-md" : ""}`}
                    onClick={() => setSelectedMonth(yyyyMM)}
                  >
                    {format(date, "MMMM", { locale: ptBR })}
                    {hasData && !isSelected && (
                      <CheckCircle2 className="w-3 h-3 ml-auto text-primary" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold capitalize text-primary">
              {getMonthName(selectedMonth)}
            </h2>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="bg-card p-4 rounded-xl border shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Suas Anotações
            </h3>
            <Textarea
              placeholder="Escreva aqui como foi o seu mês, orações, bênçãos..."
              className="min-h-[300px] resize-y bg-background"
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
                variant="default"
                disabled={saveMutation.isPending || localNotes === (capsule?.free_notes?.join("\n") || "")}
                onClick={() => saveMutation.mutate({ free_notes: [localNotes] })}
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
  );
}
