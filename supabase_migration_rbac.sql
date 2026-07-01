-- 1. Habilitar Extensão UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar Tabela de Perfis de Usuário (Mapeamento do Auth Supabase)
CREATE TABLE IF NOT EXISTS public.perfis_usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'empresa', 'agronomo', 'produtor')),
  empresa_id BIGINT, -- Se for agronomo ou produtor atrelado a uma empresa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Função para sincronizar novos usuários do Supabase Auth para a tabela perfis
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, email, nome, perfil)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), COALESCE(new.raw_user_meta_data->>'perfil', 'produtor'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger para sincronizar criação de usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- ESTRATÉGIA DE SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Ativar RLS nas tabelas principais
ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Exemplo 1: Admins podem ver e editar tudo em FAZENDAS
CREATE POLICY "Admins_full_access_fazendas" ON public.fazendas
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM perfis_usuarios WHERE id = auth.uid() AND perfil = 'admin')
  );

-- Exemplo 2: Produtor só pode ver suas próprias fazendas (Assumindo que adicionamos user_id na tabela fazendas futuramente)
-- ATENÇÃO: Como o banco atual não possui user_id na tabela fazendas, precisaremos adicionar:
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Produtor_view_own_fazendas" ON public.fazendas
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- ==========================================
-- SUCESSO!
-- Execute este script no SQL Editor do Supabase.
-- ==========================================
