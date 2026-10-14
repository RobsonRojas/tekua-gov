## MODIFIED Requirements

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal, com evidências físicas opcionais, estendendo as recompensas a todos os executores envolvidos. O envio de prova (foto) é opcional para concluir a tarefa.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** o executor clica em "Concluir Tarefa" e, opcionalmente, anexa uma foto.
- **THEN** quando uma foto é anexada, o sistema SHALL capturar as coordenadas de GPS no momento do upload e enviar para validação do requisitante; quando nenhuma prova é anexada, o sistema SHALL permitir a conclusão da tarefa e o envio para validação mesmo assim.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante ou administrador confirma a execução do trabalho.
- **THEN** o sistema SHALL criar (emitir a partir da Tesouraria) e creditar o valor TOTAL em Surreais correspondente na carteira (Wallet) de **CADA UM** dos executores vinculados à tarefa, e registrar as transações no ledger de forma vinculada ao ID da atividade correspondente.
