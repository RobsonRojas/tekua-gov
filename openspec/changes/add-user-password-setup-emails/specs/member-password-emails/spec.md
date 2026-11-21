## Purpose
Permitir que administradores enviem a membros um e-mail de troca de senha e que novos membros recebam, no cadastro, um e-mail para finalizar o cadastro e definir a senha por meio de uma página segura.

## ADDED Requirements

### Requirement: Envio de E-mail de Troca de Senha pelo Administrador
O sistema SHALL permitir que um administrador envie, a partir do painel de gerenciamento de membros, um e-mail de troca de senha para qualquer membro cadastrado. A ação SHALL ser restrita a administradores e SHALL NOT revelar ou alterar a senha atual do membro.

#### Scenario: Envio com sucesso
- **WHEN** o administrador clica em "Enviar e-mail de troca de senha" na linha de um membro e confirma a ação.
- **THEN** o sistema envia ao e-mail do membro uma mensagem com link único para definir nova senha e exibe ao administrador uma confirmação de que o e-mail foi enviado.

#### Scenario: Falha no envio imediato
- **WHEN** o provedor de e-mail está indisponível no momento da solicitação.
- **THEN** o sistema registra o e-mail na fila de reenvio, informa ao administrador que o envio ficou pendente e o e-mail é reenviado automaticamente depois.

#### Scenario: Usuário sem permissão
- **WHEN** um usuário que não é administrador tenta executar a ação de envio.
- **THEN** o sistema recusa a requisição com erro de permissão e nenhum e-mail é enviado.

### Requirement: E-mail de Finalização de Cadastro para Novo Membro
Ao cadastrar um novo membro, o sistema SHALL enviar automaticamente ao e-mail informado uma mensagem de boas-vindas contendo um link para finalizar o cadastro e configurar a senha. A falha no envio SHALL NOT impedir a criação do membro.

#### Scenario: Cadastro dispara e-mail
- **WHEN** o administrador conclui o cadastro de um novo membro com e-mail válido.
- **THEN** o membro é criado e recebe um e-mail com o link para finalizar o cadastro e definir sua senha.

#### Scenario: Falha no envio não bloqueia o cadastro
- **WHEN** o membro é criado mas o envio imediato do e-mail falha.
- **THEN** o membro permanece cadastrado, o e-mail é colocado na fila de reenvio e o administrador é avisado de que o e-mail está pendente.

### Requirement: Página Segura de Configuração de Senha
O link recebido por e-mail SHALL levar a uma página do próprio sistema, servida em HTTPS, que valida um token de uso único e com prazo de validade antes de exibir o formulário de nova senha. O link SHALL NOT conter senha nem credenciais reutilizáveis.

#### Scenario: Link válido
- **WHEN** o membro abre o link do e-mail dentro do prazo de validade.
- **THEN** o sistema valida o token e exibe o formulário para definir e confirmar a nova senha; para links de novo cadastro, a página usa o texto de "finalizar cadastro".

#### Scenario: Link inválido, expirado ou já utilizado
- **WHEN** o membro abre um link com token ausente, inválido, expirado ou já consumido.
- **THEN** o sistema não exibe o formulário e informa que a solicitação não existe ou expirou, oferecendo voltar ao login ou solicitar novo link.

#### Scenario: Senha definida com sucesso
- **WHEN** o membro informa e confirma uma senha que atende aos requisitos mínimos e envia o formulário.
- **THEN** a senha é atualizada, o token não pode ser reutilizado e o membro é redirecionado para o login com mensagem de sucesso.

#### Scenario: Senhas divergentes ou fracas
- **WHEN** as senhas informadas não coincidem ou não atendem ao mínimo exigido.
- **THEN** o sistema exibe o erro correspondente e não altera a senha.
