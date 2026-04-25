# wallet-system Specification

## Purpose
TBD - created by archiving change user-surreal-digital-currency-wallet. Update Purpose after archive.
## Requirements
### Requirement: Consulta de Saldo e Extrato
O sistema SHALL permitir que o usuário autenticado consulte o saldo atual de sua carteira e o histórico detalhado de movimentações.

#### Scenario: Visualização do Saldo
- **WHEN** o usuário acessa a página `/wallet` ou o card de resumo no Dashboard.
- **THEN** o sistema SHALL exibir o valor total de "Surreais" disponíveis em sua conta.

#### Scenario: Consulta de Extrato
- **WHEN** o usuário solicita o extrato.
- **THEN** o sistema SHALL listar todas as transações (Entradas e Saídas) com data, valor, descrição e destinatário/remetente.

### Requirement: Transferência P2P e Rastreabilidade
O sistema SHALL possibilitar o envio de moedas entre membros da comunidade de forma segura e manter rastreabilidade com as atividades de governança. Toda lógica de transferência MUST ser processada exclusivamente no servidor (Edge Functions) para garantir a integridade.

#### Scenario: Envio de Moedas e Vínculo de Atividade
- **WHEN** o remetente solicita o envio informando o destinatário, valor, justificativa e ID da atividade via API segura.
- **THEN** o sistema SHALL validar o saldo e permissões no servidor, debitar o valor da carteira de origem e creditar na carteira de destino de forma atômica, registrando o `activity_id` para auditoria.

#### Scenario: Saldo Insuficiente
- **WHEN** o remetente tenta enviar um valor maior do que possui em saldo.
- **THEN** a Edge Function SHALL impedir a operação e retornar um erro estruturado de saldo insuficiente.

### Requirement: Gestão de Tesouraria Administrativa
O sistema SHALL prover uma interface para que administradores gerenciem o suprimento de moedas da associação.

#### Scenario: Emissão de Moedas (Minting)
- **WHEN** um administrador emite Surreais para um membro (recompensa manual).
- **THEN** o sistema SHALL debitar da carteira de Tesouraria (ou gerar o saldo institucional) e creditar na carteira do membro.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a integridade financeira e funcional da carteira.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade de componente de carteira/saldo são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado das funções de cálculo e renderização.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de flluxo (E2E) de transferência são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase, garantindo a atomização da transação.

