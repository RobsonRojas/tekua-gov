## Purpose

Codificar o princípio de confiança mútua aplicado ao ciclo de tarefas e demandas do Portal Tekuá: a evidência material é sempre um recurso opcional e complementar, jamais um pré-requisito para concluir um trabalho, submeter uma contribuição ou validar e pagar uma atividade.

## ADDED Requirements

### Requirement: Evidência Nunca é Pré-requisito
O sistema SHALL tratar a evidência (foto, documento ou link) como recurso opcional em todo o ciclo de vida de tarefas, demandas e contribuições. A ausência de evidência SHALL NOT bloquear, impedir ou penalizar a criação da atividade, a conclusão do trabalho, a submissão à validação, a confirmação da atividade ou o pagamento da recompensa.

#### Scenario: Registro de contribuição sem nenhuma evidência
- **WHEN** um membro autenticado registra uma contribuição no Mural de Trabalho sem anexar foto, documento ou link de evidência.
- **THEN** o sistema SHALL aceitar e persistir a contribuição com status de validação pendente.
- **AND** o sistema SHALL NOT exibir erro, aviso impeditivo ou destaque de campo obrigatório.

#### Scenario: Conclusão de tarefa sem nenhuma evidência
- **WHEN** o executor de uma tarefa em execução conclui a tarefa sem anexar foto, documento ou link de evidência.
- **THEN** o sistema SHALL transicionar a tarefa para o estado de validação pendente.
- **AND** o sistema SHALL NOT exigir segunda etapa, página intermediária ou confirmação adicional por falta de evidência.

#### Scenario: Confirmação de atividade sem evidência anexada
- **WHEN** o requisitante ou um membro da comunidade confirma uma atividade que foi concluída sem nenhuma evidência.
- **THEN** o sistema SHALL registrar a confirmação e executar o pagamento da recompensa normalmente.

#### Scenario: Comprovação de ausência de evidência
- **WHEN** o sistema exibe uma atividade concluída sem nenhuma evidência anexada.
- **THEN** o sistema SHALL exibi-la normalmente, sem sinalização de pendência, bloqueio ou estado intermediário adicional.

### Requirement: Conclusão como Ato do Executor
O sistema SHALL permitir que somente o executor da atividade (ou um administrador do sistema) registre a conclusão de um trabalho, e SHALL permitir que a conclusão seja feita com ou sem evidência. O sistema SHALL NOT permitir que um terceiro não relacionado conclua a atividade.

#### Scenario: Conclusão pelo executor
- **WHEN** o executor de uma tarefa em execução solicita a conclusão da tarefa.
- **THEN** o sistema SHALL transicionar a atividade para o estado de validação pendente e registrar o executor como responsável pela conclusão.

#### Scenario: Conclusão por terceiro não relacionado
- **WHEN** um usuário autenticado que não é executor nem administrador solicita a conclusão de uma atividade em execução.
- **THEN** o sistema SHALL recusar a operação e informar que somente o executor da tarefa pode concluí-la.

#### Scenario: Conclusão por administrador
- **WHEN** um administrador do sistema solicita a conclusão de uma atividade em execução.
- **THEN** o sistema SHALL permitir a conclusão da atividade.

### Requirement: Comunicação do Princípio de Confiança Mútua
O sistema SHALL comunicar de forma explícita, nos pontos de entrada do fluxo de conclusão e registro, que a evidência é opcional e que a validação se apoia na confiança mútua entre os membros. O sistema SHALL NOT apresentar a comprovação material como obrigação nem utilizar linguagem que sugira pendência quando ela não existir.

#### Scenario: Rótulo da seção de evidências
- **WHEN** o usuário visualiza o formulário de registro de contribuição ou o formulário de conclusão de tarefa.
- **THEN** o sistema SHALL rotular a seção de evidências indicando que ela é opcional.

#### Scenario: Mensagem de confiança mútua
- **WHEN** o usuário visualiza o formulário de conclusão de tarefa ou o formulário de registro de contribuição.
- **THEN** o sistema SHALL exibir uma mensagem informativa de que a conclusão se apoia na confiança mútua e de que a evidência é opcional.

#### Scenario: Linguagem da ação de conclusão
- **WHEN** o usuário visualiza a ação de conclusão de uma tarefa.
- **THEN** o sistema SHALL apresentá-la como conclusão do trabalho, e não como envio obrigatório de prova.

### Requirement: Evidência como Recurso Complementar
O sistema SHALL permitir que o executor registre evidência de forma opcional, antes ou depois da conclusão, e SHALL mantê-la disponível para consulta dos demais membros no visualizador seguro de evidências. A presença de evidência SHALL NOT alterar o critério, o quórum ou o resultado da validação.

#### Scenario: Evidência anexada após a conclusão
- **WHEN** o executor de uma atividade já submetida à validação anexa evidência posterior.
- **THEN** o sistema SHALL armazenar e exibir a evidência junto da atividade.

#### Scenario: Evidência não altera o quórum
- **WHEN** uma atividade com evidência anexada e outra atividade sem nenhuma evidência são submetidas à validação pelo mesmo método.
- **THEN** o sistema SHALL aplicar o mesmo critério e o mesmo número de confirmações às duas.

#### Scenario: Nenhum registro de evidência vazio é criado
- **WHEN** uma atividade é criada ou concluída sem nenhuma evidência.
- **THEN** o sistema SHALL NOT criar um registro de evidência com conteúdo vazio para a atividade.
