## MODIFIED Requirements

### Requirement: Recomendações de Escalada
O agente SHALL reconhecer quando os passos iniciais falharam e recomendar a ativação dos passos 3 ou 4. Quando o usuário escolher o Passo 4, o agente SHALL oferecer ativamente a criação de um rascunho de convocação de Câmara Restaurativa via ferramenta, coletando os dados necessários de forma conversacional antes de propor o rascunho.

#### Scenario: Diálogo direto sem sucesso
- **WHEN** o usuário relata que o diálogo do Passo 2 não funcionou ou que a outra parte não foi receptiva
- **THEN** o agente recomenda o Passo 3 (Mediação Individual) e sugere a busca de um mediador neutro na ecovila.

#### Scenario: Escalada para Câmara com coleta de dados
- **WHEN** o usuário indica que a mediação falhou ou que o conflito é de grande impacto coletivo e deseja convocar a Câmara (Passo 4)
- **THEN** o agente SHALL confirmar que os pré-círculos individuais foram considerados, coletar tema e data/hora e propor o rascunho via ferramenta `propose_circle_convocation`
