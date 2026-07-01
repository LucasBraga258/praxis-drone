-- ==========================================
-- SCRIPT DE CORREÇÃO: RLS DO MOTOR DE PROCESSAMENTO
-- ==========================================
-- O motor roda em background (sem a sessão do usuário logado). 
-- Para ele conseguir criar jobs e logs, precisamos dar permissão de escrita
-- para operações anônimas (o backend atua de forma autônoma)

-- 1. Permissões para a tabela mission_jobs
CREATE POLICY "Permitir_Backend_MissionJobs" 
ON public.mission_jobs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 2. Permissões para a tabela process_logs (se existir)
CREATE POLICY "Permitir_Backend_ProcessLogs" 
ON public.process_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 3. Permissões para a tabela projetos (O pipeline precisa atualizar o status)
CREATE POLICY "Permitir_Backend_Update_Projetos" 
ON public.projetos 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 4. Permissões para a tabela notificacoes
CREATE POLICY "Permitir_Backend_Insert_Notificacoes" 
ON public.notificacoes 
FOR INSERT 
WITH CHECK (true);

-- Atualizar o cache
NOTIFY pgrst, 'reload schema';
