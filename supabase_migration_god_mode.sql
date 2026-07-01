-- ==========================================
-- SCRIPT MESTRE: GOD MODE PARA O ADMIN
-- ==========================================

-- Este script zera as restrições atuais e concede ACESSO TOTAL
-- em TODAS as tabelas vitais do sistema para usuários que possuam perfil = 'admin'.

-- 1. Tabela: clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deus_da_Plataforma_Full_Access_Clientes" ON public.clientes;
CREATE POLICY "Deus_da_Plataforma_Full_Access_Clientes" ON public.clientes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'));

-- 2. Tabela: projetos
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deus_da_Plataforma_Full_Access_Projetos" ON public.projetos;
CREATE POLICY "Deus_da_Plataforma_Full_Access_Projetos" ON public.projetos
  FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'));

-- 3. Tabela: mission_jobs
ALTER TABLE public.mission_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deus_da_Plataforma_Full_Access_MissionJobs" ON public.mission_jobs;
CREATE POLICY "Deus_da_Plataforma_Full_Access_MissionJobs" ON public.mission_jobs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin'));

-- ATENÇÃO: As políticas originais (anon) se existirem, podem continuar existindo se forem liberais.
