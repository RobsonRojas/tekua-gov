## Context

Algumas tarefas no mural são configuradas como `requester_approval` (apenas o requisitante/beneficiário pode confirmar o trabalho feito). Porém, em certas situações de suporte ou abandono, os administradores precisam poder confirmar essas tarefas manualmente. Atualmente, o sistema bloqueia isso.

## Goals / Non-Goals

**Goals:**
- Permitir que administradores da plataforma (role de admin) possam confirmar qualquer tarefa, sobrescrevendo bloqueios de `requester_approval`.

**Non-Goals:**
- Não iremos alterar as regras para Membros do Conselho, eles seguem com a regra original. Apenas Administradores (admin) ganharão o bypass para `requester_approval`.

## Decisions

- **Autorização Frontend:** O botão de "Confirmar" deve avaliar os privilégios do usuário (se é admin) e se tornar ativo, independentemente do `requester_id` ou `validation_method`.
- **Validação Backend (RPC `confirm_activity`):** O backend será alterado para checar a role do usuário chamador. Se for admin, a restrição que exige que `user_id == requester_id` para tarefas `requester_approval` será ignorada, permitindo a confirmação.

## Risks / Trade-offs

- **Risk:** Administradores podem acidentalmente confirmar tarefas sem o consentimento do beneficiário.
  - **Mitigation:** Isso é um trade-off aceito por ser uma ação restrita a administradores.
