-- Create table for Linguagem Próxima do Original verses
CREATE TABLE IF NOT EXISTS public.original_bible_verses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_abbr      TEXT NOT NULL,
  chapter        INT NOT NULL,
  verse          INT NOT NULL,
  text           TEXT NOT NULL,
  notes          TEXT,
  original_lang  TEXT, -- 'hebraico', 'aramaico', 'grego'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_abbr, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_original_verses_coords 
  ON public.original_bible_verses (book_abbr, chapter);

-- Enable RLS
ALTER TABLE public.original_bible_verses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read and write access for local development / scripts
CREATE POLICY "Allow anonymous read and write access"
  ON public.original_bible_verses
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
