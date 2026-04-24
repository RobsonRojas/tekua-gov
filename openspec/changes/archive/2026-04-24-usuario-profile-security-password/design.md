## Context

A implementação atual da página `/profile` é focada em exibir e editar dados pessoais do usuário. No entanto, não há suporte para gestão de credenciais, o que é uma funcionalidade básica de segurança exigida para o portal Tekua Governance.

## Goals / Non-Goals

**Goals:**
- Implementar uma interface de abas para separar informações do perfil e segurança.
- Criar um formulário funcional e seguro para troca de senha.
- Validar as entradas de senha (complexidade e confirmação).
- Manter a sessão ativa após a troca de senha (Supabase Session Refresh).

**Non-Goals:**
- Implementação de log de tentativas de acesso (será tratado em outra proposta: `user-activity-history`).
- Integração de hardware keys (WebAuthn).

## Decisions

- **UI Components**: Utilizar `MUI Tabs` para organização das seções.
- **Form State**: `react-hook-form` ou estado simples com validação Zod (se disponível) ou manual para simplicidade.
- **Supabase Auth**: Utilizar `supabase.auth.updateUser({ password: newPassword })` que gerencia a atualização de forma atômica para o usuário logado.

## Risks / Trade-offs

- **Session Invalidation**: Dependendo da configuração do Supabase, trocar a senha pode invalidar outras sessões ativas. Isso será informado ao usuário.
- **Validation Consistency**: A validação no frontend deve espelhar as regras de política de senha configuradas no Supabase Dashboard.
