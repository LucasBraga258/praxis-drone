# PRAXIS CONTEXT

## Visão

A Praxis é uma plataforma de Agricultura de Precisão.

Seu objetivo é centralizar todas as informações de uma propriedade agrícola em um único ambiente, auxiliando produtores e agrônomos na tomada de decisão através de Inteligência Artificial.

A IA nunca toma decisões.

Ela apenas identifica padrões, gera análises e apresenta recomendações.

A decisão sempre pertence ao agrônomo ou produtor.

---

# Público

- Produtores
- Agrônomos
- Empresas de Agricultura de Precisão
- Cooperativas
- Consultorias
- Empresas de Drone
- Empresas de Satélite

---

# Objetivo Principal

Cada Talhão deve possuir um histórico completo de sua evolução ao longo dos anos.

Todas as informações produzidas pela plataforma devem estar vinculadas ao Talhão.

---

# Entidades

Empresa

↓

Cliente

↓

Fazenda

↓

Talhão

↓

Missão

↓

Arquivos

↓

Pipeline

↓

Produtos

↓

Linha do Tempo

↓

IA

---

# Missão

Uma Missão representa uma coleta de dados.

Uma Missão pode possuir uma ou mais fontes de dados.

Exemplos:

- Drone RGB
- Drone Multiespectral
- Drone Termal
- LiDAR
- Satélite
- Sensores IoT (futuro)

Toda Missão pertence obrigatoriamente a um Talhão.

---

# Fontes de Dados

A plataforma deve suportar diversas origens de dados.

Atualmente:

- Drone RGB

Planejado:

- Satélite Sentinel
- Satélite Landsat
- Planet
- LiDAR
- Termografia
- Sensores de Solo
- Estações Meteorológicas

---

# Produtos

Uma Missão pode gerar diversos produtos.

Exemplos:

- Ortomosaico
- NDVI
- NDRE
- DSM
- DTM
- Curvas de Nível
- Modelo 3D
- Relatório Técnico
- Relatório IA

---

# Pipeline

Fluxo padrão:

Upload

↓

Mission Validator

↓

Praxis Score

↓

Processamento

↓

Produtos

↓

IA

↓

Relatório

↓

Histórico

---

# Mission Validator

O Mission Validator é obrigatório.

Toda Missão deve ser validada antes do processamento.

Ele verifica:

- GPS
- Datas
- Drone
- Fabricante
- Resolução
- Integridade
- Quantidade de Fotos

---

# Praxis Score

O Praxis Score mede a qualidade da Missão.

Ele é baseado nas validações realizadas pelo Mission Validator.

---

# IA

A IA deve:

- analisar dados
- detectar padrões
- sugerir ações
- comparar Missões
- identificar evolução temporal

A IA nunca altera dados automaticamente.

---

# Timeline

O histórico pertence ao Talhão.

Cada Missão adiciona novos eventos à Timeline.

Exemplos:

2026

Missão RGB

↓

NDVI

↓

Intervenção

↓

Nova Missão

↓

Comparação

↓

Relatório

---

# Filosofia

Toda funcionalidade deve agregar valor ao histórico do Talhão.

Evite criar funcionalidades isoladas.

Sempre pensar na evolução temporal.

---

# Tecnologias

Frontend

- Next.js
- React
- TypeScript
- Tailwind

Backend

- Supabase

Armazenamento

- Supabase Storage

IA

- Google Gemini
- OpenAI (futuro)

Processamento

- OpenDroneMap
- Python (futuro)

---

# Objetivo Final

Transformar a Praxis em uma plataforma completa de Agricultura de Precisão.

A plataforma deve acompanhar a evolução da propriedade ao longo dos anos, integrando diferentes fontes de dados e utilizando Inteligência Artificial para apoiar decisões agronômicas.