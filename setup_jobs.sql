-- Migration: Configuração de Orquestração de Pipeline e Logs
-- Criação das tabelas necessárias para que o Process Manager controle os Jobs de processamento e tentativas (Retries).

-- 1. Criação do tipo ENUM para o Status do Job
CREATE TYPE job_status AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING');

-- 2. Criação da Tabela mission_jobs (A Máquina de Estados)
CREATE TABLE mission_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    status job_status DEFAULT 'QUEUED',
    etapa_atual VARCHAR(50) DEFAULT 'AGUARDANDO', -- (Ex: 'UPLOAD', 'NODEODM', 'IA', 'PDF')
    tentativas INT DEFAULT 0,
    max_tentativas INT DEFAULT 3,
    error_log TEXT,
    started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criação da Tabela process_logs (Auditabilidade / Timeline Detalhada)
CREATE TABLE process_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES mission_jobs(id) ON DELETE CASCADE,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    acao VARCHAR(255) NOT NULL, -- (Ex: 'Iniciando NodeODM', 'Download Concluído')
    status VARCHAR(50) DEFAULT 'INFO', -- ('INFO', 'WARN', 'ERROR', 'SUCCESS')
    duracao_ms INT DEFAULT 0, -- Tempo que levou a ação
    mensagem TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Função para atualizar 'updated_at' automaticamente na tabela mission_jobs
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mission_jobs_modtime
BEFORE UPDATE ON mission_jobs
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Notificação de Criação:
-- Estas tabelas estão prontas para serem criadas no seu banco de dados. 
-- Caso use o Supabase localmente, adicione em 'supabase/migrations/'. 
-- Caso já queira executar online, rode este script no SQL Editor do Supabase.
