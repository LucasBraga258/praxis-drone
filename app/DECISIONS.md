# Decisão 001

Toda Missão pertence obrigatoriamente a um Talhão.

Motivo

Permitir histórico temporal.

Data

28/06/2026

---

# Decisão 002

Toda regra de negócio fica em Services.

Motivo

Evitar lógica nas páginas.

---

# Decisão 003

Mission Validator sempre executa antes do Pipeline.

Motivo

Garantir qualidade dos dados.

# Decisão 004

As intervenções pertencem ao Talhão.

Uma Missão pode originar recomendações que levam a uma intervenção.

A intervenção faz parte do histórico do Talhão e pode referenciar a Missão que motivou sua execução.

Motivo:

Permitir acompanhamento temporal da área ao longo de vários anos, independentemente da quantidade de missões realizadas.

# Decisão 005

Quando existir divergência entre:

- Arquitetura planejada
- Estrutura atual do banco

A implementação deve respeitar a estrutura atual para manter o sistema funcionando.

A evolução da modelagem será feita por migrações planejadas, nunca durante uma Sprint de funcionalidade.