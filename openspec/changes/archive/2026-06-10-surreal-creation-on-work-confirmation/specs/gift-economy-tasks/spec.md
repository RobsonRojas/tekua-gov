## MODIFIED Requirements

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal e evidências físicas.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** the executor clica em "Concluir Tarefa" e anexa uma foto.
- **THEN** o sistema captura as coordenadas de GPS no momento do upload e envia para validação do requisitante.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante ou administrador confirma a execução do trabalho.
- **THEN** o sistema SHALL criar (emitir a partir da Tesouraria) e creditar o valor em Surreais correspondente na carteira (Wallet) do executor (worker) e registrar a transação no ledger de forma vinculada ao ID da atividade correspondente.
