-- ==========================================
-- SCRIPT DE CORREÇÃO: PERMISSÃO DE ESCRITA PARA A IA
-- ==========================================
-- A IA conseguiu ler os dados da fazenda e gerou o laudo com sucesso!
-- Porém, na hora de salvar na tabela 'diagnosticos_ia', o banco bloqueou a gravação.
-- Vamos liberar a ESCRITA (INSERT e UPDATE) nas tabelas da IA para o motor anônimo.

CREATE POLICY "Permitir_Backend_Insert_Diagnosticos" 
ON public.diagnosticos_ia FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir_Backend_Update_Diagnosticos" 
ON public.diagnosticos_ia FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir_Backend_Insert_Comparacoes" 
ON public.comparacoes_temporais FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir_Backend_Update_Comparacoes" 
ON public.comparacoes_temporais FOR UPDATE USING (true) WITH CHECK (true);

-- Atualizar o cache
NOTIFY pgrst, 'reload schema';
