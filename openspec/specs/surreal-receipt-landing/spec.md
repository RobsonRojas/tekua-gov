# surreal-receipt-landing Specification

## Purpose
Fornece uma p�gina p�blica e sem autentica��o para visualizar detalhes de um recebimento de surreais compartilhado, incluindo incentivo para participar do work-wall e ganhar surreais.
## Requirements
### Requirement: Acesso p�blico ao recibo de surreais
O sistema SHALL permitir que qualquer pessoa (autenticada ou n�o) acesse `/share/surreal/:transactionId` para visualizar detalhes de um recebimento de surreais.

#### Scenario: Usu�rio autenticado acessa link compartilhado
- **WHEN** um usu�rio autenticado navega para `/share/surreal/:validTransactionId`
- **THEN** o sistema SHALL exibir os detalhes do recebimento: valor em surreais, nome do remetente, nome do destinat�rio, descri��o, data

#### Scenario: Usu�rio n�o autenticado acessa link
- **WHEN** um usu�rio n�o autenticado navega para `/share/surreal/:validTransactionId`
- **THEN** o sistema SHALL exibir os mesmos detalhes sem requerer login

#### Scenario: Link inv�lido ou expirado
- **WHEN** um usu�rio navega para `/share/surreal/:invalidTransactionId` (n�o existe, ou ID malformado)
- **THEN** o sistema SHALL exibir mensagem amig�vel "Link inv�lido ou expirado" e oferecer link para login/home

### Requirement: CTA para explorar demandas e work-wall
A p�gina de recibo SHALL incluir uma chamada � a��o incentivando o visitante a ganhar seus pr�prios surreais.

#### Scenario: Bot�o "Explorar demandas"
- **WHEN** um visitante visualiza a p�gina de recibo
- **THEN** o sistema SHALL exibir um bot�o destacado "Explorar demandas" que navega para `/work-wall` (ou `/login` se n�o autenticado)

#### Scenario: Mensagem de engajamento
- **WHEN** a p�gina � carregada
- **THEN** o sistema SHALL exibir uma mensagem convidando o visitante a ganhar seus pr�prios surreais executando atividades na comunidade

### Requirement: Dados estruturados para recibo p�blico
O sistema SHALL resolver a transa��o de surreais a partir do `transactionId` e expor seus dados de forma segura via API p�blica.

#### Scenario: API p�blica retorna dados de recibo
- **WHEN** um cliente chama a a��o `getShareSurrealReceipt` com um `transactionId` v�lido
- **THEN** o endpoint SHALL retornar: `id`, `amount`, `senderName`, `recipientName`, `description`, `createdAt`

#### Scenario: API retorna erro para ID inv�lido
- **WHEN** um cliente chama com `transactionId` que n�o existe ou � malformado
- **THEN** o endpoint SHALL retornar erro 400 com mensagem "Link inv�lido ou expirado"

