## MODIFIED Requirements

### Requirement: Registro de Contribuições Individuais
O sistema **SHALL** permitir que qualquer usuário autenticado registre uma atividade realizada em prol da comunidade ou de outro membro, **com ou sem evidência** — a evidência é opcional e sua ausência **MUST NOT** impedir a submissão. Todas as metadatas (título e descrição) **MUST** ser armazenadas como objetos internacionalizados (JSONB) para garantir a correta exibição na interface em diferentes idiomas.

#### Scenario: Submissão com sucesso para a Tesouraria
- **WHEN** O usuário preenche descrição, sugere um valor, anexa uma evidência e seleciona "Tekuá" como beneficiária.
- **THEN** Uma nova contribuição é criada com status `pending` e vinculada à Tesouraria.
- **AND** O título e a descrição são armazenados como objetos de internacionalização `{ pt: "...", en: "..." }`.

#### Scenario: Submissão com sucesso para outro membro
- **WHEN** O usuário seleciona um membro específico da vila como beneficiário.
- **THEN** A contribuição é criada e o beneficiário é notificado para que possa também validar a ação.

#### Scenario: Validação de valor sugerido
- **WHEN** O usuário tenta sugerir um valor negativo ou zero.
- **THEN** O sistema impede a submissão e exibe um erro de validação.

#### Scenario: Evidência opcional no registro de contribuição
- **WHEN** O usuário preenche a descrição e o valor da contribuição e submete o formulário sem anexar foto, documento ou link de evidência.
- **THEN** O sistema aceita a submissão e cria a contribuição em estado de validação pendente.
- **AND** O sistema **MUST NOT** bloquear a submissão, exibir erro ou destacar a evidência como campo obrigatório.
