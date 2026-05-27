## MODIFIED Requirements

### Requirement: Solicitação de Recuperação de Senha
O sistema SHALL permitir que usuários que tenham esquecido a senha acessem a página de recuperação através de um link abaixo do botão de login e solicitem um link de redefinição de senha informando seu endereço de email cadastrado. O link de redefinição enviado por e-mail deve conter o e-mail da conta e o token do Supabase correspondente, expirando em 30 minutos.

#### Scenario: Acesso à Página e Solicitação com Email Válido
- **WHEN** o usuário clica no link "Esqueci minha senha" abaixo do botão de login, é redirecionado para a tela `/forgot-password`, insere um e-mail associado a uma conta existente e envia o formulário.
- **THEN** o sistema gera um token de recuperação válido por 30 minutos, envia um e-mail de recuperação via Supabase contendo o link `/reset-password?email={email}&token={token}` e exibe uma mensagem de sucesso instruindo o usuário a verificar sua caixa de entrada.

#### Scenario: Solicitação com Email Inexistente
- **WHEN** o usuário insere um e-mail não cadastrado na tela `/forgot-password` e envia o formulário.
- **THEN** o sistema exibe uma mensagem de sucesso genérica (ou informando que se o e-mail existir, o link foi enviado) para evitar enumeração de contas, mas nenhum e-mail de recuperação é enviado.

### Requirement: Redefinição de Senha Segura
O sistema SHALL permitir que usuários com um link de recuperação válido (e-mail e token válidos e dentro do prazo de 30 minutos) definam uma nova senha para sua conta. O processo deve exigir um segundo fator de validação com envio de OTP para o e-mail correspondente e posterior envio de e-mail informativo avisando sobre a alteração final da senha.

#### Scenario: Validação de Link de Recuperação Válido
- **WHEN** o usuário acessa a página `/reset-password` contendo os parâmetros de e-mail e token corretos e dentro da expiração de 30 minutos.
- **THEN** o sistema valida as credenciais no Supabase e exibe o formulário para alteração de senha.

#### Scenario: Link de Recuperação Inválido ou Expirado
- **WHEN** o usuário acessa `/reset-password` com parâmetros ausentes, e-mail/token incorretos ou após o prazo de expiração de 30 minutos.
- **THEN** o sistema impede a exibição do formulário de redefinição e exibe uma mensagem informando que a solicitação de troca de senha não existe ou expirou.

#### Scenario: Envio de OTP ao submeter Nova Senha
- **WHEN** o usuário insere uma nova senha válida no formulário de redefinição e clica em alterar.
- **THEN** o sistema gera e envia um código de uso único (OTP) para o e-mail da conta e exibe o formulário de validação de OTP sem ainda atualizar a senha no banco de dados.

#### Scenario: Finalização de Troca de Senha com OTP Válido
- **WHEN** o usuário digita o OTP correto recebido por e-mail no formulário de confirmação.
- **THEN** o sistema finaliza a troca de senha no Supabase, efetua a atualização, redireciona o usuário para a página de login com mensagem de sucesso e envia um e-mail informando que a senha da conta foi alterada com sucesso.

#### Scenario: Tentativa de Redefinição com OTP Inválido
- **WHEN** o usuário digita um OTP incorreto ou expirado na confirmação.
- **THEN** o sistema exibe uma mensagem de erro apropriada e mantém o usuário na tela de confirmação de OTP para que possa tentar novamente ou solicitar reenvio.
