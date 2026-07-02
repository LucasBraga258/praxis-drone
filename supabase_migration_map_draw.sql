-- Script para adicionar suporte geográfico de mapas

ALTER TABLE public.fazendas
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL,
ADD COLUMN IF NOT EXISTS bbox_geojson JSONB;

ALTER TABLE public.talhoes
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL,
ADD COLUMN IF NOT EXISTS bbox_geojson JSONB;

-- Notificar PostgREST
NOTIFY pgrst, 'reload schema';
