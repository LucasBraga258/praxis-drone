# ARCHITECTURE

# Objetivo

A Praxis Drone é uma plataforma SaaS de Agricultura de Precisão.

Toda arquitetura deve priorizar:

- simplicidade
- escalabilidade
- manutenção
- reutilização

---

# Stack

Framework

- Next.js App Router

Linguagem

- TypeScript

Banco

- Supabase

ORM

- Supabase Client

CSS

- TailwindCSS

Mapa

- MapLibre GL
- Leaflet quando necessário

ODM

- OpenDroneMap

IA

- Gemini
- OpenAI
- Modelos internos

---

# Arquitetura

Frontend

↓

Services

↓

Supabase

↓

Storage

↓

Pipeline

↓

IA

Nunca acessar banco diretamente em componentes Client.

Toda regra deve passar pelos Services.

---

# Estrutura

app/

componentes React

lib/

services

utils

hooks

types

docs/

documentação

---

# Componentes

Componentes devem ser pequenos.

Máximo recomendado:

150 linhas.

Pages:

Máximo recomendado:

250 linhas.

Services:

Máximo:

300 linhas.

Arquivos maiores devem ser divididos.

---

# Fluxo

Cliente

↓

Fazenda

↓

Talhão

↓

Missão

↓

Upload

↓

Pipeline

↓

Produtos

↓

IA

↓

Relatório

↓

Portal Cliente

Todo desenvolvimento deve fortalecer esse fluxo.

---

# Build

Todo commit deve:

Compilar

Sem erros

Sem duplicação

Sem código morto