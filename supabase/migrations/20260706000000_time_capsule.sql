-- ============================================================
-- Criação do módulo Cápsula do Tempo
-- ============================================================

CREATE TABLE IF NOT EXISTS public.time_capsules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year       TEXT NOT NULL, -- formato YYYY-MM
  blessings        JSONB NOT NULL DEFAULT '[]'::jsonb,
  prayer_requests  JSONB NOT NULL DEFAULT '[]'::jsonb,
  answered_prayers JSONB NOT NULL DEFAULT '[]'::jsonb,
  struggles        JSONB NOT NULL DEFAULT '[]'::jsonb,
  learnings        JSONB NOT NULL DEFAULT '[]'::jsonb,
  favorite_verses  JSONB NOT NULL DEFAULT '[]'::jsonb,
  events           JSONB NOT NULL DEFAULT '[]'::jsonb,
  media_links      JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Permissões e RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_capsules TO authenticated;
GRANT ALL ON public.time_capsules TO service_role;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_capsules_self_all" ON public.time_capsules
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger de atualização
CREATE TRIGGER time_capsules_updated 
  BEFORE UPDATE ON public.time_capsules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
