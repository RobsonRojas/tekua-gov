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
O sistema SHALL possibilitar o envio de moedas entre membros da comunidade de forma segura e manter rastreabilidade com as atividades de governança. Toda lógica de transferência MUST ser processada exclusivamente no servidor (Edge Functions) para garantir a integridade. A interface de transferência MUST permitir que o usuário pesquise e selecione visualmente o destinatário a partir da lista de membros da plataforma, evitando a necessidade de digitar o email manualmente.

#### Scenario: Pesquisa e Seleção de Destinatário
- **WHEN** o usuário abre a interface de transferência de Surreais e começa a digitar o nome de um usuário.
- **THEN** o sistema SHALL apresentar uma lista suspensa (autocomplete) filtrada com os membros da plataforma correspondentes, exibindo nome e email.

#### Scenario: Envio de Moedas e Vínculo de Atividade
- **WHEN** o remetente seleciona um destinatário a partir da busca, informa o valor, justificativa e ID da atividade via API segura.
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

### Requirement: Proteção de Registros do Ledger
O sistema SHALL garantir que os registros individuais do ledger (contabilidade) sejam protegidos contra acesso não autorizado e modificações externas.

#### Scenario: RLS Enforcement on Ledger
- **WHEN** um usuário tenta acessar a tabela `ledger_entries` diretamente via API Client.
- **THEN** o sistema SHALL permitir a leitura apenas das entradas vinculadas à carteira do próprio usuário (via `wallet_id`) ou permitir leitura total caso o usuário possua a role `admin`.

#### Scenario: Immutable Ledger Records
- **WHEN** qualquer usuário tenta realizar uma operação de `UPDATE` ou `DELETE` na tabela `ledger_entries`.
- **THEN** o sistema SHALL bloquear a operação por padrão, garantindo que o histórico contábil seja imutável via interface direta.

### Requirement: Exibição de QR Code de Recebimento
O sistema SHALL permitir que o usuário autenticado gere e visualize um QR Code contendo o identificador de sua carteira (email) para facilitar o recebimento de transferências presenciais.

#### Scenario: Visualização do próprio QR Code
- **WHEN** o usuário clica no botão "Receber" ou "Meu QR Code" na interface da carteira
- **THEN** o sistema SHALL exibir um modal com o QR Code nítido contendo o email do usuário e seu avatar.

### Requirement: Leitura de QR Code para Transferência
O sistema SHALL permitir o uso da câmera do dispositivo para escanear um QR Code de outro usuário e preencher automaticamente o destinatário na interface de transferência P2P.

#### Scenario: Escaneamento bem sucedido
- **WHEN** o usuário clica em "Escanear QR Code" e aponta a câmera para o QR Code de outro membro
- **THEN** o sistema SHALL ler o código, fechar o feed de vídeo, abrir o formulário de transferência e preencher o campo "Destinatário" automaticamente com o dado lido.

#### Scenario: Permissão de câmera negada
- **WHEN** o usuário clica em "Escanear QR Code" mas o navegador ou sistema operacional bloqueia o acesso à câmera
- **THEN** o sistema SHALL exibir uma mensagem amigável instruindo o usuário a conceder permissão ou a utilizar a busca/digitação manual.

