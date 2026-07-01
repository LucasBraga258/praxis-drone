-- ==========================================
-- SCRIPT DE ATUALIZAÇÃO: CADASTRO COM APROVAÇÃO E ADMIN MASTER
-- ==========================================

-- 1. Adicionar coluna de STATUS na tabela de perfis
ALTER TABLE public.perfis_usuarios 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente' 
CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'bloqueado'));

-- 2. Atualizar a Trigger para novos cadastros (Todos nascem pendentes, exceto se especificado)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, email, nome, perfil, status)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'perfil', 'produtor'),
    COALESCE(new.raw_user_meta_data->>'status', 'pendente')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Inserir manualmente seu acesso MASTER
-- OBSERVAÇÃO IMPORTANTE: Como o Supabase exige que senhas sejam inseridas via API de Auth, 
-- não podemos simplesmente rodar um INSERT.
--
-- 👉 COMO CRIAR SEU ACESSO MASTER:
-- 1. Acesse seu painel do Supabase -> Authentication -> Users.
-- 2. Clique em "Add User" -> "Create new user".
-- 3. Insira o seu email e crie uma senha. Deixe o "Auto Confirm User" ativado.
-- 4. O usuário aparecerá na lista. Copie o User UID dele (é um código UUID grande).
-- 5. No SQL Editor, rode o comando abaixo substituindo SEU_UUID:

/*
UPDATE public.perfis_usuarios
SET perfil = 'admin', status = 'aprovado'
WHERE id = 'SEU_UUID_AQUI';
*/

-- PRONTO! Você agora é o Deus do sistema.
