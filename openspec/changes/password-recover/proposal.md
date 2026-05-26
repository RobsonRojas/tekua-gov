## Why

Permitir que usuários que esqueceram suas senhas possam recuperá-las de forma segura e autônoma, validando o token do Supabase e o e-mail da conta com expiração de 30 minutos, exigindo um segundo fator de validação por código de uso único (OTP) enviado por e-mail e enviando um alerta final após a alteração bem-sucedida.

## What Changes

- **Link de Recuperação de Senha**: Adicionado link "Esqueci minha senha" abaixo do botão de login.
- **Envio do Link de Recuperação**: O sistema envia um e-mail contendo um link para redefinição com o e-mail e o token do Supabase. O link expira em 30 minutos.
- **Validação de Token e E-mail**: A página de redefinição valida se o e-mail e o token Supabase são válidos. Se inválidos ou expirados, exibe mensagem de erro apropriada.
- **Segundo Fator (OTP)**: Ao solicitar a redefinição de senha, o sistema envia um e-mail contendo um OTP (One-Time Password) para a conta. O usuário precisa informar o OTP no formulário para prosseguir.
- **Confirmação e Notificação**: Ao finalizar a troca, a senha é alterada no Supabase e um e-mail de notificação de segurança é enviado informando que a senha foi alterada com sucesso.

## Capabilities

### New Capabilities

<!-- No new capabilities needed, we will modify the existing forgot-password capability. -->

### Modified Capabilities

- `forgot-password`: Atualizar o fluxo de recuperação para exigir validação rigorosa de token/e-mail, expiração de 30 minutos, OTP de confirmação e e-mail de notificação final de alteração.

## Impact

- **Frontend**: Componentes de autenticação, tela de login, tela de esqueci senha, tela de redefinição de senha (com entrada de OTP).
- **Backend / Supabase / Database**: Configurações de expiração, tabelas/triggers/funções para envio de e-mails (OTP) e validação de tokens de recuperação.
