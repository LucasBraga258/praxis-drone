-- ==========================================
-- SCRIPT: ADICIONAR REFERÊNCIA NODEODM
-- ==========================================
-- Adiciona a coluna odm_uuid para guardar o UUID real da tarefa no servidor NodeODM local.

ALTER TABLE public.mission_jobs ADD COLUMN IF NOT EXISTS odm_uuid TEXT;

-- Atualizar o cache
NOTIFY pgrst, 'reload schema';
