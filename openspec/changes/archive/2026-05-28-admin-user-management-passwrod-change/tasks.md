## 1. Ajustes no Backend (Server Action Segura)

- [x] 1.1 Localizar o arquivo de ações de perfil/autenticação (ex: `src/app/actions.ts` ou pasta `src/actions/auth.ts`).
- [x] 1.2 Criar uma nova função assíncrona `updatePasswordByAdmin(targetUserId, newPassword)`.
- [x] 1.3 Dentro da função, instanciar o Supabase com a `SERVICE_ROLE_KEY`.
- [x] 1.4 Validar rigidamente se a sessão atual pertence a um usuário com `role === 'admin'`. Retornar erro "Unauthorized" se não for.
- [x] 1.5 Chamar `supabase.auth.admin.updateUserById(targetUserId, { password: newPassword })` e retornar sucesso.

## 2. Ajustes no Frontend (Formulário)

- [x] 2.1 Localizar o componente responsável por alterar a senha na página de perfil (ex: `ResetPassword.tsx` ou equivalente renderizado em `/profile/[id]`).
- [x] 2.2 Injetar o contexto para saber se a página pertence ao usuário logado ou a um terceiro (comparando `session.user.id` com o `profile.id` visualizado).
- [x] 2.3 Garantir que o componente de Segurança/Senha **não** seja renderizado se o perfil for de terceiro e o visitante **não** for admin.
- [x] 2.4 No handler de submit (ex: `onSubmit`), criar a condicional:
    - Se for o próprio perfil: chamar a rotina padrão `supabase.auth.updateUser`.
    - Se for perfil de terceiro e for admin: invocar a Server Action criada no passo 1.2, passando o `profile.id`.

## 3. Validação

- [x] 3.1 Logar como Admin, acessar o perfil de um membro qualquer, alterar a senha e garantir que a nova senha funciona para o membro.
- [x] 3.2 Verificar que a senha do administrador não foi modificada.
- [x] 3.3 Logar como membro comum, acessar o perfil de outro membro e confirmar que não é possível ver nem interagir com a troca de senha.
