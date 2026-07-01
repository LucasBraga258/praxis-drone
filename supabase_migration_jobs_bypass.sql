-- ==========================================
-- SCRIPT DE BYPASS: MISSION JOBS E PROCESS LOGS
-- ==========================================
-- Como o arquivo .env.local está sem a Chave Mestra (SUPABASE_SERVICE_ROLE_KEY),
-- a interface de usuário (anon) precisa de permissão para ler o andamento do pipeline.

-- Tabela: mission_jobs
DROP POLICY IF EXISTS "Anon_Bypass_MissionJobs" ON public.mission_jobs;
CREATE POLICY "Anon_Bypass_MissionJobs" ON public.mission_jobs FOR ALL USING (true) WITH CHECK (true);

-- Tabela: process_logs
DROP POLICY IF EXISTS "Anon_Bypass_ProcessLogs" ON public.process_logs;
CREATE POLICY "Anon_Bypass_ProcessLogs" ON public.process_logs FOR ALL USING (true) WITH CHECK (true);

-- Atualizar o cache
NOTIFY pgrst, 'reload schema';
