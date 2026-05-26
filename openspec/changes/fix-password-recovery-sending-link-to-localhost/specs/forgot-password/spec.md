## MODIFIED Requirements

### Requirement: Solicitação de Recuperação de Senha
O sistema SHALL permitir que usuários solicitem um link de redefinição de senha informando seu endereço de email cadastrado. O link enviado por email SHALL ser gerado pelo template nativo do Supabase usando `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}`, sem depender de `redirectTo` dinâmico do frontend.

#### Scenario: Solicitação com Email Válido
- **WHEN** o usuário insere um email associado a uma conta existente na tela `/forgot-password`
- **THEN** o sistema SHALL chamar `supabase.auth.resetPasswordForEmail(email)` sem `redirectTo` e exibir mensagem de sucesso orientando o usuário a verificar o email

#### Scenario: Solicitação com Email Inexistente
- **WHEN** o usuário insere um email que não possui conta associada
- **THEN** o sistema SHALL retornar uma mensagem genérica de sucesso (para evitar enumeração de contas)

#### Scenario: Link aponta para domínio configurado no Supabase
- **WHEN** o email de recuperação é enviado
- **THEN** o link SHALL apontar para `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}` onde `SiteURL` é o domínio configurado no Supabase Auth Dashboard

### Requirement: Redefinição de Senha Segura
O sistema SHALL validar tanto o email (`?e=`) quanto o token hash (`?t=`) recebidos na URL do link de recuperação, e SHALL permitir a redefinição de senha apenas após validação bem-sucedida de ambos.

#### Scenario: Redefinição com Link Válido
- **WHEN** o usuário acessa `/reset-password?e=<email>&t=<token_hash>` através do link enviado por email
- **THEN** o sistema SHALL chamar `supabase.auth.verifyOtp({ email, token_hash, type: 'recovery' })` para validar ambos os parâmetros e exibir o formulário de nova senha

#### Scenario: Token hash inválido ou expirado
- **WHEN** o usuário acessa a página com `?t=` inválido ou expirado
- **THEN** o sistema SHALL exibir mensagem de erro e botão para voltar ao login, sem exibir o formulário de senha

#### Scenario: Parâmetros ausentes na URL
- **WHEN** o usuário acessa `/reset-password` sem `?e=` ou `?t=`
- **THEN** o sistema SHALL exibir mensagem de erro indicando que a solicitação é inválida ou expirou

#### Scenario: Sucesso na Redefinição
- **WHEN** o `verifyOtp` é bem-sucedido e o usuário insere e confirma uma nova senha válida
- **THEN** o sistema SHALL chamar `supabase.auth.updateUser({ password })` para definir a nova senha e redirecionar para o login em 3 segundos
