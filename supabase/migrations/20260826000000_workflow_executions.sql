-- Tabela para registrar execuções do workflow do GitHub Actions
-- Permite que o dashboard mostre: última execução, próxima execução, chamadas Gemini, etc.

CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id SERIAL PRIMARY KEY,
  run_id TEXT,                        -- GitHub Actions run ID (opcional, para rastreabilidade)
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  gemini_calls_made INT NOT NULL DEFAULT 0,
  gemini_calls_limit INT NOT NULL DEFAULT 18,
  chapters_completed INT NOT NULL DEFAULT 0,  -- capítulos traduzidos nesta execução
  chapters_cached INT NOT NULL DEFAULT 0,     -- capítulos já prontos encontrados no cache
  chapters_failed INT NOT NULL DEFAULT 0,     -- capítulos que falharam nesta execução
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'error', 'rate_limited')),
  error_message TEXT,
  triggered_by TEXT DEFAULT 'cron'           -- 'cron' | 'manual' | 'local'
);

-- Índice para consultas recentes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON public.workflow_executions(started_at DESC);

-- RLS: leitura pública, escrita apenas com service_role (ou anon para o script)
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access on workflow_executions"
  ON public.workflow_executions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert/update on workflow_executions"
  ON public.workflow_executions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Função para iniciar uma execução (retorna o ID criado)
CREATE OR REPLACE FUNCTION public.start_workflow_execution(
  p_gemini_calls_limit INT DEFAULT 18,
  p_run_id TEXT DEFAULT NULL,
  p_triggered_by TEXT DEFAULT 'cron'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id INT;
BEGIN
  INSERT INTO public.workflow_executions (gemini_calls_limit, run_id, triggered_by)
  VALUES (p_gemini_calls_limit, p_run_id, p_triggered_by)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_workflow_execution(INT, TEXT, TEXT) TO anon, authenticated;

-- Função para finalizar uma execução
CREATE OR REPLACE FUNCTION public.finish_workflow_execution(
  p_execution_id INT,
  p_gemini_calls_made INT,
  p_chapters_completed INT,
  p_chapters_cached INT,
  p_chapters_failed INT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.workflow_executions
  SET
    finished_at = now(),
    gemini_calls_made = p_gemini_calls_made,
    chapters_completed = p_chapters_completed,
    chapters_cached = p_chapters_cached,
    chapters_failed = p_chapters_failed,
    status = p_status,
    error_message = p_error_message
  WHERE id = p_execution_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finish_workflow_execution(INT, INT, INT, INT, INT, TEXT, TEXT) TO anon, authenticated;
