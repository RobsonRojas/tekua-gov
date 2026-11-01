## Purpose

Habilita o Agente de IA de Justiça Restaurativa a propor um rascunho de convocação de Câmara Restaurativa ao usuário — coletando os dados necessários via diálogo e exibindo um card de confirmação para que o usuário decida se cria a convocação, sem que o agente realize qualquer gravação diretamente.

## ADDED Requirements

### Requirement: Coleta conversacional de dados para convocação de Câmara
Quando o usuário atingir o Passo 4 do protocolo e demonstrar intenção de convocar a Câmara, o agente SHALL coletar conversacionalmente os dados necessários: tema do círculo, descrição (opcional), data/hora agendada e local ou link (opcional).

#### Scenario: Coleta do tema da convocação
- **WHEN** o usuário expressa intenção de convocar a Câmara Restaurativa
- **THEN** o agente SHALL solicitar o tema do círculo antes de qualquer outro campo

#### Scenario: Coleta da data e hora agendada
- **WHEN** o tema foi informado
- **THEN** o agente SHALL solicitar a data e horário pretendidos para a realização do círculo

#### Scenario: Campos opcionais tratados como opcionais
- **WHEN** o usuário indica que não quer informar descrição ou local/link
- **THEN** o agente SHALL aceitar a ausência desses campos e prosseguir

### Requirement: Proposta de rascunho de convocação via function calling
Quando todos os dados obrigatórios (tema e data/hora) forem coletados, o agente SHALL invocar a ferramenta `propose_circle_convocation`, que produz um rascunho visível ao usuário na interface — sem criar a convocação no banco de dados.

#### Scenario: Agente invoca ferramenta com dados completos
- **WHEN** o agente possui tema e data/hora futura válidos
- **THEN** o sistema SHALL executar `propose_circle_convocation` com os parâmetros coletados e emitir um evento `tool_draft` para o frontend

#### Scenario: Rascunho exibido ao usuário para confirmação
- **WHEN** o evento `tool_draft` é recebido pelo frontend
- **THEN** o sistema SHALL exibir um card de confirmação com todos os dados do rascunho: tema, data/hora, descrição e local/link (quando presentes)
- **AND** o card SHALL conter botões "Confirmar convocação" e "Cancelar"

#### Scenario: Confirmação cria a convocação
- **WHEN** o usuário clica em "Confirmar convocação" no card de rascunho
- **THEN** o frontend SHALL chamar `createRestorativeCircle` via `api-governance` com os dados do rascunho
- **AND** exibir feedback de sucesso ou erro na interface de chat

#### Scenario: Cancelamento descarta o rascunho
- **WHEN** o usuário clica em "Cancelar" no card de rascunho
- **THEN** o rascunho SHALL ser descartado sem nenhuma chamada à API
- **AND** o agente SHALL continuar disponível para nova interação

### Requirement: Confirmação obrigatória de pré-círculos antes do rascunho
O agente SHALL informar e obter confirmação verbal do usuário de que os pré-círculos individuais foram considerados antes de propor o rascunho de convocação.

#### Scenario: Confirmação de pré-círculos
- **WHEN** o agente vai propor a convocação
- **THEN** o agente SHALL perguntar se o usuário confirma que os pré-círculos individuais foram realizados ou considerados
- **AND** somente invocar `propose_circle_convocation` após confirmação afirmativa do usuário

### Requirement: Validação de data futura no rascunho
O agente SHALL rejeitar datas passadas ou imediatamente presentes antes de invocar a ferramenta.

#### Scenario: Data inválida informada
- **WHEN** o usuário informa uma data que já passou ou está no presente imediato
- **THEN** o agente SHALL informar que a data precisa ser futura e solicitar nova data
