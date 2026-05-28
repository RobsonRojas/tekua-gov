## Context

O componente de gerenciamento de segurança no perfil de usuário compartilha o mesmo código tanto para o dono do perfil (self-service) quanto para a visualização administrativa. Ao submeter a alteração de senha, o frontend utiliza o cliente do Supabase padrão do navegador, que sempre opera no contexto da sessão logada (o admin), atualizando erroneamente a senha do administrador.

## Goals / Non-Goals

**Goals:**
- Prover uma forma segura para que administradores consigam resetar ou alterar a senha de qualquer outro membro.
- Preservar o funcionamento padrão para quando o usuário comum está editando sua própria senha.
- Impedir que usuários sem privilégios vejam a aba de segurança no perfil de terceiros.

**Non-Goals:**
- Não iremos refatorar todo o sistema de autenticação ou recuperar as senhas antigas, apenas o fluxo de "update password" no contexto do painel de perfil.

## Decisions

- **Server Action Dedicada**: O frontend, antes de submeter a alteração de senha, verificará se o ID do perfil sendo visualizado (`targetUserId`) é igual ao ID do usuário autenticado.
- Se for **igual**, segue o fluxo normal chamando `supabase.auth.updateUser()`.
- Se for **diferente** (contexto de admin), o componente fará um POST ou chamará uma Server Action (`updatePasswordByAdmin(targetUserId, newPassword)`). Esta Action instanciará o cliente do Supabase com a `SERVICE_ROLE_KEY` e invocará `supabase.auth.admin.updateUserById(...)`.
- A Server Action deve obrigatoriamente validar que quem a chamou possui o papel (role) de administrador na tabela `users/profiles`, para evitar vazamento de privilégios.

## Risks / Trade-offs

- **Risk**: Uso da `SERVICE_ROLE_KEY` em Server Actions exige muito cuidado para não permitir que qualquer usuário consiga resetar senhas aleatórias (Account Takeover).
- **Mitigation**: A Server Action terá uma checagem rígida de autorização antes de efetuar qualquer chamada à API Admin do Supabase. O ID do autor chamador será verificado contra o banco para garantir que é um administrador legítimo.
