CREATE TABLE IF NOT EXISTS public.system_health (
    id text PRIMARY KEY,
    last_heartbeat timestamptz NOT NULL DEFAULT now(),
    version text,
    notes text
);

-- Habilita RLS
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Permite leitura para usuários anônimos
CREATE POLICY "Enable read access for all users" ON public.system_health FOR SELECT USING (true);
-- Permite atualização para usuários anônimos (necessário para o keep-alive)
CREATE POLICY "Enable update for all users" ON public.system_health FOR UPDATE USING (true);
-- Permite inserção para inicializar
CREATE POLICY "Enable insert for all users" ON public.system_health FOR INSERT WITH CHECK (true);

-- Insere o registro inicial se não existir
INSERT INTO public.system_health (id, version, notes) 
VALUES ('main', '1.0.0', 'Sistema ativo e em execução')
ON CONFLICT (id) DO NOTHING;
