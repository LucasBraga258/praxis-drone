-- ==========================================
-- SCRIPT DE ATUALIZAÇÃO: PIPELINE AUTOMATIZADO DE IA
-- ==========================================

-- 1. Adicionar coluna para armazenar o Relatório Mágico da IA
ALTER TABLE public.projetos 
ADD COLUMN IF NOT EXISTS relatorio_ia TEXT;

-- 2. Garantir que mission_jobs pode armazenar a URL do Webhook ou metadados da IA (Opcional, já temos status e error_log)
ALTER TABLE public.mission_jobs 
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'PENDING';

-- Execute este script no SQL Editor do Supabase para preparar o banco para a Sprint 3.
