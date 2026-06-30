## ADDED Requirements

### Requirement: Distribuição de Recompensas para Múltiplos Executores
Quando uma tarefa ou demanda com múltiplos executores for aprovada/confirmada (seja por consenso da comunidade ou aprovação do demandante), o sistema SHALL calcular a recompensa individual dividindo o valor total (reward_amount) pelo número de executores selecionados e efetuar o crédito nas respectivas carteiras (Surreal Balance) de todos eles.

#### Scenario: Distribuição de recompensa entre 3 executores
- **WHEN** uma tarefa de 30 Surreais com 3 executores é confirmada.
- **THEN** o sistema SHALL creditar 10 Surreais na carteira de cada um dos 3 executores.

#### Scenario: Arredondamento da recompensa
- **WHEN** uma tarefa de 10 Surreais tem 3 executores.
- **THEN** o sistema SHALL dividir o valor mantendo a consistência decimal (ex: duas casas decimais, totalizando a distribuição o mais próximo possível da quantia baseada nas limitações do Ledger).
