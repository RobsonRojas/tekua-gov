## MODIFIED Requirements

### Requirement: Redefinição de Senha Segura
O sistema SHALL permitir que usuários com um link de recuperação válido definam uma nova senha para sua conta. Na validação do token através de `verifyOtp` com `token_hash`, o sistema NÃO DEVE incluir o email na requisição, cumprindo os requisitos de segurança da SDK do Supabase.

#### Scenario: Redefinição com Link Válido
- **WHEN** o usuário acessa a página `/reset-password` através do link enviado por email e a aplicação valida o token usando apenas o `token_hash`
- **THEN** o sistema exibe um formulário para inserção da nova senha e valida a expiração do token.

#### Scenario: Sucesso na Redefinição
- **WHEN** o usuário insere uma nova senha válida e confirma a alteração.
- **THEN** a senha é atualizada no Supabase e o usuário é redirecionado para a tela de login com uma mensagem de confirmação.
