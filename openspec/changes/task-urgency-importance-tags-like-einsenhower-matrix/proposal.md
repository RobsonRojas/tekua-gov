## Why

Atualmente, as tarefas no quadro são listadas sem uma distinção clara de prioridade, o que dificulta a gestão de tempo dos membros e a identificação de demandas críticas para a comunidade. A implementação da Matriz de Eisenhower permitirá uma organização visual e funcional baseada em Urgência e Importância, otimizando o fluxo de trabalho e garantindo que tarefas críticas recebam a atenção necessária através de lembretes automáticos configuráveis.

## What Changes

- Adição de seletores de "Urgência" e "Importância" no formulário de criação e edição de tarefas.
- Exibição visual dos níveis de prioridade nos cards de tarefas do mural (quadro).
- Implementação de um motor de lembretes que dispara notificações com frequências variadas dependendo da classificação da tarefa.
- Criação de um painel de configuração administrativa para definir as frequências de notificação para cada quadrante da matriz (ex: Urgente & Importante = 1 hora).
- Atualização do banco de dados para armazenar os novos metadados de prioridade e as configurações de frequência.

## Capabilities

### New Capabilities
- `task-notification-scheduler`: Sistema de agendamento e motor de disparos de lembretes baseados nos quadrantes da Matriz de Eisenhower.
- `task-priority-configuration`: Painel de interface para usuários (ou administradores) configurarem a cadência de notificações para cada combinação de urgência e importância.

### Modified Capabilities
- `gift-economy-tasks`: Atualização dos requisitos de criação, visualização e armazenamento de tarefas para incluir os eixos de Urgência e Importância.

## Impact

- **Banco de Dados**: Novas colunas na tabela de tarefas e possivelmente uma nova tabela para configurações de notificação por tenant/usuário.
- **Frontend**: Novos componentes de formulário e indicadores visuais no mural de tarefas.
- **Backend/Edge Functions**: Nova lógica para processamento periódico de lembretes e envio de notificações.
- **Notificações**: Aumento no volume de notificações disparadas pelo sistema.
