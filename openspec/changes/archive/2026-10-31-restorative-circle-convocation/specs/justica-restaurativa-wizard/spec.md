## MODIFIED Requirements

### Requirement: Direcionamento para Passos Avançados
O sistema SHALL oferecer orientação para acionar Mediação ou a Câmara Coletiva se as etapas anteriores falharem, e SHALL permitir convocar o círculo restaurativo ao final do Passo 4, conforme a spec `restorative-circle-convocation`.

#### Scenario: Mediação necessária
- **WHEN** o usuário indica que o Diálogo Direto (Passo 2) já ocorreu e não resolveu o problema
- **THEN** o sistema recomenda o Passo 3 (Mediação Individual) e explica como convidar a outra parte de forma sigilosa.

#### Scenario: Escalada para Câmara
- **WHEN** o conflito é de grande impacto coletivo ou o Passo 3 falhou
- **THEN** o sistema orienta como convocar a Câmara Coletiva (Passo 4), enfatizando a importância do consentimento e dos pré-círculos individuais
- **AND** ao acionar a ação final do Passo 4, o sistema SHALL exibir o formulário de convocação do círculo restaurativo, em vez de apenas orientar o usuário a procurar a Equipe de Harmonia.
