## 1. Database Infrastructure

- [ ] 1.1 Create migration for `security_rate_limits` table to track API usage.
- [ ] 1.2 Implement a Supabase cron job (pg_cron) to clean up old rate limit logs.
- [ ] 1.3 Create migration to enable RLS on `ledger_entries` table.
- [ ] 1.4 Implement RLS policies for `ledger_entries` (allow authenticated read of own entries, admin read all).

## 2. Backend Security (Edge Functions)

- [ ] 2.1 Implement `rateLimiter` utility in a new shared folder for Edge Functions.
- [ ] 2.2 Integrate the rate limiter into critical functions: `ai-handler`, `api-wallet`, `api-members`.
- [ ] 2.3 Create a security headers utility that injects CSP, HSTS, and X-Content-Type-Options.
- [ ] 2.4 Update the global `corsHeaders` to include these security headers.

## 3. AI Safety & Prompt Hardening

- [ ] 3.1 Refactor `ai-handler` to wrap user input in `<user_input>` tags.
- [ ] 3.2 Refactor `ai-handler` to wrap document context in `<document_context>` tags.
- [ ] 3.3 Update the Gemini system prompt with explicit instructions to ignore content outside of delimiters.
- [ ] 3.4 Implement a basic input pre-processor to detect common injection keywords (e.g., "ignore all previous instructions").
- [ ] 3.5 Add strict parameter validation and capping to all tools registered in `ai-handler`.

## 4. Frontend Hardening (XSS & Headers)

- [ ] 4.1 Install `dompurify` and `@types/dompurify` dependencies.
- [ ] 4.2 Create a `SanitizedHTML` component to centralize safe rendering of user content.
- [ ] 4.3 Replace all instances of raw HTML/Markdown rendering with the `SanitizedHTML` component.
- [ ] 4.4 Verify that the frontend build configuration (Vercel/Static) correctly propagates security headers.

## 5. Verification

- [ ] 5.1 Verify rate limiting triggers a 429 error after exceeding the threshold.
- [ ] 5.2 Verify that prompt injection attempts are successfully neutralized by the delimiter/safety instruction layer.
- [ ] 5.3 Verify that XSS payloads in user comments are correctly stripped by `DOMPurify`.
- [ ] 5.4 Audit RLS policies to ensure `ledger_entries` cannot be accessed by unauthorized users.
