-- Migration: Sistema de Compartilhamento de Missões com PIN
-- Sprint 10 — Plataforma Comercial

-- Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS compartilhamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id BIGINT NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    token VARCHAR(32) NOT NULL UNIQUE,
    pin VARCHAR(6) NOT NULL, -- PIN numérico de 6 dígitos
    titulo VARCHAR(255), -- Título personalizado para o compartilhamento
    criado_por VARCHAR(255), -- Nome do responsável
    expira_em TIMESTAMPTZ NOT NULL,
    visualizacoes INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca por token
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_token ON compartilhamentos(token);
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_projeto ON compartilhamentos(projeto_id);

-- Tabela de acessos (auditoria)
CREATE TABLE IF NOT EXISTS compartilhamento_acessos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compartilhamento_id UUID REFERENCES compartilhamentos(id) ON DELETE CASCADE,
    ip VARCHAR(45),
    user_agent TEXT,
    acessado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_compartilhamentos_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compartilhamentos_modtime
BEFORE UPDATE ON compartilhamentos
FOR EACH ROW EXECUTE PROCEDURE update_compartilhamentos_modtime();

-- RLS: Compartilhamentos são públicos para leitura via token
ALTER TABLE compartilhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compartilhamento_acessos ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer pessoa pode ler por token (sem auth)
CREATE POLICY "leitura_publica_por_token" ON compartilhamentos
    FOR SELECT USING (ativo = TRUE AND expira_em > NOW());

-- Policy: apenas autenticados podem criar/gerenciar
CREATE POLICY "criacao_autenticada" ON compartilhamentos
    FOR INSERT WITH CHECK (TRUE); -- Simplificado por ora, refinar com auth

CREATE POLICY "atualizacao_autenticada" ON compartilhamentos
    FOR UPDATE USING (TRUE);

-- Comentário:
-- Para produção, substituir as policies de INSERT/UPDATE por:
-- WITH CHECK (auth.uid() IS NOT NULL)
