-- Migration: Motor de IA Praxis 1.0
-- Criação das tabelas que armazenarão as inferências e diagnósticos avançados.

CREATE TABLE diagnosticos_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    saude_geral TEXT, -- Resumo executivo da IA
    alto_vigor_pct NUMERIC DEFAULT 0,
    medio_vigor_pct NUMERIC DEFAULT 0,
    baixo_vigor_pct NUMERIC DEFAULT 0,
    nivel_confianca NUMERIC DEFAULT 0,
    anomalias_detectadas JSONB DEFAULT '[]', -- Array com { tipo, severidade, area_afetada_ha, coordenadas }
    recomendacoes_tecnicas TEXT,
    prioridade_geral VARCHAR(50) DEFAULT 'Normal', -- (Normal, Media, Critica)
    intervencoes_sugeridas JSONB DEFAULT '[]', -- Array com { produto, dose, urgencia }
    data_analise TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(projeto_id)
);

-- Adicionando a coluna "fonte_captura" na tabela projetos para suportar Drones e Satélites
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS fonte_captura VARCHAR(50) DEFAULT 'Drone',
ADD COLUMN IF NOT EXISTS metadados_captura JSONB DEFAULT '{}';

-- Notificação:
-- Rode este script no Editor SQL do Supabase. Ele adiciona suporte nativo para múltiplos sensores (Satélites)
-- e cria a tabela blindada onde a IA da Praxis guardará os relatórios processados.
