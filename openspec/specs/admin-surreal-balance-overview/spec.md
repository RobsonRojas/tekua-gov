# admin-surreal-balance-overview Specification

## Purpose
TBD - created by archiving change admin-user-management-view-surreal-balance-for-each-user. Update Purpose after archive.
## Requirements
### Requirement: Saldo de Surreais Visível na Lista de Usuários Admin
A interface administrativa de gerenciamento de usuários SHALL exibir o saldo atual de Surreais (SR$) de cada membro como uma coluna adicional na tabela de usuários. A coluna SHALL ser carregada junto com os dados de perfil em uma única requisição. Membros sem carteira SHALL exibir o valor `0,00 SR$`.

#### Scenario: Visualização do saldo na lista de membros
- **WHEN** um administrador acessa a aba "Gerenciamento de Usuários" no painel administrativo
- **THEN** o sistema SHALL exibir uma coluna "Saldo SR$" para cada membro da lista, mostrando o saldo atual de sua carteira de Surreais formatado com 2 casas decimais

#### Scenario: Membro sem carteira registrada
- **WHEN** a lista de usuários é carregada e um membro não possui entrada na tabela `wallets`
- **THEN** o sistema SHALL exibir `0,00 SR$` para esse membro na coluna de saldo, sem erros ou valores em branco

#### Scenario: Acesso restrito a administradores
- **WHEN** um usuário com papel `member` tenta acessar dados de saldo de outros membros via API
- **THEN** a Edge Function SHALL retornar erro `Forbidden` e nenhum dado de carteira SHALL ser exposto

### Requirement: Dashboard de Economia da Associação
O painel administrativo SHALL disponibilizar uma aba dedicada **"Economia"** com métricas consolidadas da circulação de Surreais na plataforma, incluindo supply total, saldo do Tesouro, ranking de contribuidores e distribuição por holder.

#### Scenario: Visualização do supply total
- **WHEN** um administrador acessa a aba "Economia" do painel administrativo
- **THEN** o sistema SHALL exibir o total de Surreais em circulação entre todos os membros (excluindo o Tesouro), o saldo atual do Tesouro e o número total de transações realizadas na plataforma

#### Scenario: Ranking de top contribuidores
- **WHEN** um administrador acessa a aba "Economia"
- **THEN** o sistema SHALL exibir uma lista dos até 10 membros com maior número de tarefas concluídas (`activities.status = 'completed'` e `worker_id = profile.id`), exibindo nome, avatar, quantidade de tarefas e saldo atual em SR$

#### Scenario: Top holders por saldo
- **WHEN** um administrador acessa a aba "Economia"
- **THEN** o sistema SHALL exibir uma lista dos até 10 membros com maior saldo de Surreais, exibindo nome, avatar e saldo atual em SR$

#### Scenario: Acesso exclusivo para admin
- **WHEN** um usuário sem papel `admin` tenta acessar a aba "Economia" ou a ação `fetchEconomyStats` da API
- **THEN** o sistema SHALL bloquear o acesso e retornar erro de autorização

