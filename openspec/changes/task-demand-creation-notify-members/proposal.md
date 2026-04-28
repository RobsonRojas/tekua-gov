## Why

A plataforma atualmente não avisa os membros proativamente sobre novas demandas ou atualizações em tarefas existentes. Isso reduz o engajamento e aumenta o tempo de resposta para a execução e validação de trabalhos. Notificações automáticas via email e push garantirão que todos os envolvidos estejam sempre informados sobre o ciclo de vida das tarefas.

## What Changes

- Implementação de sistema de notificações automáticas (email e push) disparadas por eventos de tarefas e demandas.
- Gatilhos para os seguintes eventos:
    - **Criação de Demanda**: Notificar todos os membros sobre novas oportunidades de trabalho.
    - **Assunção de Tarefa**: Notificar o solicitante que alguém começou a trabalhar na demanda.
    - **Finalização/Submissão**: Notificar o solicitante e potenciais validadores que o trabalho está pronto para revisão.
    - **Edição de Tarefa**: Notificar as partes interessadas sobre mudanças significativas (valor, descrição, prazo).
- Integração com serviço de email (Resend/SMTP) para notificações assíncronas.

## Capabilities

### New Capabilities
- `event-notification-engine`: Sistema centralizado para mapear eventos de banco de dados para notificações multicanal (email, push, in-app).

### Modified Capabilities
- `notifications`: Expansão para suportar templates de email e novos tipos de eventos de push relacionados a tarefas.
- `task-execution`: Adição de requisitos para disparo de notificações em mudanças de status.
- `work-registration`: Inclusão de alerta automático na publicação de novas demandas.

## Impact

- **Supabase Functions**: Nova Edge Function ou expansão da existente para gerenciar o roteamento de notificações.
- **Banco de Dados**: Configuração de Triggers em `tasks` e `demands` para invocar o sistema de notificações.
- **Infraestrutura**: Necessidade de credenciais de serviço de email.
- **Frontend**: Novos ícones e rotas de destino nas notificações para levar o usuário diretamente à tarefa relevante.
