## Purpose

Fornece uma página pública e sem autenticação para visualizar detalhes de um recebimento de surreais compartilhado, incluindo incentivo para participar do work-wall e ganhar surreais.

## ADDED Requirements

### Requirement: Acesso público ao recibo de surreais
O sistema SHALL permitir que qualquer pessoa (autenticada ou não) acesse `/share/surreal/:transactionId` para visualizar detalhes de um recebimento de surreais.

#### Scenario: Usuário autenticado acessa link compartilhado
- **WHEN** um usuário autenticado navega para `/share/surreal/:validTransactionId`
- **THEN** o sistema SHALL exibir os detalhes do recebimento: valor em surreais, nome do remetente, nome do destinatário, descrição, data

#### Scenario: Usuário não autenticado acessa link
- **WHEN** um usuário não autenticado navega para `/share/surreal/:validTransactionId`
- **THEN** o sistema SHALL exibir os mesmos detalhes sem requerer login

#### Scenario: Link inválido ou expirado
- **WHEN** um usuário navega para `/share/surreal/:invalidTransactionId` (não existe, ou ID malformado)
- **THEN** o sistema SHALL exibir mensagem amigável "Link inválido ou expirado" e oferecer link para login/home

### Requirement: CTA para explorar demandas e work-wall
A página de recibo SHALL incluir uma chamada à ação incentivando o visitante a ganhar seus próprios surreais.

#### Scenario: Botão "Explorar demandas"
- **WHEN** um visitante visualiza a página de recibo
- **THEN** o sistema SHALL exibir um botão destacado "Explorar demandas" que navega para `/work-wall` (ou `/login` se não autenticado)

#### Scenario: Mensagem de engajamento
- **WHEN** a página é carregada
- **THEN** o sistema SHALL exibir uma mensagem convidando o visitante a ganhar seus próprios surreais executando atividades na comunidade

### Requirement: Dados estruturados para recibo público
O sistema SHALL resolver a transação de surreais a partir do `transactionId` e expor seus dados de forma segura via API pública.

#### Scenario: API pública retorna dados de recibo
- **WHEN** um cliente chama a ação `getShareSurrealReceipt` com um `transactionId` válido
- **THEN** o endpoint SHALL retornar: `id`, `amount`, `senderName`, `recipientName`, `description`, `createdAt`

#### Scenario: API retorna erro para ID inválido
- **WHEN** um cliente chama com `transactionId` que não existe ou é malformado
- **THEN** o endpoint SHALL retornar erro 400 com mensagem "Link inválido ou expirado"
