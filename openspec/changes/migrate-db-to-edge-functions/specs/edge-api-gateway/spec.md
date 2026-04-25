## ADDED Requirements

### Requirement: Centralized API Gateway
The system SHALL provide a suite of Supabase Edge Functions that serve as the exclusive interface for database operations (Create, Read, Update, Delete) from the frontend.

#### Scenario: Successful function invocation
- **WHEN** the frontend invokes an edge function domain (e.g., `api-audit`) with a valid action (e.g., `fetchLogs`) and parameters
- **THEN** the system SHALL verify the user's JWT, execute the database operation, and return the data in a standard JSON format

#### Scenario: Unauthorized access prevention
- **WHEN** a request is made to an edge function without a valid Authorization header
- **THEN** the system SHALL return a 401 Unauthorized error and block database access

### Requirement: Unified Error Handling
All Edge Functions SHALL return a standardized error response if a database operation fails or validation rules are violated.

#### Scenario: Database error propagation
- **WHEN** a database constraint is violated during an edge function operation
- **THEN** the function SHALL return a JSON response containing an `error` field with a descriptive message and a null `data` field
