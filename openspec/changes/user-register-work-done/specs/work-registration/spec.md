## ADDED Requirements

### Requirement: Registro de Contribuições Individuais
O sistema **SHALL** permitir que qualquer usuário autenticado registre uma atividade realizada em prol da comunidade ou de outro membro.

#### Scenario: Submissão com sucesso para a Tesouraria
- **WHEN** O usuário preenche descrição, sugere um valor, anexa uma evidência e seleciona "Tekuá" como beneficiária.
- **THEN** Uma nova contribuição é criada com status `pending` e vinculada à Tesouraria.

#### Scenario: Submissão com sucesso para outro membro
- **WHEN** O usuário seleciona um membro específico da vila como beneficiário.
- **THEN** A contribuição é criada e o beneficiário é notificado para que possa também validar a ação.

#### Scenario: Validação de valor sugerido
- **WHEN** O usuário tenta sugerir um valor negativo ou zero.
- **THEN** O sistema impede a submissão e exibe um erro de validação.

#### Scenario: Obrigatoriedade de evidência
- **WHEN** O usuário tenta submeter o formulário sem anexar um link ou arquivo de evidência.
- **THEN** O sistema impede a submissão, destacando que a prova de trabalho é obrigatória para a transparência.
