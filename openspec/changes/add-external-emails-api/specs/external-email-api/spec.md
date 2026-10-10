## Purpose

Fornece um endpoint dedicado, autenticado por token secreto, para que sistemas externos solicitem o envio de e-mails transacionais para `contato@tekua.com.br`, com remetente/destinatário fixos e entrega resiliente via fila com reprocessamento.

## ADDED Requirements

### Requirement: Autorização por token secreto
O sistema SHALL expor um endpoint dedicado que só aceita solicitações de envio quando apresentado um token secreto válido, comparado em tempo constante, configurado em variável de ambiente.

#### Scenario: Token válido
- **WHEN** um sistema externo chama o endpoint com o token secreto correto
- **THEN** a solicitação é aceita e processada

#### Scenario: Token ausente ou inválido
- **WHEN** o endpoint é chamado sem token ou com token incorreto
- **THEN** o sistema responde com erro de autorização (não autorizado) e não enfileira nem envia nada

#### Scenario: Token não configurado no ambiente
- **WHEN** o endpoint é chamado e o token secreto não está configurado no servidor
- **THEN** o sistema recusa a solicitação (falha fechada) sem revelar detalhes da configuração

### Requirement: Remetente e destinatário fixos
O sistema SHALL endereçar todo e-mail externo sempre de `contato@tekua.com.br` para `contato@tekua.com.br`, sem permitir que o chamador escolha ou sobrescreva o remetente ou o destinatário.

#### Scenario: Envio sempre para o endereço fixo
- **WHEN** um sistema externo envia uma solicitação válida
- **THEN** o e-mail é endereçado usando `contato@tekua.com.br` como remetente e como destinatário

#### Scenario: Tentativa de sobrescrever remetente/destinatário
- **WHEN** o chamador inclui campos de remetente ou destinatário na solicitação
- **THEN** esses valores são ignorados e os endereços fixos são usados

### Requirement: Validação da solicitação
O sistema SHALL exigir os campos `subject` (assunto) e `body` (corpo) e SHALL rejeitar solicitações com payload inválido ou acima dos limites de tamanho definidos, respondendo com erro de cliente.

#### Scenario: Campos obrigatórios ausentes
- **WHEN** uma solicitação é feita sem assunto ou sem corpo
- **THEN** o sistema responde com erro de cliente (requisição inválida) e não enfileira o e-mail

#### Scenario: Payload acima do limite
- **WHEN** assunto ou corpo excedem os limites de tamanho permitidos
- **THEN** o sistema rejeita a solicitação com erro de cliente e não enfileira o e-mail

#### Scenario: Campo opcional de resposta
- **WHEN** o chamador inclui um endereço de resposta opcional válido
- **THEN** o sistema aceita a solicitação e registra esse endereço para resposta

### Requirement: Enfileiramento e entrega resiliente
O sistema SHALL registrar cada solicitação aceita na fila de e-mails com estado pendente e SHALL entregar o e-mail de forma resiliente, reprocessando entregas que falharem, sem perder a solicitação original.

#### Scenario: Solicitação aceita é enfileirada
- **WHEN** uma solicitação válida é aceita
- **THEN** o sistema grava um registro pendente na fila (com assunto, corpo e remetente/destinatário fixos) e responde indicando que a solicitação foi aceita

#### Scenario: Falha transitória de entrega
- **WHEN** a entrega de um e-mail enfileirado falha por erro transitório
- **THEN** o sistema marca o registro como falho e o reprocessa em uma tentativa posterior

#### Scenario: Reprocessamento bem-sucedido
- **WHEN** o reprocessamento de um e-mail enfileirado obtém sucesso junto ao provedor
- **THEN** o sistema marca o registro como enviado

### Requirement: Limitação de taxa de requisições
O sistema SHALL limitar a quantidade de solicitações por origem dentro de uma janela de tempo e SHALL rejeitar o excesso.

#### Scenario: Limite excedido
- **WHEN** uma mesma origem ultrapassa o número permitido de solicitações na janela de tempo
- **THEN** o sistema responde com excesso de requisições e não enfileira o e-mail

### Requirement: Não exposição de segredos
O sistema SHALL NOT registrar o token secreto em logs e SHALL NOT revelar em respostas de erro se o token está configurado ou detalhes internos de execução.

#### Scenario: Erro não revela segredo
- **WHEN** uma solicitação falha por autorização ou validação
- **THEN** a resposta e os logs não contêm o token secreto nem confirmam sua existência

### Requirement: Compatibilidade com a fila de convites existente
O sistema SHALL preservar o comportamento atual da fila para os e-mails de convite já existentes, distinguindo os e-mails externos por um tipo próprio.

#### Scenario: E-mails de convite continuam funcionando
- **WHEN** o reprocessamento encontra um registro marcado como convite (ou sem tipo definido)
- **THEN** o sistema aplica o fluxo de convite existente, inalterado

#### Scenario: E-mails externos usam o provedor de e-mail
- **WHEN** o reprocessamento encontra um registro marcado como externo
- **THEN** o sistema envia o e-mail pelo provedor de e-mail configurado, usando assunto, corpo e endereços fixos
