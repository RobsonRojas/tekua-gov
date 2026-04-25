# task-creation Specification

## Purpose
Permitir que qualquer membro da comunidade crie novas demandas e tarefas no Mural de Trabalho, especificando uma recompensa em Surreal.

## ADDED Requirements

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' com status inicial 'open'.

#### Scenario: Successful task creation
- **WHEN** um membro autenticado fornece título, descrição e um valor de recompensa positivo
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id` e definir o status como `open`.

### Requirement: Reward Value Definition
O sistema SHALL validar que o valor da recompensa informado é um número positivo.

#### Scenario: Invalid reward amount
- **WHEN** um membro tenta criar uma tarefa com valor zero ou negativo
- **THEN** o sistema DEVE retornar um erro de validação e impedir a criação.
