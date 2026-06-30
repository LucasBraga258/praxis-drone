# BUSINESS RULES

# Missão

Uma missão representa UM voo.

Nunca reutilizar missão para outro voo.

---

Upload

Cada missão possui apenas um conjunto oficial de imagens.

Novo upload substitui ou cria nova versão.

---

Pipeline

As etapas devem obedecer obrigatoriamente:

Upload

↓

OpenDroneMap

↓

Ortomosaico

↓

DSM

↓

DTM

↓

NDVI

↓

IA

↓

Relatório

↓

Entrega

Nunca inverter a ordem.

---

IA

A IA nunca responde apenas perguntas.

Ela deve analisar automaticamente.

Ela deve produzir:

Diagnóstico

↓

Alertas

↓

Recomendações

↓

Prioridade

↓

Relatório

---

Produtos

Cada missão pode gerar:

Ortomosaico

DSM

DTM

NDVI

PDF

WebGIS

Todos são independentes.

---

Alertas

Devem ser classificados em:

Informativo

Atenção

Crítico

---

Portal Cliente

Cliente nunca acessa informações administrativas.

Cliente acessa apenas:

Projetos

Relatórios

Mapa

Downloads

---

Princípio

Toda funcionalidade deve aproximar a Praxis de uma plataforma comercial de Agricultura de Precisão.

Nunca criar funcionalidades apenas para preencher telas.