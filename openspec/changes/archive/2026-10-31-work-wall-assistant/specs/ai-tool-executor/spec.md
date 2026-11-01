## MODIFIED Requirements

### Requirement: Restrição de Ferramentas a Somente Leitura
Nesta fase, o sistema **MUST** garantir que nenhuma ferramenta executada pela IA possa realizar alterações no estado do banco de dados (escrita), com uma única exceção: a ferramenta de criação de atividade (demanda ou tarefa), que **MUST** exigir confirmação explícita do membro antes de gravar, conforme a spec `work-wall-assistant`. Nenhuma outra ferramenta de escrita (transferência, edição, confirmação, exclusão ou assunção de atividade) pode ser executada pela IA.

#### Scenario: Tentativa de transferência via IA
- **WHEN** O usuário solicita "Transfira 10 Surreals para o João".
- **THEN** O agente informa educadamente que ainda não possui permissão para realizar transações financeiras diretamente.

#### Scenario: Criação de atividade via IA exige confirmação
- **WHEN** O modelo solicita a ferramenta de criação de atividade
- **THEN** o sistema SHALL apenas apresentar o rascunho ao membro
- **AND** SHALL gravar a atividade somente após o membro acionar "Criar" na interface

#### Scenario: Escrita fora da ferramenta de criação
- **WHEN** O modelo solicita qualquer ferramenta de escrita diferente da criação de atividade
- **THEN** o sistema SHALL recusar a execução e SHALL NOT alterar o banco de dados
