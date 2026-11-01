## MODIFIED Requirements

### Requirement: Restrição de Ferramentas a Somente Leitura
Nesta fase, o sistema **MUST** garantir que nenhuma ferramenta executada pela IA possa realizar alterações no estado do banco de dados (escrita). A ferramenta `propose_circle_convocation` é explicitamente permitida como exceção a essa regra porque **não escreve no banco** — ela apenas propõe um rascunho ao usuário para confirmação explícita na interface.

#### Scenario: Tentativa de transferência via IA
- **WHEN** O usuário solicita "Transfira 10 Surreals para o João"
- **THEN** O agente informa educadamente que ainda não possui permissão para realizar transações financeiras diretamente.

#### Scenario: Proposta de convocação de Câmara via ferramenta
- **WHEN** o agente invoca `propose_circle_convocation` com os dados coletados do usuário
- **THEN** o sistema SHALL retornar um evento de rascunho para o frontend — sem gravar nada no banco de dados
- **AND** o banco de dados SHALL ser alterado somente após confirmação explícita do usuário na interface
