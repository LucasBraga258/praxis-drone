-- ==========================================
-- SCRIPT DE CORREÇÃO: LIBERAR RLS PARA ADMINS
-- ==========================================

-- Se RLS estiver ativado na tabela de clientes, ninguém pode inserir sem uma política.
-- Isso libera acesso TOTAL (SELECT, INSERT, UPDATE, DELETE) na tabela clientes para quem tem perfil 'admin'.

CREATE POLICY "Admins_full_access_clientes" ON public.clientes
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin')
  );

-- Opcionalmente, libera o acesso total para inserção para admin também:
-- OBS: O "FOR ALL" com "USING" se aplica a leitura e deleção. Para INSERT, o ideal é o "WITH CHECK" também, mas o Supabase aceita USING para todos em muitos casos.
-- Garantindo que o admin pode inserir clientes:
DROP POLICY IF EXISTS "Admins_full_access_clientes" ON public.clientes;

CREATE POLICY "Admins_full_access_clientes" ON public.clientes
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin')
  );
