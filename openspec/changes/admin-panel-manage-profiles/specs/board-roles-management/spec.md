## ADDED Requirements

### Requirement: Board Role Definition
The system SHALL define a set of functional board roles typical of philosophical and civil societies.

#### Scenario: Predefined Board Roles
- **WHEN** an administrator views the role assignment options.
- **THEN** the system SHALL provide the following options: Presidente, Vice-Presidente, Secretário, Tesoureiro, Membro da Diretoria, Conselho Fiscal, Diretor Acadêmico, Diretor de Eventos, Diretor de Comunicação, Bibliotecário, and Orador.

### Requirement: Board Membership Status
The system SHALL distinguish between common members and board members (Diretoria).

#### Scenario: Identify Board Members
- **WHEN** a member is assigned any specific board role.
- **THEN** the system SHALL automatically flag them as a "Board Member" (Membro da Diretoria).

### Requirement: Administrative Role Assignment
The system SHALL allow administrators to assign and remove board roles for any member.

#### Scenario: Assign Role to Member
- **WHEN** an administrator selects a member and assigns the role of "Presidente".
- **THEN** the system SHALL update the member's profile with the new role and persist the change in the database.

#### Scenario: Remove Role from Member
- **WHEN** an administrator removes a board role from a member.
- **THEN** the system SHALL clear the functional role and, if no other board roles exist, remove the board member status.
