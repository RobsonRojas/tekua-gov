## ADDED Requirements

### Requirement: Painel de Configuração de Frequência
O sistema SHALL disponibilizar uma interface para que administradores definam a cadência de notificações para cada quadrante da matriz de Eisenhower.

#### Scenario: Atualização de frequência de notificação
- **WHEN** um administrador altera a frequência do quadrante "Urgente e Não Importante" para "a cada 12 horas".
- **THEN** o sistema SHALL persistir essa configuração e aplicar a nova cadência para todos os lembretes futuros desse tipo.

### Requirement: Valores Padrão de Configuração
O sistema SHALL inicializar as configurações de frequência com valores pré-definidos se nenhuma configuração customizada existir.

#### Scenario: Uso de valores default
- **WHEN** uma nova tarefa é criada em um ambiente sem configurações customizadas.
- **THEN** o sistema SHALL usar os padrões: Urgente/Importante (1h), Urgente/Não-Importante (1 dia), Não-Urgente/Importante (1 dia), Não-Urgente/Não-Importante (7 dias).
