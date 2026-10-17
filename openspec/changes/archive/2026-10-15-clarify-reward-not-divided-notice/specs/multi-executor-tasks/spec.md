## MODIFIED Requirements

### Requirement: Distribuição de Recompensas para Múltiplos Executores
Quando uma tarefa ou demanda com múltiplos executores for aprovada/confirmada (seja por consenso da comunidade ou aprovação do demandante), o sistema SHALL creditar o valor TOTAL (reward_amount) na carteira (Surreal Balance) de CADA UM dos executores selecionados, sem dividir o valor entre eles. O valor definido no cadastro representa quanto cada executor recebe individualmente.

#### Scenario: Distribuição de recompensa entre 3 executores
- **WHEN** uma tarefa de 30 Surreais com 3 executores é confirmada.
- **THEN** o sistema SHALL creditar 30 Surreais na carteira de cada um dos 3 executores (valor integral por executor, sem divisão), totalizando 90 Surreais distribuídos.

#### Scenario: Arredondamento da recompensa
- **WHEN** uma tarefa de 10 Surreais tem 3 executores.
- **THEN** o sistema SHALL creditar 10 Surreais na carteira de cada um dos 3 executores; como o valor não é dividido, não há necessidade de arredondamento.
