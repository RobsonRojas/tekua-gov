# transversal-council-workflow Specification

## Purpose
Define o fluxo de trabalho do Conselho Transversal, incluindo permissões especiais para moderação de demandas, acesso a dashboards de aprovação e governança descentralizada da plataforma.
## Requirements
### Requirement: Transversal Council Role
The system SHALL support a specific user role named `transversal_council`.

#### Scenario: Role assignment
- **WHEN** an admin assigns the `transversal_council` role to a user.
- **THEN** the user SHALL keep any other governance capabilities associated with the role, but SHALL NOT gain moderation (approve/reject) powers over Work Wall tasks, since that stage no longer exists.
