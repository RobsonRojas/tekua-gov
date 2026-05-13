## 1. Banco de Dados e Backend

- [x] 1.1 Criar migração para adicionar `urgency`, `importance` e `last_reminder_at` na tabela `activities`.
- [x] 1.2 Criar migração para adicionar `task_reminder_frequencies` (JSONB) na tabela `governance_settings`.
- [x] 1.3 Atualizar a função RPC de criação de tarefas (`submit_activity` ou similar) para aceitar e persistir os novos campos de prioridade.
- [x] 1.4 Desenvolver a lógica do motor de lembretes (SQL Function ou Edge Function) que calcula tarefas pendentes de notificação.
- [x] 1.5 Configurar o agendamento (Cron) para execução periódica do motor de lembretes.

## 2. Interface de Usuário - Criação e Mural

- [x] 2.1 Atualizar o formulário de criação de tarefas para incluir seletores de Urgência e Importância (Matriz de Eisenhower).
- [x] 2.2 Implementar componentes visuais (badges/icons) para exibir a prioridade nos cards de tarefas do mural.
- [x] 2.3 Adicionar filtragem ou ordenação por prioridade no mural (opcional, mas recomendado).

## 3. Configurações Administrativas

- [x] 3.1 Criar a interface de configuração no painel de administração para editar as frequências de notificação.
- [x] 3.2 Garantir que a interface valide os formatos de intervalo (ex: "1 hour", "1 day") antes de salvar no banco.

## 4. Verificação e Testes

- [x] 4.1 Validar a persistência correta dos campos de prioridade na criação de tarefas.
- [x] 4.2 Simular a passagem de tempo para verificar se o motor de lembretes dispara notificações nos intervalos corretos.
- [x] 4.3 Testar a atualização das configurações de frequência e seu impacto imediato nos próximos disparos.
