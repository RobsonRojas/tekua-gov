# multi-profile-management Specification

## Purpose
Permitir que um único usuário possua múltiplos papéis (roles) e funções organizacionais dentro do sistema, garantindo flexibilidade na atribuição de responsabilidades e controle de acesso granular baseado na união de permissões.

## Requirements

### Requirement: Role Definition and Storage
The system SHALL store multiple roles for each member profile. Roles SHALL include 'admin', 'member', and 'transversal_council'. The system SHALL also support organizational functions/titles (e.g., 'President', 'Director').

#### Scenario: Profile has multiple roles
- **WHEN** a profile is retrieved from the database
- **THEN** it SHALL contain a collection of all assigned roles and functions

### Requirement: Role Assignment
Administrators SHALL be able to assign or remove multiple roles and functions for any member.

#### Scenario: Assigning an additional role
- **WHEN** an administrator selects an additional role for a member and saves
- **THEN** the member's profile SHALL be updated to include the new role while retaining previous ones

### Requirement: Role-Based Access Control (RBAC) with Multiple Roles
The system SHALL grant access if a user possesses ANY of the required roles for a specific action or resource.

#### Scenario: Admin acting as a Member
- **WHEN** a user has both 'admin' and 'member' roles
- **THEN** they SHALL be able to access administrative panels AND take tasks reserved for members
