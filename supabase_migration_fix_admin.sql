-- ==========================================
-- SCRIPT DE CORREÇÃO: CONFIRMAR USUÁRIO MASTER
-- ==========================================

-- O Supabase exige confirmação de e-mail por padrão. 
-- Como ainda não configuramos um servidor de e-mail (SMTP), os usuários ficam bloqueados na hora do login.
-- Rode este script para forçar a confirmação do seu e-mail e permitir seu login!

UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'lukasmanoel22@gmail.com';

-- Lembrete: Não esqueça de também rodar a "PARTE 3" do script 'supabase_migration_approvals.sql' para garantir que você é 'admin'.
