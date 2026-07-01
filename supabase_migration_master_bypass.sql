-- ==========================================
-- SCRIPT DE BYPASS MASTER: TODAS AS TABELAS
-- ==========================================
-- Garante que o motor anônimo e a interface possam ler/gravar TUDO 
-- enquanto o sistema não tem a Service Role configurada.

-- 1. Tabelas de Hierarquia e Usuários
DROP POLICY IF EXISTS "Anon_Bypass_Usuarios" ON public.usuarios;
CREATE POLICY "Anon_Bypass_Usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Produtores" ON public.produtores;
CREATE POLICY "Anon_Bypass_Produtores" ON public.produtores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Fazendas" ON public.fazendas;
CREATE POLICY "Anon_Bypass_Fazendas" ON public.fazendas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Talhoes" ON public.talhoes;
CREATE POLICY "Anon_Bypass_Talhoes" ON public.talhoes FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabelas de Projetos e Arquivos
DROP POLICY IF EXISTS "Anon_Bypass_Projetos" ON public.projetos;
CREATE POLICY "Anon_Bypass_Projetos" ON public.projetos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Arquivos" ON public.arquivos_projeto;
CREATE POLICY "Anon_Bypass_Arquivos" ON public.arquivos_projeto FOR ALL USING (true) WITH CHECK (true);

-- 3. Tabelas de Jobs e Logs
DROP POLICY IF EXISTS "Anon_Bypass_MissionJobs" ON public.mission_jobs;
CREATE POLICY "Anon_Bypass_MissionJobs" ON public.mission_jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_ProcessLogs" ON public.process_logs;
CREATE POLICY "Anon_Bypass_ProcessLogs" ON public.process_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. Tabelas da IA Agronômica
DROP POLICY IF EXISTS "Anon_Bypass_Diagnosticos" ON public.diagnosticos_ia;
CREATE POLICY "Anon_Bypass_Diagnosticos" ON public.diagnosticos_ia FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Intervencoes" ON public.intervencoes;
CREATE POLICY "Anon_Bypass_Intervencoes" ON public.intervencoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Pragas" ON public.pragas;
CREATE POLICY "Anon_Bypass_Pragas" ON public.pragas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Comparacoes" ON public.comparacoes_temporais;
CREATE POLICY "Anon_Bypass_Comparacoes" ON public.comparacoes_temporais FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon_Bypass_Notificacoes" ON public.notificacoes;
CREATE POLICY "Anon_Bypass_Notificacoes" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);

-- 5. Atualizar o Schema
NOTIFY pgrst, 'reload schema';
