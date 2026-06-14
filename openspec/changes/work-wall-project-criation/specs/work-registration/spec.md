## MODIFIED Requirements

### Requirement: Captura de Detalhes da Demanda
O sistema SHALL prover um formulário responsivo (desktop e mobile) para registro detalhado de novas demandas (activities), permitindo que qualquer membro proponha um trabalho a ser validado pelo conselho ou pela comunidade. Opcionalmente, a demanda poderá ser associada a um Projeto existente.

#### Scenario: Submissão Completa com Projeto
- **WHEN** o usuário preenche título, descrição, tipo de recompensa (ex: Surreais), valor estimado, anexa referências, e seleciona um Projeto no dropdown.
- **THEN** o sistema SHALL criar o registro da demanda na tabela `activities` com status "draft" (ou "open" dependendo da governança) salvando a referência no campo `project_id`.

#### Scenario: Submissão sem Projeto
- **WHEN** o usuário preenche os campos obrigatórios mas deixa o campo "Projeto" vazio.
- **THEN** o sistema SHALL registrar a atividade normalmente, deixando a coluna `project_id` nula.

#### Scenario: Criação Rápida de Projeto
- **WHEN** o usuário está no formulário de demanda e percebe que o projeto desejado não existe.
- **THEN** o usuário SHALL ter a opção de "Criar Novo Projeto" diretamente no seletor, o qual abre um dialog de criação rápida e, após criado, autoseleciona o novo projeto no dropdown.
