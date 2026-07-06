-- ============================================================
-- EXPANSÃO DA CÁPSULA DO TEMPO & HISTÓRICO DE ANOTAÇÕES
-- ============================================================

-- 1. Histórico de Anotações (verse_notes_history)
CREATE TABLE IF NOT EXISTS public.verse_notes_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id    UUID NOT NULL REFERENCES public.verse_notes(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  version_created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT ON public.verse_notes_history TO authenticated;
GRANT ALL ON public.verse_notes_history TO service_role;

-- RLS
ALTER TABLE public.verse_notes_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "verse_notes_history_self_read" ON public.verse_notes_history;
CREATE POLICY "verse_notes_history_self_read" ON public.verse_notes_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Função de Trigger para versionamento
CREATE OR REPLACE FUNCTION public.log_verse_note_history()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Se o conteúdo mudou de fato (e não estava vazio antes)
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.verse_notes_history (note_id, user_id, content, version_created_at)
    VALUES (OLD.id, OLD.user_id, OLD.content, now());
  END IF;
  RETURN NEW;
END;
$$;

-- Aplica o trigger (garantindo que seja recriado se já existir)
DROP TRIGGER IF EXISTS tr_log_verse_note_history ON public.verse_notes;
CREATE TRIGGER tr_log_verse_note_history
  BEFORE UPDATE ON public.verse_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_verse_note_history();


-- 2. Expansão da Tabela time_capsules
-- (Como já usamos JSONB na primeira migração, a flexibilidade já existe, 
--  mas vamos adicionar uma coluna específica para "objectives" caso não esteja no form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_capsules' AND column_name = 'objectives'
  ) THEN
    ALTER TABLE public.time_capsules ADD COLUMN objectives JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;


-- 3. Criação do Bucket de Storage: capsule-media
-- OBS: Esta inserção é idempotente por causa da chave primária (id) ignorando conflitos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capsule-media', 
  'capsule-media', 
  false, -- Privado
  10485760, -- 10MB
  '{"image/*", "audio/*"}'
)
ON CONFLICT (id) DO UPDATE SET 
  public = false, 
  allowed_mime_types = '{"image/*", "audio/*"}';

-- Políticas de RLS para o bucket
DROP POLICY IF EXISTS "Usuários podem ver suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem ver suas próprias mídias"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Usuários podem enviar suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem enviar suas próprias mídias"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Usuários podem excluir suas próprias mídias" ON storage.objects;
CREATE POLICY "Usuários podem excluir suas próprias mídias"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'capsule-media' AND auth.uid()::text = (storage.foldername(name))[1]);
