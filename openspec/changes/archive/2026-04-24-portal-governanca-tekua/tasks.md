## 1. Project Setup
- [x] 1.1 Initialize React project with Vite (TypeScript preferred).
- [x] 1.2 Install dependencies: `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `@supabase/supabase-js`.
- [x] 1.3 Configure MUI theme and base layouts.
- [x] 1.4 Set up basic routing (`/`, `/login`, `/profile`, `/admin-panel`).
- [x] 1.5 Install and configure Vitest, React Testing Library, and Playwright.

## 2. Supabase Configuration
- [x] 2.1 Create Supabase project (provided .env.example).
- [x] 2.2 Define `profiles` table with RLS.
- [x] 2.3 Create a `roles` enumeration or simple string field in `profiles`.
- [x] 2.4 Set up Supabase Client in the React app.

## 3. Authentication
- [x] 3.1 Implement Login page with email/password.
- [x] 3.2 Implement Logout functionality.
- [x] 3.3 Create an `AuthContext` to manage user session and profile globally.
- [x] 3.4 Protect private routes using the `AuthContext`.

## 4. User Profile
- [x] 4.1 Build the `/profile` page using MUI components.
- [x] 4.2 Fetch and display authenticated user data from Supabase.
- [x] 4.3 Add functionality to update profile name.
- [x] 4.4 Add `created_at` to `profiles` and display in the UI as "Membro Desde".

## 5. Admin Panel
- [x] 5.1 Create the `/admin-panel` page restricted to "admin" users.
- [x] 5.2 Implement a list of all users using MUI DataGrid or Table.
- [x] 5.3 Create a Supabase Edge Function to safely update user roles (bypassing client-side RLS for administrative actions).
- [x] 5.4 Connect the UI to the Edge Function to allow role management.

## 6. Deployment
- [x] 6.1 Create `vercel.json` if necessary.
- [x] 6.2 Set up Vercel environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [x] 6.3 Deploy to Vercel and verify all features.

## 7. Testing Implementation
- [x] 7.1 Implement Unit Tests for `AuthContext` using Vitest.
- [x] 7.2 Implement Component Tests for Profile and User Table.
- [x] 7.3 Implement Playwright Integration Tests for Login/Logout flow.
- [x] 7.4 Implement Playwright Integration Tests for Admin access control.
- [x] 7.5 Verify CI integration (running tests on PR).
