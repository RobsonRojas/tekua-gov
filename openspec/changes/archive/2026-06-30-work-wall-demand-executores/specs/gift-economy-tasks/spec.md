## MODIFIED Requirements

### Requirement: Quadro de Tarefas Comunitárias
O sistema SHALL permitir que membros acessem um quadro central para cadastrar e visualizar tarefas solicitadas pela comunidade.

#### Scenario: Cadastro de Nova Tarefa
- **WHEN** um membro autenticado descreve uma tarefa, define o valor em "Surreais" e anexa a localização geográfica aproximada.
- **THEN** a tarefa é registrada com status `pending_approval` e aguarda moderação do Conselho Transversal.

#### Scenario: Aceitação de Tarefa
- **WHEN** um ou múltiplos membros são designados ou clicam em "Assumir Tarefa".
- **THEN** o status muda para "Em Execução" e os nomes de todos os executores selecionados (array `executor_ids`) são vinculados à tarefa.

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal e evidências físicas, estendendo as recompensas a todos os executores envolvidos.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** the executor clica em "Concluir Tarefa" e anexa uma foto.
- **THEN** o sistema captura as coordenadas de GPS no momento do upload e envia para validação do requisitante.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante ou administrador confirma a execução do trabalho.
- **THEN** o sistema SHALL criar (emitir a partir da Tesouraria) e creditar o valor TOTAL em Surreais correspondente na carteira (Wallet) de **CADA UM** dos executores vinculados à tarefa, e registrar as transações no ledger de forma vinculada ao ID da atividade correspondente.
