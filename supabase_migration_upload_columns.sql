-- ==========================================
-- SCRIPT DE CORREÇÃO: ADICIONAR COLUNAS NAS TABELAS DE UPLOAD
-- ==========================================

-- Adicionando colunas em mission_jobs caso já existisse
ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ENFILEIRADO';
ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS etapa_atual TEXT DEFAULT 'UPLOAD_CONCLUIDO';
ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS error_log TEXT;

-- Adicionando colunas em arquivos_projeto caso já existisse
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS bucket TEXT NOT NULL DEFAULT 'missoes';
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS tamanho BIGINT;
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS origem TEXT;
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS processado BOOLEAN DEFAULT false;
ALTER TABLE public.arquivos_projeto ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Atualizar o cache de schema da API do Supabase
NOTIFY pgrst, 'reload schema';
