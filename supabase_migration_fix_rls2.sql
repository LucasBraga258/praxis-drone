-- ==========================================
-- SCRIPT DE CORREÇÃO: DESATIVAR RLS PARA CLIENTES
-- ==========================================

-- Como ainda não configuramos a estrutura de múltiplos clientes (isolamento), 
-- manter o RLS ativado na tabela 'clientes' apenas bloqueia o sistema.
-- Rode esta linha no SQL Editor para destrancar a tabela de vez:

ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
