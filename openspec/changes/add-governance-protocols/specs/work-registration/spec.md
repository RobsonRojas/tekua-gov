## ADDED Requirements

### Requirement: Protocolo opcional em tarefas e demandas
Os formulários de criação de tarefa, criação de demanda e edição de tarefa ou demanda do mural SHALL oferecer um campo opcional de pesquisa e seleção de um protocolo/POP ativo, e o detalhe da atividade SHALL exibir o protocolo vinculado.

#### Scenario: Selecionar um protocolo ao criar
- **WHEN** o membro digita parte do título no campo de protocolo e escolhe um item da lista
- **THEN** a atividade SHALL ser criada vinculada a esse protocolo

#### Scenario: Campo opcional
- **WHEN** o membro envia o formulário sem escolher protocolo
- **THEN** a atividade SHALL ser criada normalmente, sem protocolo

#### Scenario: Alterar ou remover o protocolo na edição
- **WHEN** o solicitante edita a atividade e troca ou limpa o protocolo
- **THEN** o vínculo SHALL ser atualizado ou removido conforme a escolha

#### Scenario: Protocolo arquivado não pode ser escolhido
- **WHEN** o servidor recebe o vínculo a um protocolo arquivado ou inexistente
- **THEN** a chamada SHALL falhar sem criar ou alterar a atividade
- **AND** a atividade que já usa um protocolo depois arquivado SHALL poder ser editada mantendo-o

#### Scenario: Protocolo exibido no detalhe
- **WHEN** a atividade tem um protocolo vinculado
- **THEN** o detalhe SHALL exibir o título do protocolo e permitir abrir o texto completo
