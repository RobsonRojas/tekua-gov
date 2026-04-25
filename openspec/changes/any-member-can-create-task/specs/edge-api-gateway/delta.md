## ADDED Requirements

### Requirement: Demand Creation Action
A Edge Function `api-work` SHALL prover uma ação para criação de demandas por membros.

#### Scenario: Invoke createDemand
- **WHEN** o frontend invoca a ação `createDemand` com os parâmetros necessários
- **THEN** a Edge Function SHALL validar o JWT do usuário e inserir a nova atividade na tabela `activities`.
