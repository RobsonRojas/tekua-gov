## Context

The Tekua association requires a digital portal to manage its members and provide them with access to governance services. This project involves building a full-stack web application from scratch using modern web technologies and a serverless backend.

## Goals / Non-Goals

**Goals:**
- Secure authentication system (login/logout/password reset).
- User profile visualization for all authenticated members.
- Administrative dashboard for managing users (view, edit roles, etc.).
- Responsive design using Material UI.
- Automated deployment to Vercel.
- Backend logic implemented through Supabase Edge Functions.

**Non-Goals:**
- Implementation of the actual governance services (e.g., voting systems, document management) in this phase.
- Mobile application (native iOS/Android).
- Integration with external social identity providers (OAuth) - only email/password for now.

## Decisions

- **Framework**: React.js (Vite template) for a fast and efficient development experience.
- **Styling**: Material UI (MUI) for a consistent, professional "Enterprise" look and feel.
- **Backend**: Supabase for Authentication, PostgreSQL Database, and Edge Functions. 
  - **Profiles Schema**: `id`, `full_name`, `role`, `avatar_url`, `created_at`, `language_preference`, `theme_preference`.
  - **Roles**:
    - `admin`: Full access to user management, governance configuration, and audit logs.
    - `moderator`: Can manage documents, moderate voting, and validate specific community tasks.
    - `member`: Standard authenticated user. Can vote, register work, and manage their own profile.
    - `guest`: Authenticated but pending approval or external collaborator with limited read-only access.
- **Data Access & Mutation Policy (Edge Functions First)**:
  - **Mutations**: All state-changing operations (Create/Update/Delete) MUST be performed via **Supabase Edge Functions** to ensure server-side validation, consistency (e.g., currency transfers), and audit logging.
  - **Queries**: Read operations SHOULD use **PostgREST** (direct Supabase client) filtered by robust **Row Level Security (RLS)** policies.
- **Internationalization (i18n)**: 
  - All dynamic content fields (titles, descriptions) that require translation MUST use the **JSONB** format (e.g., `{ "pt": "...", "en": "..." }`).
- **State Management**: React Context API for authentication state and profile data. Use `React Query` for server state and caching.
- **Routing**: **React Router** for RESTful client-side routing (e.g., `/dashboard/members/:id`).
- **Testing**: 
  - **Unit/Component Testing**: **Vitest** + **React Testing Library** for fast, local feedback.
  - **Integration/E2E Testing**: **Playwright** for full-flow verification (Auth, Admin flows).
- **Security**: 
  - Supabase Row Level Security (RLS) to protect data at the database level.
  - Role check in the frontend to hide/show navigation items.
  - Supabase Edge Functions for all mutations.
- **Deployment**: Vercel with GitHub integration for CI/CD.

## Risks / Trade-offs

- **Supabase Edge Functions Cold Starts**: Might introduce slight latency for infrequent operations, but acceptable for an administrative portal.
- **Material UI Bundle Size**: Can be large, but the benefits of rapid development and professional aesthetic outweigh this for the current scope.
- **RLS Complexity**: Managing complex permissions purely through RLS can be tricky; we will supplement this with application-level checks.
- **Integration Test Environment**: Requires a consistent local Supabase setup (e.g., Supabase CLI) for reliable Playwright tests.
