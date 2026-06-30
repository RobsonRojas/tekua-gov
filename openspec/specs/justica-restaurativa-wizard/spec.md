# justica-restaurativa-wizard Specification

## Purpose
TBD - created by archiving change modulo-justica-restaurativa. Update Purpose after archive.
## Requirements
### Requirement: Fluxo de Triagem Estruturado
O sistema SHALL fornecer um Wizard (formulário passo a passo) que mapeia a árvore de decisão do Protocolo de Justiça Restaurativa.

#### Scenario: Acesso inicial ao Wizard
- **WHEN** o usuário acessa o Wizard de Resolução de Conflitos
- **THEN** o sistema exibe a primeira etapa focada no Passo 1, perguntando: "Você já realizou uma auto-reflexão sobre os sentimentos e necessidades relacionados a esse incômodo?"

### Requirement: Direcionamento para Passo 2
O sistema SHALL orientar o usuário a preparar o diálogo direto caso o Passo 1 já tenha sido concluído.

#### Scenario: Auto-reflexão concluída
- **WHEN** o usuário responde "Sim" para a pergunta de auto-reflexão
- **THEN** o Wizard exibe informações sobre o Passo 2 (Diálogo Direto) e oferece campos para ajudar a redigir a mensagem usando CNV (OSNP).

### Requirement: Direcionamento para Passos Avançados
O sistema SHALL oferecer orientação para acionar Mediação ou a Câmara Coletiva se as etapas anteriores falharem.

#### Scenario: Mediação necessária
- **WHEN** o usuário indica que o Diálogo Direto (Passo 2) já ocorreu e não resolveu o problema
- **THEN** o sistema recomenda o Passo 3 (Mediação Individual) e explica como convidar a outra parte de forma sigilosa.

#### Scenario: Escalada para Câmara
- **WHEN** o conflito é de grande impacto coletivo ou o Passo 3 falhou
- **THEN** o sistema orienta como convocar a Câmara Coletiva (Passo 4), enfatizando a importância do consentimento e dos pré-círculos individuais.

