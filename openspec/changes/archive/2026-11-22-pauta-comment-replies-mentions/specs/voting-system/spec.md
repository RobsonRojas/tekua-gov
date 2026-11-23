## ADDED Requirements

### Requirement: Comentários em Pautas com Respostas
O sistema SHALL permitir que membros autenticados comentem em pautas abertas e respondam a comentários existentes, exibindo cada resposta sob o comentário a que se refere.

#### Scenario: Responder a um comentário
- **WHEN** um membro aciona "Responder" em um comentário e envia o texto
- **THEN** o sistema salva a resposta vinculada ao comentário original e a exibe sob ele, em ordem cronológica

#### Scenario: Resposta a uma resposta
- **WHEN** um membro responde a um comentário que já é uma resposta
- **THEN** o sistema vincula a nova resposta ao comentário de nível superior, mantendo um único nível de encadeamento

#### Scenario: Pauta encerrada
- **WHEN** uma pauta tem status `closed`
- **THEN** os comentários existentes continuam visíveis e o sistema rejeita novos comentários e respostas

#### Scenario: Resposta a comentário de outra pauta
- **WHEN** a requisição indica como comentário-pai um comentário que pertence a outra pauta
- **THEN** o sistema rejeita a requisição

### Requirement: Menção de Membros em Comentários
O sistema SHALL permitir mencionar membros ativos nos comentários e respostas de pauta e notificá-los.

#### Scenario: Selecionar membro ao digitar @
- **WHEN** o membro digita `@` seguido de texto no campo de comentário
- **THEN** o sistema lista membros cujo nome corresponde à busca e, ao escolher um, insere seu nome no texto e o registra como mencionado

#### Scenario: Notificação de menção
- **WHEN** um comentário com membros mencionados é salvo
- **THEN** cada membro mencionado, exceto o autor, recebe uma notificação com link para a pauta

#### Scenario: Notificação de resposta
- **WHEN** uma resposta é salva
- **THEN** o autor do comentário original recebe uma notificação, exceto se for o próprio autor da resposta ou se já recebeu notificação de menção para o mesmo comentário

#### Scenario: Menção inválida
- **WHEN** a requisição inclui IDs que não pertencem a membros existentes
- **THEN** o sistema ignora esses IDs e salva o comentário normalmente

#### Scenario: Destaque da menção
- **WHEN** um comentário com menções é exibido
- **THEN** o nome do membro mencionado aparece destacado no texto
