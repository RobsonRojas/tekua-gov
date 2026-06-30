# justica-restaurativa-agente Specification

## Purpose
TBD - created by archiving change modulo-justica-restaurativa. Update Purpose after archive.
## Requirements
### Requirement: Interação Baseada em Prompt Especializado
O sistema SHALL disponibilizar um agente de IA instruído exclusivamente com os princípios e passos do Protocolo de Justiça Restaurativa da Tekuá e Comunicação Não Violenta (CNV).

#### Scenario: Início da orientação
- **WHEN** o usuário inicia uma conversa no módulo do Agente de IA de Justiça Restaurativa
- **THEN** o agente se apresenta de forma neutra e empática, perguntando sobre o incômodo do usuário sem pedir nomes, focando nos sentimentos e necessidades.

### Requirement: Orientação de Auto-Reflexão
O agente SHALL incentivar a auto-reflexão antes de qualquer encaminhamento externo, seguindo o Passo 1 do protocolo.

#### Scenario: Conflito primário relatado
- **WHEN** o usuário relata um conflito ou incômodo com outra pessoa
- **THEN** o agente aplica o "Jogo do Espelhamento", perguntando onde aquele comportamento vive no próprio usuário e incentivando a autocompaixão.

### Requirement: Orientação para Diálogo Direto (CNV)
O agente SHALL orientar o usuário a estruturar sua abordagem utilizando a estrutura OSNP (Observação, Sentimento, Necessidade, Pedido) quando for passar para o Passo 2.

#### Scenario: Preparação para o Passo 2
- **WHEN** o usuário informa que já refletiu e precisa conversar com a outra parte
- **THEN** o agente auxilia o usuário a formatar sua mensagem usando a estrutura OSNP, validando se há julgamentos embutidos na "Observação".

### Requirement: Recomendações de Escalada
O agente SHALL reconhecer quando os passos iniciais falharam e recomendar a ativação dos passos 3 ou 4.

#### Scenario: Diálogo direto sem sucesso
- **WHEN** o usuário relata que o diálogo do Passo 2 não funcionou ou que a outra parte não foi receptiva
- **THEN** o agente recomenda o Passo 3 (Mediação Individual) e sugere a busca de um mediador neutro na ecovila.

