## MODIFIED Requirements

### Requirement: Sidebar Navigation Integrity (navigation-interface)
The system SHALL ensure all navigation items in the sidebar and mobile drawer point to valid, defined routes in the application router.

#### Scenario: Dashboard Navigation
- **WHEN** the user clicks on the "Dashboard" menu item
- **THEN** the system SHALL navigate to the root route `/`

#### Scenario: Work Mural Navigation
- **WHEN** the user clicks on the "Mural de Trabalho" menu item
- **THEN** the system SHALL navigate to the `/work-wall` route

#### Scenario: AI Assistant Navigation
- **WHEN** the user clicks on the "Assistente de IA" menu item
- **THEN** the system SHALL navigate to the `/ai-agent` route

#### Scenario: Admin Panel Navigation
- **WHEN** an administrator clicks on the "Painel Administrativo" menu item
- **THEN** the system SHALL navigate to the `/admin-panel` route

## REMOVED Requirements

### Scenario: Activity History Navigation
**Reason**: O item de menu foi considerado redundante e poluidor do menu lateral, já que o histórico é acessível via Painel Admin ou Perfil.
**Migration**: O acesso ao histórico de atividades administrativos permanece disponível através da aba "Auditoria" no Painel Admin.
