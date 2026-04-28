## Why

The Tekuá Governance platform currently lacks explicit safeguards against common modern security threats. As the platform scales, it becomes vulnerable to Denial of Service (DDoS) through Edge Function exhaustion, Prompt Injection attacks on the AI assistant, and potential information leakage. This change establishes a robust security baseline to protect community data and system integrity.

## What Changes

- **Edge Function Rate Limiting**: Implementation of a global rate limiting mechanism to prevent resource exhaustion and cost spikes.
- **AI Security Delimiters & Filtering**: Hardening of the `ai-handler` to prevent prompt injection and system prompt leakage using XML-like delimiters and input pre-processing.
- **Database Schema Hardening**: Auditing of all internal tables (like `ledger_entries`) to ensure strict Row Level Security (RLS) or isolation in private schemas.
- **Frontend Content Sanitization**: Integration of `DOMPurify` to sanitize all user-generated content (Working Wall, comments) against XSS.
- **Security Headers Policy**: Implementation of standard security headers (CSP, HSTS, etc.) across the application.

## Capabilities

### New Capabilities
- `edge-rate-limiting`: Provides a standardized utility for Edge Functions to limit request frequency per user/IP.
- `ai-security-hardening`: Implements defensive prompt engineering and input/output filtering for the AI assistant.
- `frontend-content-security`: Establishes rules for sanitizing user-provided content and managing secure browser headers.

### Modified Capabilities
- `ledger-accounting-system`: Will be updated to require strict RLS on the `ledger_entries` table.
- `edge-api-gateway`: Will be updated to include global requirements for rate limiting and security headers.
- `ai-tool-executor`: Will be updated to require explicit permission checks and parameter validation for all AI-triggered tools.

## Impact

- **Edge Functions**: All existing and future functions will need to integrate the rate limiter.
- **Database**: Modification of schema/permissions for `ledger_entries`.
- **Frontend**: Integration of sanitization libraries and modification of build/deployment headers.
- **AI Assistant**: Redesign of prompt construction and message processing.
