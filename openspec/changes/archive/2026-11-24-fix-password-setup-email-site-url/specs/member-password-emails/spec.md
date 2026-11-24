## ADDED Requirements

### Requirement: Falha Explícita quando o Envio de E-mail Não Está Configurado
Quando a configuração de envio de e-mail do servidor estiver incompleta (URL pública do site ou credencial do provedor de e-mail ausentes ou inválidas), o sistema SHALL recusar o envio sem gerar token nem link, SHALL indicar ao administrador, em mensagem compreensível no idioma da interface, que o envio de e-mail não está configurado, e SHALL registrar no log do servidor qual configuração está faltando, sem expor valores de segredos. O sistema SHALL NOT derivar a URL do link a partir de dados da requisição.

#### Scenario: Administrador aciona envio sem configuração
- **WHEN** o administrador confirma o envio de e-mail de troca de senha e o servidor não tem a URL pública do site configurada.
- **THEN** nenhum e-mail é enviado, nenhum token é gerado e o administrador vê a mensagem de que o envio de e-mail não está configurado (e não o erro técnico bruto).

#### Scenario: URL pública inválida
- **WHEN** a URL pública configurada não é uma URL absoluta em HTTPS.
- **THEN** o sistema trata como configuração ausente e recusa o envio com a mesma mensagem.

#### Scenario: Cadastro de membro com e-mail não configurado
- **WHEN** o administrador cadastra um novo membro e o envio de e-mail não está configurado.
- **THEN** o membro é criado, e o administrador é avisado de que o e-mail de finalização de cadastro não foi enviado e deve ser reenviado após a correção da configuração.
