## MODIFIED Requirements

### Requirement: Comentários e Menções na Tarefa
O sistema SHALL permitir que usuários insiram comentários em uma tarefa e notifiquem proativamente outros membros utilizando menções ("@").

#### Scenario: Pesquisando Usuários para Menção
- **WHEN** o usuário digita `@` seguido de caracteres no campo de comentário.
- **THEN** o sistema exibe uma lista flutuante de usuários filtrados pela busca.

#### Scenario: Inserindo uma Menção
- **WHEN** o usuário seleciona um membro na lista de busca de menções.
- **THEN** o sistema insere o nome do membro no comentário no formato `@NomeDoUsuario` e o registra como mencionado.

#### Scenario: Notificando Usuários Mencionados
- **WHEN** o usuário envia um comentário que contém menções a outros membros.
- **THEN** o sistema cria uma notificação in-app para cada usuário mencionado.
- **AND** o sistema envia um e-mail para cada usuário mencionado com um link direto para o comentário/tarefa.
