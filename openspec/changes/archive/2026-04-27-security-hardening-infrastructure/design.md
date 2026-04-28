## Context

The current architecture relies on Supabase's default security but lacks protection against application-level attacks such as DDoS (rate limiting), Prompt Injection (AI manipulation), and XSS (frontend input).

## Goals / Non-Goals

**Goals:**
- Prevent resource exhaustion of Edge Functions.
- Neutralize Prompt Injection attempts on the AI Assistant.
- Ensure all user-provided content is rendered safely.
- Implement standard security headers for browser protection.

**Non-Goals:**
- Implementing a full Web Application Firewall (WAF) - this should be handled by the hosting provider (Supabase/Vercel).
- Encrypting data at rest beyond Supabase's default encryption.

## Decisions

### 1. Rate Limiting Strategy
- **Decision**: Use a centralized `security_rate_limits` table in the database to track requests across stateless Edge Function instances.
- **Rationale**: Edge Functions are ephemeral and do not share memory. A lightweight DB table with an index on `(key, window_start)` is sufficient for our current scale and ensures consistency.
- **Alternative**: Redis (Upstash) was considered but adds complexity and external dependency cost.

### 2. Prompt Injection Defense (Delimiters)
- **Decision**: Wrap all dynamic context and user input in XML-like tags (e.g., `<user_input>`, `<document_context>`).
- **Rationale**: Large Language Models (LLMs) like Gemini are highly responsive to structural cues. Delimiters make it harder for user input to "break out" of its context and issue system-level commands.
- **Alternative**: Character escaping. Less effective as attackers can find bypasses.

### 3. Frontend Sanitization
- **Decision**: Use `DOMPurify` at the rendering layer for all Markdown/HTML content.
- **Rationale**: Standard industry practice for preventing XSS. It's lightweight and robust.
- **Alternative**: Custom Regex filtering. Highly prone to errors and bypasses.

### 4. Security Headers Middleware
- **Decision**: Create a shared `corsHeaders` utility in Edge Functions that also includes `X-Content-Type-Options`, `X-Frame-Options`, and `Content-Security-Policy`.
- **Rationale**: Centralizes security policy enforcement for all API responses.

## Risks / Trade-offs

- **[Risk]** Rate limiting table grows too large → **[Mitigation]** Implement a daily cleanup job (Supabase cron) to delete old logs.
- **[Risk]** Delimiters break AI reasoning → **[Mitigation]** Update system prompt to explicitly acknowledge and respect the tags.
- **[Risk]** CSP blocks legitimate resources → **[Mitigation]** Use a permissive but secure initial policy and refine based on monitoring.
