-- ==========================================
-- SCRIPT DE CORREÇÃO FINAL: RLS PARA A INTELIGÊNCIA ARTIFICIAL
-- ==========================================
-- Como o Service Role Key não está configurado, o motor roda como "anônimo".
-- Vamos liberar a LEITURA (SELECT) das tabelas que a IA precisa para analisar.

CREATE POLICY "Permitir_Backend_Select_Projetos" 
ON public.projetos FOR SELECT USING (true);

CREATE POLICY "Permitir_Backend_Select_Fazendas" 
ON public.fazendas FOR SELECT USING (true);

CREATE POLICY "Permitir_Backend_Select_Talhoes" 
ON public.talhoes FOR SELECT USING (true);

CREATE POLICY "Permitir_Backend_Select_Intervencoes" 
ON public.intervencoes FOR SELECT USING (true);

CREATE POLICY "Permitir_Backend_Select_Pragas" 
ON public.pragas FOR SELECT USING (true);

-- Atualizar o cache
NOTIFY pgrst, 'reload schema';
