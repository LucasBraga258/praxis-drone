# PRAXIS

Você está desenvolvendo uma plataforma de Agricultura de Precisão.

Arquitetura da Plataforma

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
Timeline
    ↓
IA

Princípios

- O Talhão é a entidade central.
- Toda Missão pertence a um Talhão.
- Todo histórico pertence ao Talhão.
- O Mission Validator nunca deve ser removido.
- O Praxis Score depende do Mission Validator.
- A IA nunca altera dados.
- A IA apenas gera recomendações.
- Toda regra de negócio pertence aos services.
- Componentes devem ser reutilizáveis.
- Evite criar novos arquivos quando existir um service compatível.

Regras

Nunca acessar Supabase diretamente nas páginas.

Toda regra de negócio pertence aos services.

Nunca duplicar lógica.

Utilizar TypeScript.

Reutilizar componentes.

Uma Missão pertence obrigatoriamente a um Talhão.

A IA nunca toma decisões.

O agrônomo decide.

# Regra Arquitetural

Antes de criar qualquer funcionalidade nova:

1. Verifique se já existe estrutura para ela.

2. Verifique se já existe um Service.

3. Verifique se já existe um Component.

4. Verifique se já existe uma tabela no banco.

5. Verifique se existe alguma decisão registrada em DECISIONS.md.

6. Se a implementação exigir alterar mais de 5 arquivos, explique antes por que isso é necessário.

Nunca faça uma refatoração completa sem autorização.

Prefira pequenas melhorias contínuas.

Cada Sprint deve:

- entregar valor ao usuário;
- reduzir um pouco a dívida técnica;
- manter compatibilidade com todo o restante do sistema.

# Depuração

Antes de corrigir qualquer erro:

- identificar a causa;
- reproduzir o erro;
- localizar o arquivo;
- explicar a origem;
- somente depois modificar o código.

Nunca corrigir um erro por tentativa e erro.

Sempre consulte o schema.sql antes de criar consultas SQL.

Nunca suponha a existência de colunas ou relacionamentos.

Caso exista divergência entre o código e o schema, informe antes de implementar.

# Banco de Dados

Sempre consulte o banco através do MCP antes de:

- criar consultas;
- criar migrations;
- assumir colunas;
- assumir foreign keys;
- assumir relacionamentos.

Nunca suponha a estrutura do banco.

Caso exista divergência entre código e banco, informe antes de implementar.

Todo array vindo de Supabase deve obrigatoriamente ser normalizado:

- null → []
- undefined → []
- join → sempre opcional

Frontend nunca assume existência de dados.