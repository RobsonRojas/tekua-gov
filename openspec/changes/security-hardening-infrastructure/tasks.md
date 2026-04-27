## 1. Database Infrastructure

- [x] 1.1 Create migration for `security_rate_limits` table to track API usage.
- [x] 1.2 Implement a Supabase cron job (pg_cron) to clean up old rate limit logs.
- [x] 1.3 Create migration to enable RLS on `ledger_entries` table.
- [x] 1.4 Implement RLS policies for `ledger_entries` (allow authenticated read of own entries, admin read all).

## 2. Backend Security (Edge Functions)

- [x] 2.1 Implement `rateLimiter` utility in a new shared folder for Edge Functions.
- [x] 2.2 Integrate the rate limiter into critical functions: `ai-handler`, `api-wallet`, `api-members`.
- [x] 2.3 Create a security headers utility that injects CSP, HSTS, and X-Content-Type-Options.
- [x] 2.4 Update the global `corsHeaders` to include these security headers.

## 3. AI Safety & Prompt Hardening

- [x] 3.1 Refactor `ai-handler` to wrap user input in `<user_input>` tags.
- [x] 3.2 Refactor `ai-handler` to wrap document context in `<document_context>` tags.
- [x] 3.3 Update the Gemini system prompt with explicit instructions to ignore content outside of delimiters.
- [x] 3.4 Implement a basic input pre-processor to detect common injection keywords (e.g., "ignore all previous instructions").
- [x] 3.5 Add strict parameter validation and capping to all tools registered in `ai-handler`.

## 4. Frontend Hardening (XSS & Headers)

- [x] 4.1 Install `dompurify` and `@types/dompurify` dependencies.
- [x] 4.2 Create a `SanitizedHTML` component to centralize safe rendering of user content.
- [x] 4.3 Replace all instances of raw HTML/Markdown rendering with the `SanitizedHTML` component.
- [x] 4.4 Verify that the frontend build configuration (Vercel/Static) correctly propagates security headers.

## 5. Verification

- [x] 5.1 Verify rate limiting triggers a 429 error after exceeding the threshold.
- [x] 5.2 Verify that prompt injection attempts are successfully neutralized by the delimiter/safety instruction layer.
- [x] 5.3 Verify that XSS payloads in user comments are correctly stripped by `DOMPurify`.
- [x] 5.4 Audit RLS policies to ensure `ledger_entries` cannot be accessed by unauthorized users.
