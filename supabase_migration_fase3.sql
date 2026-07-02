-- Migração Fase 3 e 4 - Produtos dinâmicos e IA

ALTER TABLE public.projetos
ADD COLUMN IF NOT EXISTS vari_img_url TEXT,
ADD COLUMN IF NOT EXISTS falsa_cor_img_url TEXT,
ADD COLUMN IF NOT EXISTS dsm_img_url TEXT,
ADD COLUMN IF NOT EXISTS dtm_img_url TEXT,
ADD COLUMN IF NOT EXISTS pipeline_stages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS alertas_ia JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.talhoes
ADD COLUMN IF NOT EXISTS score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ultima_analise_ia TIMESTAMP WITH TIME ZONE;

-- Notificar PostgREST
NOTIFY pgrst, 'reload schema';
