# task-notification-scheduler Specification

## Purpose
Definir o comportamento do motor de agendamento de lembretes, garantindo que usuários recebam notificações sobre tarefas pendentes de acordo com sua prioridade, evitando redundâncias e garantindo o engajamento.

## Requirements

### Requirement: Agendamento de Lembretes por Prioridade
O sistema SHALL disparar notificações de lembrete para tarefas abertas baseando-se na frequência configurada para o quadrante de prioridade da tarefa.

#### Scenario: Disparo de lembrete de alta prioridade
- **WHEN** uma tarefa é classificada como "Urgente e Importante" e o tempo desde o último lembrete (ou criação) excede 1 hora.
- **THEN** o sistema SHALL enviar uma notificação push/email para o executor (se houver) ou para os membros interessados.

#### Scenario: Disparo de lembrete de baixa prioridade
- **WHEN** uma tarefa é classificada como "Não Urgente e Não Importante" e o tempo desde o último lembrete excede 1 semana.
- **THEN** o sistema SHALL enviar uma notificação de resumo semanal.

### Requirement: Registro de Histórico de Notificações
O sistema SHALL registrar quando um lembrete foi enviado para evitar disparos duplicados ou fora da cadência.

#### Scenario: Prevenção de spam
- **WHEN** o motor de lembretes processa uma tarefa mas identifica que um lembrete já foi enviado dentro do intervalo de frequência configurado.
- **THEN** o sistema SHALL pular o envio da notificação para aquela tarefa.
