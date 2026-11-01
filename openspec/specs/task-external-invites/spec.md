# task-external-invites Specification

## Purpose
TBD - created by archiving change invite-link-with-surreal-reward. Update Purpose after archive.
## Requirements
### Requirement: Task Invite Generation
The system SHALL allow administrators to generate a unique invitation link and a QR code for any active task.

#### Scenario: Admin generates invite link
- **WHEN** an admin views a task detail page
- **THEN** the system displays a unique invitation link and a corresponding QR code for the task

### Requirement: External User Onboarding via Invite
The system SHALL provide a dedicated onboarding flow for external users who access an invitation link.

#### Scenario: User accesses invite link
- **WHEN** an unauthenticated user navigates to the invitation link
- **THEN** they see a landing page with task details and a prompt to register

#### Scenario: User registers via invite
- **WHEN** a user successfully creates an account after following an invite link
- **THEN** they are automatically added as a participant to the associated task

### Requirement: Reward Notification
The system SHALL clearly communicate the Surreal reward associated with the task during the onboarding flow.

#### Scenario: Reward visibility
- **WHEN** a user views the task invite landing page
- **THEN** the system displays the amount of Surreais they will earn upon successful completion of the task

### Requirement: Bloco de convite externo traduzido e contido no card
O bloco de convite externo exibido ao criador de uma tarefa aberta SHALL usar textos traduzidos no idioma ativo e SHALL manter todo o seu conteúdo dentro da largura do card, sem cortar texto nem empurrar controles para fora.

#### Scenario: Título e instrução traduzidos
- **WHEN** o criador abre a própria tarefa aberta que possui convite
- **THEN** o bloco SHALL exibir o título e a frase de instrução no idioma ativo
- **AND** o bloco SHALL NOT exibir o nome interno de uma chave de tradução

#### Scenario: Link longo cabe no card
- **WHEN** o link do convite é mais largo que o espaço disponível
- **THEN** o link SHALL quebrar em mais de uma linha dentro do card
- **AND** o botão "Copiar" SHALL permanecer visível e utilizável

#### Scenario: Instrução completa visível
- **WHEN** o bloco é exibido em tela estreita ou larga
- **THEN** a frase de instrução SHALL ser exibida por inteiro, quebrando em linhas quando necessário
