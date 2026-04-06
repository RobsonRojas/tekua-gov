## ADDED Requirements

### Requirement: Solicitação de Recuperação de Senha
O sistema SHALL permitir que usuários solicitem um link de redefinição de senha informando seu endereço de email cadastrado.

#### Scenario: Solicitação com Email Válido
- **WHEN** o usuário insere um email associado a uma conta existente na tela `/forgot-password`.
- **THEN** o sistema envia um email de recuperação via Supabase Auth e exibe uma mensagem de sucesso indicando para verificar a caixa de entrada.

#### Scenario: Solicitação com Email Inexistente
- **WHEN** o usuário insere um email que não possui conta associada.
- **THEN** o sistema deve retornar uma mensagem genérica de sucesso (para evitar enumeração de contas) ou informar que o email não foi encontrado, dependendo da política de privacidade definida.

### Requirement: Redefinição de Senha Segura
O sistema SHALL permitir que usuários com um link de recuperação válido definam uma nova senha para sua conta.

#### Scenario: Redefinição com Link Válido
- **WHEN** o usuário acessa a página `/reset-password` através do link enviado por email.
- **THEN** o sistema exibe um formulário para inserção da nova senha e valida a expiração do token.

#### Scenario: Sucesso na Redefinição
- **WHEN** o usuário insere uma nova senha válida e confirma a alteração.
- **THEN** a senha é atualizada no Supabase e o usuário é redirecionado para a tela de login com uma mensagem de confirmação.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
