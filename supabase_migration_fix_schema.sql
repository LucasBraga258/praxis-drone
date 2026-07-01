-- ==========================================
-- SCRIPT DE CORREÇÃO: ADICIONAR COLUNAS FALTANTES E ATUALIZAR CACHE
-- ==========================================

-- Se a tabela talhoes já existia antes do nosso script, ela pode estar sem a coluna "area_hectares"
ALTER TABLE public.talhoes ADD COLUMN IF NOT EXISTS area_hectares DECIMAL;
ALTER TABLE public.talhoes ADD COLUMN IF NOT EXISTS cultura TEXT;

-- Opcional: para as outras tabelas caso tenham sido criadas vazias antes
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS area_ha DECIMAL;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS frequencia_monitoramento INTEGER;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS cliente_id BIGINT REFERENCES public.clientes(id) ON DELETE CASCADE;

-- Atualizar o cache de schema da API do Supabase (para sumir o erro de Schema Cache)
NOTIFY pgrst, 'reload schema';
