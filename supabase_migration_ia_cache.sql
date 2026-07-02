-- Add data_ultima_analise to talhoes table for caching AI reports
ALTER TABLE public.talhoes
ADD COLUMN IF NOT EXISTS data_ultima_analise TIMESTAMP WITH TIME ZONE;
