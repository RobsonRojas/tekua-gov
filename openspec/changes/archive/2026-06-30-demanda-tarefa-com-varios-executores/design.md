## Context

Atualmente a plataforma registra o executor de uma demanda ou tarefa de forma singular. Como membros da vila desejam se organizar em equipes para resolver tarefas complexas, o sistema deve suportar múltiplos executores e distribuir recompensas (Surreais) entre todos eles.

## Goals / Non-Goals

**Goals:**
- Modificar o modelo de dados para suportar múltiplos executores (`executor_ids` como array ou tabela de junção dependendo do schema atual).
- Atualizar o formulário de cadastro de tarefa para usar um campo de seleção múltipla (Autocomplete com Chips) para os membros da vila executores.
- Atualizar a UI do `WorkWall` ou do card de tarefa para exibir os avatares de todos os participantes.
- Atualizar a função de confirmação de tarefa (Edge Function ou transação de banco de dados) para dividir o valor de `reward_amount` de forma igualitária entre todos os executores selecionados e efetuar os créditos em suas respectivas carteiras (`surreal_balance`).

**Non-Goals:**
- Não iremos implementar divisão de recompensas em frações personalizadas nesta versão (o valor será dividido igualmente ou o valor integral será repetido dependendo da regra de negócio - por simplicidade, dividiremos o total igualmente entre os executores, arredondando quando necessário).

## Decisions

1. **Modelo de Dados**: Adicionar uma coluna `executor_ids` (array de UUIDs) na tabela de tarefas/demandas, ou utilizar uma relação existente que suporte múltiplos IDs. Se a tabela possuía `executor_id`, ela será preterida ou migrada para `executor_ids`.
2. **Interface do Cadastro**: O formulário `/register-work` ou equivalente usará um componente de múltipla escolha para selecionar beneficiários/executores ao invés de um select simples.
3. **Distribuição de Recompensa**: A lógica responsável pela transferência (Ledger ou carteira) será iterada em um loop ou processada via Edge Function `api-gifts` (ou similar) no momento em que a tarefa passar para o status de "aprovada" (ex: após a regra de consenso da comunidade ou aprovação pelo demandante). O valor total será dividido pelo número de executores.

## Risks / Trade-offs

- **Risk**: Problemas de arredondamento em divisão de recompensas (ex: 10 Surreais / 3 pessoas = 3.333...).
  - **Mitigation**: Utilizar precisão correta na divisão e garantir que a soma dos créditos seja exata ao total abatido (se houver débito correspondente) ou truncar nas duas casas decimais permitidas pelo Ledger.
- **Risk**: Migração de dados legados que possuem apenas um executor.
  - **Mitigation**: A migração deve copiar o valor atual de `executor_id` para o primeiro elemento do array `executor_ids`.
