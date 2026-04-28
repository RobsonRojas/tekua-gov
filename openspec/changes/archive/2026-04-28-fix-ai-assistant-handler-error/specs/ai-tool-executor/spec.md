## ADDED Requirements

### Requirement: AI Error Resilience & Diagnostics
The system SHALL handle AI service failures gracefully and provide diagnostic information to administrators while maintaining a clean user experience.

#### Scenario: AI Service Unavailable (Missing API Key)
- **WHEN** the `ai-handler` is invoked and the `GEMINI_API_KEY` is missing.
- **THEN** the system SHALL return a clear 500 error code with a descriptive message in the logs and a fallback message for the user.

#### Scenario: Streaming Response Error
- **WHEN** an error occurs during the streaming of an AI response.
- **THEN** the system SHALL emit an `error` event in the event-stream and the frontend SHALL display an appropriate error alert instead of hanging.
