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

### Requirement: Transferência P2P (Peer-to-Peer)
O sistema SHALL possibilitar o envio de moedas entre membros da comunidade de forma segura.

#### Scenario: Envio de Moedas
- **WHEN** o remetente informa o email/id do destinatário, o valor e a justificativa e confirma a operação.
- **THEN** o sistema SHALL debitar o valor da carteira de origem e creditar na carteira de destino de forma atômica.

#### Scenario: Saldo Insuficiente
- **WHEN** o remetente tenta enviar um valor maior do que possui em saldo.
- **THEN** o sistema SHALL impedir a operação e exibir um alerta de erro.

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

