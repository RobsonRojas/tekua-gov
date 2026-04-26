# edge-api-gateway Specification

## Purpose
TBD - created by archiving change migrate-db-to-edge-functions. Update Purpose after archive.
## Requirements
### Requirement: Centralized API Gateway
The system SHALL provide a suite of Supabase Edge Functions that serve as the exclusive interface for database operations (Create, Read, Update, Delete) from the frontend.

#### Scenario: Successful function invocation
- **WHEN** the frontend invokes an edge function domain (e.g., `api-audit`) with a valid action (e.g., `fetchLogs`) and parameters
- **THEN** the system SHALL verify the user's JWT, execute the database operation, and return the data in a standard JSON format

#### Scenario: Unauthorized access prevention
- **WHEN** a request is made to an edge function without a valid Authorization header
- **THEN** the system SHALL return a 401 Unauthorized error and block database access

### Requirement: API Resilience and Fault Tolerance
The frontend API client SHALL implement mechanisms to prevent application hanging and ensure high availability of data services.

#### Scenario: Authentication session hang
- **WHEN** the API client attempts to retrieve the user's session and the request times out (e.g., > 500ms)
- **THEN** the system SHALL fallback to using the public anonymous key to prevent the UI from hanging.

#### Scenario: SDK independence (Native Fetch)
- **WHEN** performing Edge Function invocations
- **THEN** the system SHALL use a standard fetch-based transport layer to ensure compatibility across different browser environments (e.g., Brave, Chrome) and bypass SDK-level deadlocks.

### Requirement: Unified Error Handling
All Edge Functions SHALL return a standardized error response if a database operation fails or validation rules are violated.

#### Scenario: Database error propagation
- **WHEN** a database constraint is violated during an edge function operation
- **THEN** o sistema SHALL retornar uma resposta JSON contendo um campo `error` com uma mensagem descritiva e um campo `data` nulo.

### Requirement: Demand Creation Action
A Edge Function `api-work` SHALL prover uma ação para criação de demandas por membros.

#### Scenario: Invoke createDemand
- **WHEN** o frontend invoca a ação `createDemand` com os parâmetros necessários
- **THEN** a Edge Function SHALL validar o JWT do usuário e inserir a nova atividade na tabela `activities`.

