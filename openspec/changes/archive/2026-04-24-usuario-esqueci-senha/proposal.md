## Why

Atualmente, o link "Forgot Password" na página de login não possui funcionalidade. Usuários que esquecem suas senhas ficam impossibilitados de acessar o portal sem intervenção manual de um administrador. Este recurso é essencial para a autonomia do usuário e segurança da plataforma.

## What Changes

Implementar o fluxo completo de recuperação de senha:
1.  Criação da página `/forgot-password` para solicitação de redefinição via email.
2.  Integração com o Supabase Auth para envio do email de recuperação.
3.  Implementação da página de redefinição de senha (`/reset-password`).
4.  Atualização das rotas no `App.tsx` para suportar as novas telas.

## Capabilities

### New Capabilities
- `forgot-password`: Permite que o usuário solicite um link de recuperação por email e defina uma nova senha.

### Modified Capabilities
- None

## Impact

- `src/pages/Login.tsx`: Ativação do link de recuperação.
- `src/pages/ForgotPassword.tsx`: Nova página de solicitação.
- `src/pages/ResetPassword.tsx`: Nova página de redefinição.
- `src/router.tsx`: Novas rotas públicas.
- `AuthContext.tsx`: Métodos auxiliares para recovery (opcional, Supabase Auth tem helper direto).
