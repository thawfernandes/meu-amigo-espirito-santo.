-- ============================================================
-- FULL SYNC MIGRATION — todos os dados do usuário no Supabase
-- ============================================================

-- 1. CADERNOS DE ESTUDO (substitui localStorage "bible.notebooks")
CREATE TABLE IF NOT EXISTS public.study_notebooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'Geral',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'progress' CHECK (status IN ('progress','completed')),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_notebooks TO authenticated;
GRANT ALL ON public.study_notebooks TO service_role;
ALTER TABLE public.study_notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notebooks_self_all" ON public.study_notebooks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER notebooks_updated BEFORE UPDATE ON public.study_notebooks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. PÁGINAS DENTRO DE CADERNOS
CREATE TABLE IF NOT EXISTS public.study_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.study_notebooks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Sem título',
  content     JSONB NOT NULL DEFAULT '{}',  -- Tiptap JSON document
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_pages TO authenticated;
GRANT ALL ON public.study_pages TO service_role;
ALTER TABLE public.study_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages_self_all" ON public.study_pages
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER pages_updated BEFORE UPDATE ON public.study_pages
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. DÚVIDAS TEOLÓGICAS (substitui localStorage "bible.doubts")
CREATE TABLE IF NOT EXISTS public.study_doubts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT,
  references  TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_doubts TO authenticated;
GRANT ALL ON public.study_doubts TO service_role;
ALTER TABLE public.study_doubts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doubts_self_all" ON public.study_doubts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER doubts_updated BEFORE UPDATE ON public.study_doubts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. CAPÍTULOS LIDOS (substitui localStorage "bible.readChapters_${uid}")
CREATE TABLE IF NOT EXISTS public.read_chapters (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book    TEXT NOT NULL,
  chapter INT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book, chapter)
);
CREATE INDEX IF NOT EXISTS read_chapters_user_idx ON public.read_chapters (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.read_chapters TO authenticated;
GRANT ALL ON public.read_chapters TO service_role;
ALTER TABLE public.read_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_chapters_self_all" ON public.read_chapters
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. DESAFIOS MENSAIS CONCLUÍDOS (substitui localStorage "local_monthly_challenges_${uid}")
CREATE TABLE IF NOT EXISTS public.monthly_challenge_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  experience   TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_challenge_completions TO authenticated;
GRANT ALL ON public.monthly_challenge_completions TO service_role;
ALTER TABLE public.monthly_challenge_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_challenges_self_all" ON public.monthly_challenge_completions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. PREFERÊNCIAS DO LEITOR BÍBLICO (substitui bible.last_book, bible.translation, bible.font)
CREATE TABLE IF NOT EXISTS public.reader_preferences (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_book    TEXT NOT NULL DEFAULT 'jo',
  last_chapter INT NOT NULL DEFAULT 1,
  translation  TEXT NOT NULL DEFAULT 'NVI',
  font_size    INT NOT NULL DEFAULT 18,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reader_preferences TO authenticated;
GRANT ALL ON public.reader_preferences TO service_role;
ALTER TABLE public.reader_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reader_prefs_self_all" ON public.reader_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER reader_prefs_updated BEFORE UPDATE ON public.reader_preferences
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7. ESTATÍSTICAS DE QUIZ (substitui localStorage "bible.stats.*")
CREATE TABLE IF NOT EXISTS public.quiz_stats (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  correct_answers INT NOT NULL DEFAULT 0,
  total_answers   INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_stats TO authenticated;
GRANT ALL ON public.quiz_stats TO service_role;
ALTER TABLE public.quiz_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_stats_self_all" ON public.quiz_stats
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER quiz_stats_updated BEFORE UPDATE ON public.quiz_stats
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
