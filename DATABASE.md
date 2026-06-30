# DATABASE

# Tabelas principais

clientes

Cadastro dos produtores.

---

fazendas

Pertencem a clientes.

Uma fazenda possui vários talhões.

---

talhoes

Representam áreas monitoradas.

---

projetos

Representam uma missão de voo.

Campos principais

- código
- área
- piloto
- drone
- câmera
- data
- status

---

arquivos_projeto

Todos os arquivos enviados.

Campos

- nome
- tipo
- tamanho
- bucket
- caminho
- url

---

jobs_processamento

Pipeline.

Etapas

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

---

intervencoes

Pulverizações

Aplicações

Tratamentos

---

pragas

Ocorrências detectadas.

---

notificacoes

Alertas do sistema.

---

usuarios

Controle de acesso.

---

agronomos

Responsáveis técnicos.

---

empresas_parceiras

Parceiros comerciais.

---

Relacionamentos

Cliente

↓

Fazenda

↓

Talhão

↓

Projeto

↓

Arquivos

↓

Pipeline

↓

Produtos