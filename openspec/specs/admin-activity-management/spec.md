# admin-activity-management Specification

## Purpose
TBD - created by archiving change admin-users-activity-history-management. Update Purpose after archive.
## Requirements
### Requirement: Central de Auditoria Global
O portal SHALL fornecer aos administradores uma interface para monitorar todas as interações de todos os membros e gerenciar seus perfis. Esta interface SHALL estar integrada como uma aba no Painel Administrativo e também disponível na visualização individual do perfil do membro. Administradores **MUST** ter a capacidade de redefinir as credenciais de segurança (senha) de qualquer usuário sem afetar sua própria conta.

#### Scenario: Admin redefinindo senha de membro
- **WHEN** um administrador acessa a página de perfil de outro membro (`/profile/[id]`).
- **AND** navega até a aba de Segurança e Senha.
- **AND** preenche uma nova senha e submete o formulário.
- **THEN** o sistema SHALL atualizar a senha do membro visualizado via privilégios administrativos.
- **AND** a senha da conta do administrador SHALL permanecer inalterada.

#### Scenario: Prevenção de alteração por não-admin
- **WHEN** um usuário com nível de privilégio comum tenta alterar a senha de outro usuário.
- **THEN** o sistema SHALL bloquear a requisição e a aba de Segurança e Senha não deve ser renderizada na interface pública do perfil de terceiros.

### Requirement: Análise e Dashboard de Engajamento
O sistema SHALL prover visualizações consolidadas para suporte à tomada de decisão administrativa.

#### Scenario: Gráfico de Atividade Diária
- **WHEN** o administrador visualiza a página de auditoria.
- **THEN** o sistema SHALL exibir um gráfico de barras ou linhas mostrando o volume total de atividades por dia nos últimos 30 dias.

#### Scenario: Resumo por Categoria de Ação
- **WHEN** o administrador filtra as atividades por "Votação".
- **THEN** o sistema SHALL exibir um sumário do total de votos registrados no período selecionado.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Admin Controls on Work Cards
The system SHALL provide inline administrative controls on work/demand cards to allow administrators to directly modify critical validation parameters without navigating to the admin panel.

#### Scenario: Admin editing validation threshold
- **WHEN** an administrator views a work card on the work wall.
- **THEN** the system SHALL display an editable field or control for the `validation_threshold`.
- **AND** any changes made SHALL immediately update the `min_confirmations` required for that specific activity in the database.
- **AND** non-admin users SHALL NOT see or interact with this control.

### Requirement: Exclusão Justificada de Atividades
The system SHALL provide administrators with the capability to forcefully remove or archive any work activity directly from the user interface, provided they supply a justification.

#### Scenario: Admin deleting an activity
- **WHEN** an administrator initiates the deletion of an activity.
- **AND** provides a valid justification text.
- **THEN** the system SHALL remove the activity from public visibility.
- **AND** the system SHALL log the deletion action, the administrator's ID, and the justification text into the audit/history logs.

#### Scenario: Missing justification
- **WHEN** an administrator attempts to delete an activity but leaves the justification empty.
- **THEN** the system SHALL reject the request and prompt for a required justification.

