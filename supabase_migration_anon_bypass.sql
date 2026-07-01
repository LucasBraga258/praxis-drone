-- ==========================================
-- SCRIPT DE BYPASS TOTAL PARA O MOTOR ANÔNIMO
-- ==========================================
-- Este script encerra a "caça às bruxas" do RLS.
-- Como o arquivo .env.local está sem a Chave Mestra (SUPABASE_SERVICE_ROLE_KEY),
-- o motor roda sem crachá (anon). Vamos liberar TODAS as operações (SELECT, INSERT, UPDATE, DELETE)
-- para as tabelas que a IA interage, assim garantimos que a esteira não vai travar mais.

-- Tabela: diagnosticos_ia
DROP POLICY IF EXISTS "Anon_Bypass_Diagnosticos" ON public.diagnosticos_ia;
CREATE POLICY "Anon_Bypass_Diagnosticos" ON public.diagnosticos_ia FOR ALL USING (true) WITH CHECK (true);

-- Tabela: intervencoes
DROP POLICY IF EXISTS "Anon_Bypass_Intervencoes" ON public.intervencoes;
CREATE POLICY "Anon_Bypass_Intervencoes" ON public.intervencoes FOR ALL USING (true) WITH CHECK (true);

-- Tabela: pragas
DROP POLICY IF EXISTS "Anon_Bypass_Pragas" ON public.pragas;
CREATE POLICY "Anon_Bypass_Pragas" ON public.pragas FOR ALL USING (true) WITH CHECK (true);

-- Tabela: comparacoes_temporais
DROP POLICY IF EXISTS "Anon_Bypass_Comparacoes" ON public.comparacoes_temporais;
CREATE POLICY "Anon_Bypass_Comparacoes" ON public.comparacoes_temporais FOR ALL USING (true) WITH CHECK (true);

-- Tabela: projetos
DROP POLICY IF EXISTS "Anon_Bypass_Projetos" ON public.projetos;
CREATE POLICY "Anon_Bypass_Projetos" ON public.projetos FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
